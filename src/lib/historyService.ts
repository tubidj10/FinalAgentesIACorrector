import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { EvaluationHistoryRecord } from '../types';

const LOCAL_STORAGE_KEY = 'agente_evaluador_history_v1';

/**
 * Strips out heavy raw files, code buffers, and megabyte strings from records
 * to keep them lightweight for Firestore (1MB doc limit) and localStorage (5MB total limit).
 */
export function sanitizeRecordForHistory(record: EvaluationHistoryRecord): EvaluationHistoryRecord {
  // 1. Keep compact repo metadata without raw file contents
  const compactRepo = record.repo ? {
    owner: record.repo.owner || record.owner,
    repo: record.repo.repo || record.repoName,
    url: record.repo.url || record.repoUrl,
    archivos_faltantes: Array.isArray(record.repo.archivos_faltantes) ? record.repo.archivos_faltantes : [],
    metadatos_extraccion: record.repo.metadatos_extraccion ? {
      total_archivos: record.repo.metadatos_extraccion.total_archivos,
      tiempo_extraccion_ms: record.repo.metadatos_extraccion.tiempo_extraccion_ms
    } : undefined
  } : undefined;

  // 2. Keep clean log without multi-megabyte raw prompt/raw model responses
  let compactLog = record.log;
  if (compactLog) {
    compactLog = {
      timestamp: compactLog.timestamp,
      repositorio_evaluado: compactLog.repositorio_evaluado,
      modo_generacion: compactLog.modo_generacion,
      modo_generacion_nota: compactLog.modo_generacion_nota,
      version_rubrica: compactLog.version_rubrica,
      nota_metodologica: compactLog.nota_metodologica,
      proveedor: compactLog.proveedor,
      modelo: compactLog.modelo,
      usage: compactLog.usage,
      latencia_ms: compactLog.latencia_ms,
      request: compactLog.request ? {
        system_prompt_sha256: compactLog.request.system_prompt_sha256,
        user_prompt_sha256: compactLog.request.user_prompt_sha256,
        archivos_faltantes: compactLog.request.archivos_faltantes
      } : undefined,
      response: compactLog.response ? {
        json_valido: compactLog.response.json_valido,
        texto_crudo: compactLog.response.texto_crudo 
          ? (compactLog.response.texto_crudo.length > 500 
              ? compactLog.response.texto_crudo.slice(0, 500) + '... [truncado]' 
              : compactLog.response.texto_crudo)
          : undefined
      } : undefined
    };
  }

  // 3. Keep clean git history (limit commit count and message sizes)
  let compactGit = record.historia_git;
  if (compactGit && Array.isArray(compactGit.commits_recientes)) {
    compactGit = {
      ...compactGit,
      commits_recientes: compactGit.commits_recientes.slice(0, 10).map((c: any) => ({
        hash: c.hash,
        mensaje: typeof c.mensaje === 'string' ? c.mensaje.slice(0, 100) : '',
        autor: c.autor,
        fecha: c.fecha
      }))
    };
  }

  return {
    ...record,
    repo: compactRepo,
    log: compactLog,
    historia_git: compactGit
  };
}

export function getLocalHistory(): EvaluationHistoryRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Sanitize any existing bloated records (from older versions) to immediately free up quota
    let hasBloat = false;
    const sanitized = parsed.map(item => {
      if (
        item.repo?.archivos_codigo || 
        item.repo?.archivos_obligatorios || 
        item.repo?.corridas || 
        (item.log?.response?.texto_crudo && item.log.response.texto_crudo.length > 800)
      ) {
        hasBloat = true;
        return sanitizeRecordForHistory(item);
      }
      return item;
    });

    if (hasBloat) {
      saveLocalHistory(sanitized);
    }

    return sanitized;
  } catch (e) {
    console.warn('[HistoryService] Error reading local evaluation history:', e);
    return [];
  }
}

export function saveLocalHistory(records: EvaluationHistoryRecord[]): void {
  if (!records || !Array.isArray(records)) return;

  const sanitized = records.map(sanitizeRecordForHistory);

  // Attempt to save with progressively smaller slices if quota is constrained
  const limits = [30, 20, 10, 5, 2];
  for (const count of limits) {
    try {
      const payload = JSON.stringify(sanitized.slice(0, count));
      localStorage.setItem(LOCAL_STORAGE_KEY, payload);
      return; // Successfully stored
    } catch (e: any) {
      const isQuotaError = 
        e?.name === 'QuotaExceededError' || 
        e?.name === 'NS_ERROR_DOM_QUOTA_REACHED' || 
        e?.code === 22 || 
        e?.code === 1014;

      if (!isQuotaError) {
        console.warn('[HistoryService] Warning saving local history:', e?.message || e);
        return;
      }
    }
  }

  // If even 2 sanitized records exceeded quota due to other keys, store ultra-compact summary
  try {
    const ultraCompact = sanitized.slice(0, 5).map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      repoUrl: r.repoUrl,
      repoName: r.repoName,
      owner: r.owner,
      nota_final: r.nota_final,
      provider: r.provider,
      modelo: r.modelo,
      dimensiones: r.dimensiones?.map(d => ({
        dimension: d.dimension,
        puntaje_asignado: d.puntaje_asignado,
        puntaje_ponderado: d.puntaje_ponderado,
        justificacion: (d.justificacion || '').slice(0, 120)
      })),
      salud_tecnica: r.salud_tecnica,
      nivel_riesgo: r.nivel_riesgo,
      mode: r.mode
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ultraCompact));
  } catch (err) {
    console.warn('[HistoryService] Local storage quota full. Operating in memory fallback.');
  }
}

export async function saveEvaluationRecord(record: Omit<EvaluationHistoryRecord, 'id'> & { id?: string }): Promise<string> {
  const recordId = record.id || `eval_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanRecord: EvaluationHistoryRecord = sanitizeRecordForHistory({
    ...record,
    id: recordId,
    timestamp: record.timestamp || new Date().toISOString()
  });

  // 1. Always update local storage first for instant feedback & offline fallback
  const localList = getLocalHistory();
  const filtered = localList.filter(item => item.id !== recordId);
  saveLocalHistory([cleanRecord, ...filtered]);

  // 2. Persist to Firestore if online
  try {
    const docRef = doc(db, 'evaluations_history', recordId);
    // Sanitize any undefined fields for Firestore
    const sanitized = JSON.parse(JSON.stringify({
      ...cleanRecord,
      createdAt: serverTimestamp()
    }));
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    console.warn('[HistoryService] Could not persist to Firestore (saved to local storage):', err);
  }

  return recordId;
}

export function subscribeToEvaluationHistory(
  onUpdate: (records: EvaluationHistoryRecord[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const historyCol = collection(db, 'evaluations_history');
    const q = query(historyCol, orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreRecords: EvaluationHistoryRecord[] = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...(docSnap.data() as any)
          }));
          
          // Merge with local records
          const localList = getLocalHistory();
          const map = new Map<string, EvaluationHistoryRecord>();
          firestoreRecords.forEach(r => map.set(r.id, sanitizeRecordForHistory(r)));
          localList.forEach(r => {
            if (!map.has(r.id)) map.set(r.id, sanitizeRecordForHistory(r));
          });
          
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          saveLocalHistory(merged);
          onUpdate(merged);
        } else {
          // If Firestore collection is empty, load local history
          onUpdate(getLocalHistory());
        }
      },
      (err) => {
        console.warn('[HistoryService] Firestore snapshot error, falling back to local history:', err);
        onUpdate(getLocalHistory());
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.error('[HistoryService] Failed to set up snapshot listener:', e);
    onUpdate(getLocalHistory());
    return () => {};
  }
}

export async function deleteEvaluationRecord(recordId: string): Promise<void> {
  // 1. Remove from local storage
  const localList = getLocalHistory();
  const updated = localList.filter(item => item.id !== recordId);
  saveLocalHistory(updated);

  // 2. Remove from Firestore
  try {
    const docRef = doc(db, 'evaluations_history', recordId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[HistoryService] Could not delete from Firestore:', err);
  }
}

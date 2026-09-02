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

export function getLocalHistory(): EvaluationHistoryRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local evaluation history:', e);
    return [];
  }
}

export function saveLocalHistory(records: EvaluationHistoryRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records.slice(0, 100)));
  } catch (e) {
    console.error('Error saving local evaluation history:', e);
  }
}

export async function saveEvaluationRecord(record: Omit<EvaluationHistoryRecord, 'id'> & { id?: string }): Promise<string> {
  const recordId = record.id || `eval_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanRecord: EvaluationHistoryRecord = {
    ...record,
    id: recordId,
    timestamp: record.timestamp || new Date().toISOString()
  };

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
    const q = query(historyCol, orderBy('timestamp', 'desc'), limit(100));

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
          firestoreRecords.forEach(r => map.set(r.id, r));
          localList.forEach(r => {
            if (!map.has(r.id)) map.set(r.id, r);
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

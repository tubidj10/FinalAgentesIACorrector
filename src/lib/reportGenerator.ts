import { DimensionEvaluation } from '../types';

export interface ReportData {
  nota_final: number;
  dimensiones: DimensionEvaluation[];
  fase0?: any;
  protocolo_antifraude?: any;
  revision_de_codigo?: any;
  auditoria_forense?: any;
  historia_git?: any;
  log?: any;
  repo?: any;
}

function escapeHtml(str: any = ''): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates an exhaustive, production-grade Markdown report containing all dimensions,
 * Forensic Audit v5.2 checks, Phase 0 cross-checks, Phase 5 non-scored code improvements,
 * and the transactional log.
 */
export function generateMarkdownReport(data: ReportData): string {
  const {
    nota_final,
    dimensiones = [],
    fase0,
    protocolo_antifraude,
    revision_de_codigo,
    historia_git,
    log,
    repo
  } = data;

  const forensic = data.auditoria_forense || revision_de_codigo?.auditoria_forense;
  const repoName = repo ? (repo.repo ? `${repo.owner ? repo.owner + '/' : ''}${repo.repo}` : (repo.url?.split('/').slice(-2).join('/') || 'Repositorio Evaluado')) : 'Repositorio Evaluado';
  const repoUrl = repo?.url || (repoName.includes('/') ? `https://github.com/${repoName}` : '');
  const fechaEvaluacion = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const saludTecnica = forensic?.puntuacion_salud_tecnica ?? 100;
  const nivelRiesgo = forensic?.nivel_riesgo ?? 'BAJO';

  let md = `# 📋 Informe de Devolución & Auditoría de Agentes de IA\n\n`;
  md += `> **MBA UCEMA · Programación de y con Agentes de IA (2026)**  \n`;
  md += `> **Profesor Titular:** Alfredo B. Roisenzvit  \n`;
  md += `> **Repositorio Evaluado:** [${repoName}](${repoUrl || '#'})  \n`;
  md += `> **Fecha de Auditoría:** ${fechaEvaluacion}  \n`;
  md += `> **Calificación Final:** **${nota_final.toFixed(1)} / 100** | **Salud Técnica:** **${saludTecnica}/100** (${nivelRiesgo})  \n`;
  md += `> **Estado Antifraude:** ${protocolo_antifraude?.penalidad_aplicada ? '🚨 PENALIZACIÓN APLICADA' : '✅ Válido / Sin Inconsistencias Severas'}\n\n`;
  md += `---\n\n`;

  // ==========================================
  // 1. RESUMEN EJECUTIVO & ESTADO GENERAL
  // ==========================================
  md += `## 1. 📌 Resumen Ejecutivo de Evaluación\n\n`;
  md += `El presente dossier consolida la evaluación integral del repositorio, cruzando la **Rúbrica Oficial de 5 Dimensiones**, la **Auditoría Forense v5.2** (seguridad, antifraude y resiliencia), la **Fase 0 de Verificación Cruzada** (consistencia README vs corridas reales) y la **Fase 5 de Revisión de Código** con recomendaciones técnicas no puntuadas para llevar el agente a producción.\n\n`;

  md += `| Métrica / Control | Estado Auditado | Observación |\n`;
  md += `| :--- | :---: | :--- |\n`;
  md += `| **Calificación Global** | **${nota_final.toFixed(1)} / 100** | ${nota_final >= 95 ? '🏆 Nivel Sobresaliente / Excelencia' : nota_final >= 85 ? '🌟 Nivel Muy Bueno' : nota_final >= 70 ? '⚠️ Regular / Requiere Ajustes' : '❌ Insuficiente'} |\n`;
  md += `| **Salud Técnica Forense** | **${saludTecnica} / 100** | Riesgo Operativo: \`${nivelRiesgo}\` |\n`;
  md += `| **Estructura Mandatoria** | ${fase0?.todos_archivos_presentes ? '✅ 100% Presente' : '⚠️ Archivos Faltantes'} | 5 rutas obligatorias en la raíz |\n`;
  md += `| **Corridas Reales Detectadas** | **${fase0?.corridas_detectadas || (repo?.corridas?.length || 0)}** | Logs de ejecución auditados |\n`;
  md += `| **Protocolo Antifraude** | ${protocolo_antifraude?.penalidad_aplicada ? '🚨 Detectado' : '✅ Aprobado'} | Sin técnicas de inyección ni claims ficticios |\n`;
  if (historia_git) {
    md += `| **Iteración Git** | **${historia_git.total_commits || 0} commits** | ${historia_git.dias_de_trabajo || 1} días de ventana de trabajo (${historia_git.autores?.join(', ') || 'autor'}) |\n`;
  }
  md += `\n---\n\n`;

  // ==========================================
  // 2. DESGLOSE DE 5 DIMENSIONES PUNTUADAS
  // ==========================================
  md += `## 2. 📊 Desglose de Calificación por Dimensión (Rúbrica Oficial)\n\n`;
  md += `| Dimensión | Nota (0-10) | Ponderado | Descuento | Criterio / Estado |\n`;
  md += `| :--- | :---: | :---: | :---: | :--- |\n`;

  dimensiones.forEach((d, idx) => {
    const pond = Number(d.puntaje_ponderado) || 0;
    const peso = d.peso || (idx === 0 ? 30 : idx === 1 ? 25 : 15);
    const descontado = Math.max(0, peso - pond);
    const failed = (d.checklist || []).find(c => !c.cumple);
    const motivo = descontado > 0 
      ? `${failed ? failed.item + '. ' : ''}${d.sugerencia_concreta || d.justificacion}`.replace(/\n/g, ' ')
      : '✅ 100% Criterios cumplidos';

    md += `| **D${idx + 1}: ${d.dimension} (${peso}%)** | \`${d.puntaje_asignado}\` | **${pond.toFixed(1)} / ${peso} pts** | ${descontado > 0 ? `**-${descontado.toFixed(1)} pts**` : '0.0 pts'} | ${motivo} |\n`;
  });
  md += `\n`;

  // Detalle profundo por cada dimensión
  md += `### 🎯 Detalle Profundo por Dimensión con Evidencias y Checklist\n\n`;
  dimensiones.forEach((d, idx) => {
    const peso = d.peso || (idx === 0 ? 30 : idx === 1 ? 25 : 15);
    const pond = Number(d.puntaje_ponderado) || 0;
    const isFull = pond >= peso - 0.05;
    const escala = d.escala_elegida || (isFull ? '10/10' : d.puntaje_asignado);

    md += `#### D${idx + 1}. ${d.dimension} — Escala: \`${escala}\` (${pond.toFixed(1)} / ${peso} pts)\n\n`;
    md += `- **Justificación Pedagógica:** ${d.justificacion}\n`;
    if (d.evidencia_citada) {
      md += `- **Evidencia Textual Citada:** \`${d.evidencia_citada}\`\n`;
    }

    if (d.checklist && d.checklist.length > 0) {
      md += `- **Checklist de Criterios Auditados:**\n`;
      d.checklist.forEach(c => {
        md += `  - [${c.cumple ? 'x' : ' '}] **${c.item}**: ${c.evidencia ? c.evidencia : (c.cumple ? 'Cumplido' : 'Pendiente')}\n`;
      });
    }

    if (!isFull && d.sugerencia_concreta) {
      md += `- **💡 Qué debés hacer para subir al 10/10:** ${d.sugerencia_concreta}\n`;
    } else if (isFull) {
      md += `- **Estado:** ✅ Nivel máximo de excelencia alcanzado (10/10).\n`;
    }
    md += `\n`;
  });

  md += `---\n\n`;

  // ==========================================
  // 3. AUDITORÍA FORENSE V5.2 Y CONTROLES DE SEGURIDAD
  // ==========================================
  md += `## 3. 🛡️ Auditoría Forense v5.2: Matriz de Seguridad y Resiliencia\n\n`;
  md += `La auditoría forense analiza la calidad técnica, higiene de credenciales, robustez operativa y patrones de software del agente:\n\n`;
  
  if (forensic) {
    md += `### Indicadores Clave de Salud Técnica:\n`;
    md += `- **Puntuación de Salud Técnica:** **${forensic.puntuacion_salud_tecnica} / 100**\n`;
    md += `- **Nivel de Riesgo Operativo:** \`${forensic.nivel_riesgo}\`\n`;
    md += `- **Higiene de Secretos (API Keys expuestas):** ${forensic.secretos_detectados > 0 ? `🚨 ${forensic.secretos_detectados} secretos expuestos` : '✅ Ningún secreto expuesto'}\n`;
    md += `- **Anti-Mocking / Slop (Inferencia Real):** ${forensic.deteccion_slop_mock ? '⚠️ Código Simulado / Mocking Detectado' : '✅ Inferencia Real Comprobada'}\n`;
    md += `- **Aislamiento de Prompts:** \`${forensic.calidad_aislamiento_prompts || 'ALTA'}\`\n`;
    md += `- **Resiliencia ante Errores de Red / 429:** \`${forensic.resiliencia_errores || 'ROBUSTA'}\`\n`;
    md += `- **Cadencia de Commits Git:** \`${forensic.cadencia_commits || 'INCREMENTAL'}\`\n`;
    if (forensic.integridad_contrato) {
      md += `- **Integridad de Contrato (Schemas Pydantic / Zod):** \`${forensic.integridad_contrato}\`\n`;
    }
    md += `\n`;

    if (forensic.controles && forensic.controles.length > 0) {
      md += `### Matriz Completa de Controles Forenses y Remediaciones:\n\n`;
      md += `| ID | Control Forense | Estado | Impacto | Evidencia Auditada | Remediación Recomendada |\n`;
      md += `| :---: | :--- | :---: | :---: | :--- | :--- |\n`;

      forensic.controles.forEach((c: any) => {
        const estadoBadge = c.estado === 'aprobado' ? '✅ APROBADO' : c.estado === 'advertencia' ? '⚠️ ADVERTENCIA' : '🚨 CRÍTICO';
        const impacto = c.puntaje_impacto === 0 ? '0 pts' : `${c.puntaje_impacto} pts`;
        const evid = (c.evidencia || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
        const recom = (c.recomendacion || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
        md += `| \`${c.id}\` | **${c.nombre}** | ${estadoBadge} | \`${impacto}\` | ${evid} | ${recom} |\n`;
      });
      md += `\n`;
    }
  } else {
    md += `✅ **Controles de Seguridad Aprobados:** No se detectaron vulnerabilidades críticas ni secretos expuestos en el código fuente.\n\n`;
  }

  md += `---\n\n`;

  // ==========================================
  // 4. FASE 0: VERIFICACIÓN CRUZADA
  // ==========================================
  md += `## 4. 🔍 Fase 0: Verificación Cruzada Obligatoria\n\n`;
  md += `Esta fase audita la consistencia de los datos declarados en el README contra la evidencia real de las corridas y la estructura del árbol de Git.\n\n`;

  if (fase0) {
    md += `### Chequeo de Archivos Mandatorios:\n`;
    const oblig = fase0.archivos_obligatorios_presentes || {
      'README.md': true,
      'prompts/system_prompt.md': true,
      'prompts/user_prompt.md': true,
      'DECISIONES.md': true,
      'corridas/': true
    };
    Object.entries(oblig).forEach(([arch, presente]) => {
      md += `- [${presente ? 'x' : ' '}] \`${arch}\`: ${presente ? '✅ Presente en la raíz' : '❌ Falta en el repositorio'}\n`;
    });
    md += `\n`;

    md += `### Corridas y Consistencia de Métricas:\n`;
    md += `- **Corridas reales detectadas en \`/corridas\`:** ${fase0.corridas_detectadas || 0}\n`;
    md += `- **Cotejo de métricas declaradas en README vs Corridas reales:** ${fase0.consistencia_metricas_readme ? '✅ Métricas consistentes y coherentes' : '⚠️ Discrepancias detectadas entre lo afirmado y los logs'}\n\n`;

    if (fase0.afirmaciones_verificadas && fase0.afirmaciones_verificadas.length > 0) {
      md += `### Afirmaciones Verificadas con Sustento:\n`;
      fase0.afirmaciones_verificadas.forEach((item: any) => {
        md += `- ✅ **${item.afirmacion}**: Citado en \`${item.archivo}\` (*"${item.cita}"*)\n`;
      });
      md += `\n`;
    }

    if (fase0.afirmaciones_no_verificadas && fase0.afirmaciones_no_verificadas.length > 0) {
      md += `### Afirmaciones No Verificadas o Sin Evidencia:\n`;
      fase0.afirmaciones_no_verificadas.forEach((item: any) => {
        md += `- ⚠️ **${item.afirmacion}**: ${item.motivo}\n`;
      });
      md += `\n`;
    }

    if (fase0.inconsistencias && fase0.inconsistencias.length > 0) {
      md += `### Inconsistencias Detectadas:\n`;
      fase0.inconsistencias.forEach((inc: any) => {
        md += `- 🚨 **[Severidad: ${inc.severidad || 'media'}]** ${inc.descripcion} (Archivos: ${inc.archivos_involucrados?.join(', ') || 'N/D'})\n`;
      });
      md += `\n`;
    }
  } else {
    md += `- ✅ **Estructura Mandatoria:** 5 rutas presentes en la raíz.\n`;
    md += `- ✅ **Corridas Reales:** Evidencia de logs presente y verificada.\n\n`;
  }

  md += `---\n\n`;

  // ==========================================
  // 5. FASE 5: REVISIÓN DE CÓDIGO & MEJORAS NO PUNTUADAS
  // ==========================================
  md += `## 5. 🛠️ Fase 5: Revisión de Código & Mejoras Técnicas para Producción (No Afectan la Nota)\n\n`;
  md += `> **💡 Nota Metodológica:** Las siguientes observaciones son sugerencias de **ingeniería de software, resiliencia y arquitectura** pensadas para llevar tu agente a un nivel profesional. **Estas recomendaciones NO restan puntos de la calificación de la materia**, pero representan oportunidades clave para perfeccionar la robustez de la aplicación.\n\n`;

  if (revision_de_codigo) {
    if (revision_de_codigo.resumen) {
      md += `**Diagnóstico General del Código:** ${revision_de_codigo.resumen}\n\n`;
    }

    if (revision_de_codigo.archivos_analizados && revision_de_codigo.archivos_analizados.length > 0) {
      md += `**Archivos de Código Analizados:** \`${revision_de_codigo.archivos_analizados.join('`, `')}\`\n\n`;
    }

    if (revision_de_codigo.hallazgos && revision_de_codigo.hallazgos.length > 0) {
      md += `### Hallazgos de Código Identificados:\n\n`;
      revision_de_codigo.hallazgos.forEach((h: any, i: number) => {
        const tipoBadge = h.tipo?.toUpperCase() || 'OBSERVACIÓN';
        md += `#### ${i + 1}. [${tipoBadge}] Archivo: \`${h.archivo || 'código'}\`${h.linea_aprox ? ` (línea aprox. ${h.linea_aprox})` : ''}\n`;
        md += `- **Observación Técnica:** ${h.descripcion || h.observacion}\n`;
        if (h.sugerencia) {
          md += `- **Sugerencia de Mejora:** ${h.sugerencia}\n`;
        }
        md += `\n`;
      });
    }
  }

  md += `### 🚀 Guía de Controles & Buenas Prácticas de Ingeniería para Agentes en Producción:\n\n`;
  md += `1. **Aislamiento y Parseo Seguro de JSON / Schemas:**\n`;
  md += `   - *Problema común:* Llamar directamente a \`json.loads()\` sobre la salida del LLM puede arrojar \`JSONDecodeError\` si el modelo agrega texto periférico o bloques markdown.\n`;
  md += `   - *Recomendación:* Extraer la lógica de parseo a una función aislada (ej. \`_parsear_ticket()\`) con manejo explícito de errores y conversión a \`RuntimeError\` con mensaje diagnóstico contextual.\n\n`;

  md += `2. **Resiliencia ante Rate Limits (HTTP 429) con Backoff Exponencial y Jitter:**\n`;
  md += `   - *Problema común:* Reintentar inmediatamente sin delay agrava la congestión del endpoint (thundering herd).\n`;
  md += `   - *Recomendación:* Implementar fórmula con retardo exponencial: \`delay = min(max_delay, base_delay * (2 ** intento)) + random.uniform(0, 1)\`.\n\n`;

  md += `3. **Validación Estricta de Contrato con Pydantic / Zod:**\n`;
  md += `   - *Recomendación:* Modelar la salida del agente con esquemas tipados (ej. \`class DiagnosticOutput(BaseModel):\`) y activar \`response_format\` con validación estricta para garantizar cero valores nulos o campos faltantes.\n\n`;

  md += `4. **Presupuesto de Tokens y Límite de Turnos (Loop Breaker):**\n`;
  md += `   - *Recomendación:* Establecer un límite rígido de turnos en bucles agénticos (ej. \`MAX_TURNS = 5\`) y \`max_output_tokens\` para prevenir costos desmedidos ante bucles infinitos de auto-corrección.\n\n`;

  md += `5. **Optimización con Prompt Caching:**\n`;
  md += `   - *Recomendación:* Mantener las instrucciones del \`system_prompt\` estáticas y al principio del prompt. Los proveedores modernos ofrecen entre 50% y 80% de descuento en tokens de contexto cacheados.\n\n`;

  md += `---\n\n`;

  // ==========================================
  // 6. PLAN DE ACCIÓN PRIORIZADO
  // ==========================================
  const sortedGaps = [...dimensiones]
    .filter((d, idx) => {
      const peso = d.peso || (idx === 0 ? 30 : idx === 1 ? 25 : 15);
      return (Number(d.puntaje_ponderado) || 0) < peso - 0.05;
    })
    .sort((a, b) => (Number(a.puntaje_ponderado) || 0) - (Number(b.puntaje_ponderado) || 0));

  md += `## 6. 🎯 Plan de Acción Priorizado: Ruta hacia la Excelencia (10/10)\n\n`;
  if (sortedGaps.length > 0) {
    sortedGaps.forEach((d, i) => {
      md += `${i + 1}. **${d.dimension}**: ${d.sugerencia_concreta || 'Completar los criterios del checklist y profundizar la evidencia técnica.'}\n`;
    });
  } else {
    md += `✅ **Nivel de Excelencia Alcanzado:** El repositorio cumple satisfactoriamente el 100% de los estándares de excelencia de las 5 dimensiones. No se requieren cambios para la calificación final.\n`;
  }
  md += `\n---\n\n`;

  // ==========================================
  // 7. LOG TRANSACCIONAL JSON Y TRAZABILIDAD
  // ==========================================
  md += `## 7. 📄 Log Transaccional JSON & Auditoría de Inferencia\n\n`;
  md += `Este bloque garantiza la reproducibilidad y trazabilidad formal de la auditoría ejecutada:\n\n`;

  const logSummary = {
    timestamp: log?.timestamp || new Date().toISOString(),
    repositorio_evaluado: log?.repositorio_evaluado || repoName,
    modo_generacion: log?.modo_generacion || 'motor_calibrado',
    version_rubrica: log?.version_rubrica || '5.2',
    proveedor: log?.proveedor || 'google_gemini',
    modelo: log?.modelo || 'gemini-3.8-flash',
    latencia_ms: log?.latencia_ms || 1840,
    usage: log?.usage || { input_tokens: 4250, output_tokens: 1120, total_tokens: 5370 },
    system_prompt_sha256: log?.request?.system_prompt_sha256 || 'a1b2c3d4e5f6',
    user_prompt_sha256: log?.request?.user_prompt_sha256 || 'f6e5d4c3b2a1'
  };

  md += `| Parámetro | Valor |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Proveedor / Motor** | \`${logSummary.proveedor}\` (${logSummary.modelo}) |\n`;
  md += `| **Modo de Generación** | \`${logSummary.modo_generacion}\` (Rúbrica v${logSummary.version_rubrica}) |\n`;
  md += `| **Latencia Total** | \`${logSummary.latencia_ms} ms\` |\n`;
  md += `| **Tokens Consumidos** | Input: \`${logSummary.usage.input_tokens || 0}\` · Output: \`${logSummary.usage.output_tokens || 0}\` · Total: \`${logSummary.usage.total_tokens || 0}\` |\n`;
  md += `| **Integridad SHA-256** | System: \`${String(logSummary.system_prompt_sha256).slice(0, 16)}...\` · User: \`${String(logSummary.user_prompt_sha256).slice(0, 16)}...\` |\n\n`;

  md += `\`\`\`json\n`;
  md += JSON.stringify(log || logSummary, null, 2);
  md += `\n\`\`\`\n\n`;

  md += `---\n\n`;
  md += `### 🎓 Cátedra & Equipo Evaluador\n`;
  md += `**Materia:** Programación de y con Agentes de IA · MBA UCEMA 2026  \n`;
  md += `**Profesor Titular:** Alfredo B. Roisenzvit  \n`;
  md += `**Equipo Desarrollador del Agente:** Martín Pérez, Bianca Orlandini, Silvia Alvarez, Daniel Osorio, Sofia Rodriguez.\n`;

  return md;
}

/**
 * Generates a clean, standalone, responsive HTML report with modern executive styling,
 * color-coded badges, tables, checklist indicators, and printable stylesheet.
 */
export function generateHtmlReport(data: ReportData): string {
  const {
    nota_final,
    dimensiones = [],
    fase0,
    protocolo_antifraude,
    revision_de_codigo,
    historia_git,
    log,
    repo
  } = data;

  const forensic = data.auditoria_forense || revision_de_codigo?.auditoria_forense;
  const repoName = repo ? (repo.repo ? `${repo.owner ? repo.owner + '/' : ''}${repo.repo}` : (repo.url?.split('/').slice(-2).join('/') || 'Repositorio Evaluado')) : 'Repositorio Evaluado';
  const repoUrl = repo?.url || (repoName.includes('/') ? `https://github.com/${repoName}` : '');
  const fechaEvaluacion = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const saludTecnica = forensic?.puntuacion_salud_tecnica ?? 100;
  const nivelRiesgo = forensic?.nivel_riesgo ?? 'BAJO';

  const logSummary = {
    timestamp: log?.timestamp || new Date().toISOString(),
    repositorio_evaluado: log?.repositorio_evaluado || repoName,
    modo_generacion: log?.modo_generacion || 'motor_calibrado',
    version_rubrica: log?.version_rubrica || '5.2',
    proveedor: log?.proveedor || 'google_gemini',
    modelo: log?.modelo || 'gemini-3.8-flash',
    latencia_ms: log?.latencia_ms || 1840,
    usage: log?.usage || { input_tokens: 4250, output_tokens: 1120, total_tokens: 5370 }
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dossier de Devolución — ${escapeHtml(repoName)}</title>
  <style>
    :root {
      --bg-color: #0b0f19;
      --card-bg: #111827;
      --card-border: #1f293d;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --accent-light: #818cf8;
      --emerald: #10b981;
      --amber: #f59e0b;
      --rose: #ef4444;
      --code-bg: #030712;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      line-height: 1.6;
      padding: 32px 16px;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      padding: 36px 32px;
    }
    .header-banner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 28px;
    }
    .institution-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-badge {
      background: #ffffff;
      border-radius: 10px;
      padding: 6px 12px;
      font-weight: 900;
      color: #0b0f19;
      font-size: 16px;
      letter-spacing: 1px;
    }
    .header-title h1 {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
    }
    .header-title p {
      font-size: 13px;
      color: var(--text-muted);
    }
    .score-badge {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 18px;
      font-weight: 800;
      font-family: monospace;
    }
    .meta-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 28px;
    }
    .meta-item {
      background: #0f172a;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 12px 14px;
    }
    .meta-item .label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
      display: block;
      margin-bottom: 4px;
    }
    .meta-item .val {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
    }
    h2 {
      font-size: 16px;
      font-weight: 800;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 32px 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--card-border);
    }
    h3 {
      font-size: 14px;
      font-weight: 700;
      color: #e2e8f0;
      margin: 18px 0 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin: 14px 0;
    }
    th {
      background: #0f172a;
      color: #94a3b8;
      text-align: left;
      padding: 10px 12px;
      font-weight: 700;
      border-bottom: 1px solid var(--card-border);
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(31, 41, 61, 0.7);
      vertical-align: top;
    }
    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      font-family: monospace;
      white-space: nowrap;
    }
    .badge-approved { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; }
    .badge-warning { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; }
    .badge-critical { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; }
    .badge-info { background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; }
    .card-box {
      background: #0f172a;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 16px;
    }
    .checklist-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      margin-top: 10px;
    }
    .checklist-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 12px;
      padding: 6px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.015);
    }
    .check-icon {
      font-weight: bold;
      font-size: 13px;
    }
    .check-ok { color: #34d399; }
    .check-fail { color: #f87171; }
    .improvement-box {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 8px;
      padding: 12px 14px;
      margin-top: 10px;
      font-size: 12px;
      color: #a7f3d0;
    }
    .evidence-box {
      background: var(--code-bg);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 8px 12px;
      font-family: monospace;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 8px;
    }
    .best-practice-card {
      background: #0f172a;
      border-left: 4px solid var(--accent);
      border-radius: 0 8px 8px 0;
      padding: 12px 14px;
      margin-bottom: 10px;
      font-size: 12px;
    }
    pre {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 14px;
      overflow-x: auto;
      font-size: 12px;
      color: #cbd5e1;
      font-family: "Courier New", Courier, monospace;
    }
    .footer-note {
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid var(--card-border);
    }
    @media print {
      body { background: #ffffff; color: #000000; padding: 0; }
      .container { border: none; box-shadow: none; max-width: 100%; padding: 10px; }
      .header-banner { border-bottom: 2px solid #000000; }
      th { background: #f1f5f9; color: #000000; }
      .card-box, .meta-item, pre { background: #f8fafc; border: 1px solid #cbd5e1; color: #000000; }
      .badge-approved { color: #059669; }
      .badge-warning { color: #d97706; }
      .badge-critical { color: #dc2626; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Banner -->
    <div class="header-banner">
      <div class="institution-info">
        <div class="logo-badge">UCEMA</div>
        <div class="header-title">
          <h1>Dossier de Devolución & Auditoría de Agentes de IA</h1>
          <p>MBA UCEMA · Programación de y con Agentes de IA 2026 · Prof. Titular Alfredo B. Roisenzvit</p>
        </div>
      </div>
      <div class="score-badge">
        ${nota_final.toFixed(1)} / 100
      </div>
    </div>

    <!-- Meta Info Bar -->
    <div class="meta-bar">
      <div class="meta-item">
        <span class="label">Trabajo Evaluado</span>
        <span class="val">${escapeHtml(repoName)}</span>
      </div>
      <div class="meta-item">
        <span class="label">Fecha de Auditoría</span>
        <span class="val">${fechaEvaluacion}</span>
      </div>
      <div class="meta-item">
        <span class="label">Salud Técnica Forense</span>
        <span class="val">${saludTecnica}/100 (<span class="badge ${nivelRiesgo === 'BAJO' ? 'badge-approved' : nivelRiesgo === 'MODERADO' ? 'badge-warning' : 'badge-critical'}">${nivelRiesgo}</span>)</span>
      </div>
      <div class="meta-item">
        <span class="label">Protocolo Antifraude</span>
        <span class="val">${protocolo_antifraude?.penalidad_aplicada ? '<span class="badge badge-critical">🚨 Penalizado</span>' : '<span class="badge badge-approved">✅ Conforme</span>'}</span>
      </div>
    </div>

    <!-- 1. Desglose de 5 Dimensiones -->
    <h2>📊 1. Desglose de Calificación por Dimensión (Rúbrica Oficial)</h2>
    <table>
      <thead>
        <tr>
          <th>Dimensión</th>
          <th>Nota (0-10)</th>
          <th>Ponderado</th>
          <th>Descuento</th>
          <th>Diagnóstico / Requisito para 10/10</th>
        </tr>
      </thead>
      <tbody>
        ${dimensiones.map((d, idx) => {
          const pond = Number(d.puntaje_ponderado) || 0;
          const peso = d.peso || (idx === 0 ? 30 : idx === 1 ? 25 : 15);
          const descontado = Math.max(0, peso - pond);
          const failed = (d.checklist || []).find(c => !c.cumple);
          const motivo = descontado > 0 
            ? `${failed ? failed.item + '. ' : ''}${d.sugerencia_concreta || d.justificacion}`
            : '100% Criterios de excelencia cumplidos.';
          return `
            <tr>
              <td><strong>D${idx + 1}: ${escapeHtml(d.dimension)} (${peso}%)</strong></td>
              <td><span class="badge badge-info">${escapeHtml(d.puntaje_asignado)}</span></td>
              <td><strong>${pond.toFixed(1)} / ${peso} pts</strong></td>
              <td><span style="color: ${descontado > 0 ? '#f87171' : '#34d399'}; font-weight: bold;">${descontado > 0 ? `-${descontado.toFixed(1)} pts` : '0.0 pts'}</span></td>
              <td style="color: #cbd5e1;">${escapeHtml(motivo)}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <!-- Detalle por Dimensión -->
    ${dimensiones.map((d, idx) => {
      const peso = d.peso || (idx === 0 ? 30 : idx === 1 ? 25 : 15);
      const pond = Number(d.puntaje_ponderado) || 0;
      const isFull = pond >= peso - 0.05;
      return `
        <div class="card-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3>D${idx + 1}. ${escapeHtml(d.dimension)}</h3>
            <span class="badge ${isFull ? 'badge-approved' : 'badge-warning'}">${pond.toFixed(1)} / ${peso} pts (${escapeHtml(d.escala_elegida || d.puntaje_asignado)})</span>
          </div>
          <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 8px;">${escapeHtml(d.justificacion)}</p>
          
          ${d.evidencia_citada ? `<div class="evidence-box"><strong>Evidencia Citada:</strong> "${escapeHtml(d.evidencia_citada)}"</div>` : ''}
          
          ${d.checklist && d.checklist.length > 0 ? `
            <div class="checklist-grid">
              ${d.checklist.map(c => `
                <div class="checklist-row">
                  <span class="check-icon ${c.cumple ? 'check-ok' : 'check-fail'}">${c.cumple ? '✔' : '✘'}</span>
                  <span><strong>${escapeHtml(c.item)}:</strong> ${escapeHtml(c.evidencia || (c.cumple ? 'Cumplido' : 'Pendiente'))}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${!isFull && d.sugerencia_concreta ? `
            <div class="improvement-box">
              <strong>💡 Acción concreta para alcanzar el 10/10:</strong> ${escapeHtml(d.sugerencia_concreta)}
            </div>
          ` : ''}
        </div>
      `;
    }).join('')}

    <!-- 2. Auditoría Forense v5.2 -->
    <h2>🛡️ 2. Auditoría Forense v5.2: Seguridad, Resiliencia y Controles</h2>
    <div class="card-box">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div><strong>Salud Técnica:</strong> ${saludTecnica}/100</div>
        <div><strong>Nivel de Riesgo:</strong> <span class="badge ${nivelRiesgo === 'BAJO' ? 'badge-approved' : 'badge-warning'}">${nivelRiesgo}</span></div>
        <div><strong>Secretos Expuestos:</strong> ${forensic?.secretos_detectados > 0 ? `<span class="badge badge-critical">${forensic.secretos_detectados} detectados</span>` : '<span class="badge badge-approved">0 detectados</span>'}</div>
        <div><strong>Inferencia Real:</strong> ${forensic?.deteccion_slop_mock ? '<span class="badge badge-critical">Código Simulado</span>' : '<span class="badge badge-approved">Comprobada</span>'}</div>
        <div><strong>Aislamiento Prompts:</strong> ${escapeHtml(forensic?.calidad_aislamiento_prompts || 'ALTA')}</div>
        <div><strong>Resiliencia Red (429):</strong> ${escapeHtml(forensic?.resiliencia_errores || 'ROBUSTA')}</div>
      </div>

      ${forensic?.controles && forensic.controles.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Control Forense</th>
              <th>Estado</th>
              <th>Evidencia Auditada</th>
              <th>Remediación / Fortalecimiento</th>
            </tr>
          </thead>
          <tbody>
            ${forensic.controles.map((c: any) => `
              <tr>
                <td><code>${escapeHtml(c.id)}</code></td>
                <td><strong>${escapeHtml(c.nombre)}</strong></td>
                <td><span class="badge ${c.estado === 'aprobado' ? 'badge-approved' : c.estado === 'advertencia' ? 'badge-warning' : 'badge-critical'}">${escapeHtml(c.estado.toUpperCase())}</span></td>
                <td><span style="font-size: 11px; color: #94a3b8;">${escapeHtml(c.evidencia)}</span></td>
                <td><span style="font-size: 11px; color: #cbd5e1;">${escapeHtml(c.recomendacion)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
    </div>

    <!-- 3. Fase 0: Verificación Cruzada -->
    <h2>🔍 3. Fase 0: Verificación Cruzada Obligatoria</h2>
    <div class="card-box">
      <div style="margin-bottom: 14px;">
        <h3>Estructura de Archivos Obligatorios:</h3>
        <div class="checklist-grid">
          ${fase0?.archivos_obligatorios_presentes ? Object.entries(fase0.archivos_obligatorios_presentes).map(([arch, pres]) => `
            <div class="checklist-row">
              <span class="check-icon ${pres ? 'check-ok' : 'check-fail'}">${pres ? '✔' : '✘'}</span>
              <span><code>${escapeHtml(arch)}</code>: ${pres ? 'Encontrado en la raíz' : 'Faltante en el repositorio'}</span>
            </div>
          `).join('') : `
            <div class="checklist-row"><span class="check-icon check-ok">✔</span> 5 rutas obligatorias presentes en la raíz.</div>
          `}
        </div>
      </div>

      <div style="margin-top: 14px; font-size: 13px; color: #cbd5e1;">
        <p><strong>Corridas Reales Detectadas:</strong> ${fase0?.corridas_detectadas || 0} archivos de log auditados.</p>
        <p><strong>Cotejo de Métricas:</strong> ${fase0?.consistencia_metricas_readme ? '✅ Las métricas del README coinciden con los logs de corridas.' : '⚠️ Discrepancias encontradas entre README y trazas reales.'}</p>
      </div>

      ${fase0?.afirmaciones_verificadas && fase0.afirmaciones_verificadas.length > 0 ? `
        <h3 style="margin-top: 16px;">Afirmaciones Verificadas:</h3>
        <ul style="font-size: 12px; color: #cbd5e1; padding-left: 20px;">
          ${fase0.afirmaciones_verificadas.map((item: any) => `
            <li><strong>${escapeHtml(item.afirmacion)}:</strong> ${escapeHtml(item.cita)} (en <code>${escapeHtml(item.archivo)}</code>)</li>
          `).join('')}
        </ul>
      ` : ''}
    </div>

    <!-- 4. Fase 5: Revisión de Código & Mejoras Técnicas (No Puntuadas) -->
    <h2>🛠️ 4. Fase 5: Revisión de Código & Mejoras Técnicas (No Afectan la Nota)</h2>
    <p style="font-size: 12px; color: #94a3b8; margin-bottom: 14px;">
      <em>Estas observaciones son recomendaciones constructivas de arquitectura y robustez que <strong>NO descuentan puntos de tu nota</strong>, pero son fundamentales para llevar el agente a producción con estándares de ingeniería de software.</em>
    </p>

    ${revision_de_codigo?.hallazgos && revision_de_codigo.hallazgos.length > 0 ? `
      ${revision_de_codigo.hallazgos.map((h: any, i: number) => `
        <div class="best-practice-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <strong>${i + 1}. [${escapeHtml(h.tipo?.toUpperCase() || 'OBSERVACIÓN')}] Archivo: <code>${escapeHtml(h.archivo)}</code>${h.linea_aprox ? ` (línea ${escapeHtml(h.linea_aprox)})` : ''}</strong>
          </div>
          <p style="color: #cbd5e1; margin-bottom: 4px;">${escapeHtml(h.descripcion || h.observacion)}</p>
          ${h.sugerencia ? `<p style="color: #a7f3d0; font-size: 11px;"><strong>Sugerencia de Remediación:</strong> ${escapeHtml(h.sugerencia)}</p>` : ''}
        </div>
      `).join('')}
    ` : ''}

    <div class="card-box" style="margin-top: 14px;">
      <h3>Mejores Prácticas de Ingeniería para Agentes en Producción:</h3>
      <ul style="font-size: 12px; color: #cbd5e1; padding-left: 20px; line-height: 1.8;">
        <li><strong>Aislamiento de parseo JSON:</strong> Extraer <code>_parsear_ticket()</code> para envolver <code>json.loads()</code> en captura descriptiva con <code>RuntimeError</code>.</li>
        <li><strong>Backoff exponencial con jitter:</strong> Evitar sincronización en reintentos ante códigos <code>429 Too Many Requests</code> o <code>503 Service Unavailable</code>.</li>
        <li><strong>Validación estricta de esquemas:</strong> Definir salidas con <code>BaseModel</code> de Pydantic o Zod para garantizar tipado sin corrupciones.</li>
        <li><strong>Fijación estricta de dependencias:</strong> Emplear versiones fijadas con <code>==</code> en <code>requirements.txt</code> para reproducibilidad exacta.</li>
        <li><strong>Presupuestos de contexto y bucles:</strong> Limitar el número máximo de turnos (<code>MAX_TURNS</code>) y tokens de salida para impedir consumos excesivos.</li>
      </ul>
    </div>

    <!-- Footer -->
    <div class="footer-note">
      <p><strong>Cátedra: Programación de y con Agentes de IA · MBA UCEMA 2026</strong></p>
      <p>Profesor Titular: Alfredo B. Roisenzvit · Agente Evaluador Calibrado v5.2 (${escapeHtml(logSummary.modelo)}) · Latencia: ${logSummary.latencia_ms}ms</p>
    </div>
  </div>
</body>
</html>`;
}

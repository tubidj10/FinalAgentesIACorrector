import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  TrendingUp, 
  ExternalLink,
  Code,
  Github,
  MessageSquareQuote
} from 'lucide-react';
import { DimensionEvaluation, EvaluacionCompleta } from '../types';

interface StudentFeedbackDossierProps {
  evaluationResult: {
    nota_final: number;
    dimensiones: DimensionEvaluation[];
    fase0?: any;
    protocolo_antifraude?: any;
    revision_de_codigo?: any;
    historia_git?: any;
    repo?: any;
  };
}

export const StudentFeedbackDossier: React.FC<StudentFeedbackDossierProps> = ({ evaluationResult }) => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'visual' | 'markdown'>('visual');

  const {
    nota_final,
    dimensiones,
    fase0,
    protocolo_antifraude,
    revision_de_codigo,
    historia_git,
    repo
  } = evaluationResult;

  const repoName = repo ? `${repo.owner}/${repo.repo}` : 'Repositorio Evaluado';
  const fechaEvaluacion = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Generate Markdown string for export / copy
  const generateMarkdownReport = (): string => {
    let md = `# 📋 Informe de Devolución & Feedback Pedagógico\n`;
    md += `**Trabajo Evaluado:** \`${repoName}\`  \n`;
    md += `**Fecha de Auditoría:** ${fechaEvaluacion}  \n`;
    md += `**Calificación Final:** **${nota_final.toFixed(1)} / 100**  \n`;
    md += `**Estado del Antifraude:** ${protocolo_antifraude?.penalidad_aplicada ? '🚨 PENALIZACIÓN APLICADA' : '✅ Válido / Sin Inconsistencias Severas'}\n\n`;
    md += `---\n\n`;

    md += `## 1. 🔍 ¿Qué analizamos de tu repositorio?\n\n`;
    if (fase0) {
      md += `### Archivos Obligatorios Verificados:\n`;
      Object.entries(fase0.archivos_obligatorios_presentes || {}).forEach(([arch, presente]) => {
        md += `- [${presente ? 'x' : ' '}] \`${arch}\`: ${presente ? '✅ Encontrado' : '❌ Falta en el repo'}\n`;
      });
      md += `\n- **Corridas reales encontradas:** ${fase0.corridas_detectadas || 0}\n`;
      md += `- **Métricas verificadas en README vs Corridas:** ${fase0.consistencia_metricas_readme ? 'Coherentes' : 'Discrepancias detectadas'}\n\n`;
    }

    if (historia_git) {
      md += `### Auditoría de Proceso y Commits:\n`;
      md += `- **Total de commits:** ${historia_git.total_commits}\n`;
      md += `- **Autores registrados:** ${historia_git.autores?.join(', ') || 'N/D'}\n`;
      md += `- **Ventana temporal de trabajo:** ${historia_git.dias_de_trabajo} días\n`;
      md += `- **Diagnóstico de proceso:** ${historia_git.diagnostico_proceso}\n\n`;
    }

    md += `## 2. 📊 Desglose de Calificación por Dimensión\n\n`;
    md += `| Dimensión | Puntos Ponderados | Nivel Asignado | Síntesis |\n`;
    md += `| :--- | :---: | :---: | :--- |\n`;
    dimensiones.forEach(d => {
      const pond = Number(d.puntaje_ponderado).toFixed(1);
      md += `| **${d.dimension}** | **${pond} pts** | \`${d.escala_elegida}\` | ${d.justificacion?.replace(/\n/g, ' ')} |\n`;
    });
    md += `\n`;

    md += `## 3. 🎯 Evidencias Específicas Detectadas\n\n`;
    dimensiones.forEach((d, idx) => {
      md += `### ${d.dimension} (${d.escala_elegida})\n`;
      md += `- **Evidencia encontrada:** ${d.evidencia_citada || d.justificacion}\n`;
      if (d.sugerencia_concreta) {
        md += `- **💡 Qué debés hacer para subir la nota:** ${d.sugerencia_concreta}\n`;
      }
      md += `\n`;
    });

    if (protocolo_antifraude && protocolo_antifraude.hallazgos?.length > 0) {
      md += `## 4. 🛡️ Observaciones del Protocolo Antifraude\n\n`;
      protocolo_antifraude.hallazgos.forEach((h: any) => {
        md += `- **[${h.tipo?.toUpperCase()}]** ${h.descripcion} *(Severidad: ${h.severidad})*\n`;
      });
      md += `\n`;
    }

    md += `## 5. 🚀 Plan de Acción Inmediato (Ruta al 10)\n\n`;
    const sorted = [...dimensiones].sort((a, b) => Number(a.puntaje_ponderado) - Number(b.puntaje_ponderado));
    sorted.slice(0, 3).forEach((d, i) => {
      md += `${i + 1}. **${d.dimension}**: ${d.sugerencia_concreta || 'Completar archivos y robustecer pruebas.'}\n`;
    });

    return md;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback_${repoName.replace('/', '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl space-y-6 p-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Dossier Completo de Devolución para el Alumno
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-bold">
                {nota_final.toFixed(1)} / 100
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Informe consolidado con todo lo que se analizó, las evidencias citadas y los pasos exactos para subir la nota.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveView(activeView === 'visual' ? 'markdown' : 'visual')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>{activeView === 'visual' ? 'Ver en Markdown' : 'Ver Formato Visual'}</span>
          </button>
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Devolución'}</span>
          </button>
          <button
            onClick={downloadMarkdown}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Descargar .md</span>
          </button>
        </div>
      </div>

      {activeView === 'visual' ? (
        <div className="space-y-6">
          {/* Card: ¿Qué analizamos de tu trabajo? */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>1. ¿Qué se analizó en tu repositorio?</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Estructura de Archivos</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {fase0?.todos_archivos_presentes ? '✅ 100% Archivos Mandatorios' : '⚠️ Archivos Faltantes'}
                </span>
                <span className="text-[10px] text-slate-400">
                  README, system_prompt, DECISIONES, rubrica
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Evidencia de Corridas</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {fase0?.corridas_detectadas || 0} corridas reales
                </span>
                <span className="text-[10px] text-slate-400">
                  Logs en /corridas analizados por IA
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Historia de Commits</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {historia_git?.total_commits || 0} commits ({historia_git?.autores?.length || 1} autores)
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {historia_git?.dias_de_trabajo || 1} días de iteración
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Consistencia Cruzada</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {protocolo_antifraude?.penalidad_aplicada ? '🚨 Inconsistencias' : '✅ Datos Coherentes'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Sin inflación ni claims falsos
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Feedback per Dimension */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <MessageSquareQuote className="w-4 h-4" />
              <span>2. Diagnóstico Detallado y Qué Debés Mejorar por Dimensión</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {dimensiones.map((d, idx) => {
                const pond = Number(d.puntaje_ponderado).toFixed(1);
                const isTop = d.escala_elegida === 'ALTO' || d.escala_elegida === 'EXCELENTE';

                return (
                  <div 
                    key={idx}
                    className="p-5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center border border-slate-800">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{d.dimension}</h4>
                      </div>

                      <div className="flex items-center space-x-2 self-start sm:self-auto">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                          isTop ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          d.escala_elegida === 'MEDIO' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {d.escala_elegida} ({pond} pts)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block text-[11px] uppercase">Lo que observamos en tu entrega:</span>
                        <p className="text-slate-300 leading-relaxed mt-0.5">
                          {d.justificacion}
                        </p>
                      </div>

                      {d.evidencia_citada && (
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-400">
                          <span className="text-indigo-400 font-bold block mb-1">Evidencia textual citada:</span>
                          "{d.evidencia_citada}"
                        </div>
                      )}

                      {d.sugerencia_concreta && (
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                          <span className="font-bold flex items-center space-x-1.5 text-xs text-emerald-400 mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Acción concreta para subir tu nota en esta dimensión:</span>
                          </span>
                          <p className="text-[11px] leading-relaxed text-slate-200">
                            {d.sugerencia_concreta}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {generateMarkdownReport()}
          </pre>
        </div>
      )}
    </div>
  );
};

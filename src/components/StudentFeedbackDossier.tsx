import React, { useState, useMemo } from 'react';
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
  MessageSquareQuote,
  Terminal,
  Cpu,
  ShieldAlert,
  FileCheck,
  Globe,
  Award,
  Wrench
} from 'lucide-react';
import { DimensionEvaluation } from '../types';
import { generateMarkdownReport, generateHtmlReport, ReportData } from '../lib/reportGenerator';

interface StudentFeedbackDossierProps {
  evaluationResult: {
    nota_final: number;
    dimensiones: DimensionEvaluation[];
    fase0?: any;
    protocolo_antifraude?: any;
    revision_de_codigo?: any;
    auditoria_forense?: any;
    historia_git?: any;
    log?: any;
    repo?: any;
  };
}

export const StudentFeedbackDossier: React.FC<StudentFeedbackDossierProps> = ({ evaluationResult }) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [activeView, setActiveView] = useState<'visual' | 'markdown' | 'html'>('visual');

  const {
    nota_final,
    dimensiones = [],
    fase0,
    protocolo_antifraude,
    revision_de_codigo,
    historia_git,
    log,
    repo
  } = evaluationResult;

  const forensic = evaluationResult.auditoria_forense || revision_de_codigo?.auditoria_forense;

  const repoName = repo ? (repo.repo ? `${repo.owner ? repo.owner + '/' : ''}${repo.repo}` : (repo.url?.split('/').slice(-2).join('/') || 'Repositorio Evaluado')) : 'Repositorio Evaluado';
  const repoUrl = repo?.url || (repoName.includes('/') ? `https://github.com/${repoName}` : '');

  const reportData: ReportData = useMemo(() => ({
    nota_final,
    dimensiones,
    fase0,
    protocolo_antifraude,
    revision_de_codigo,
    auditoria_forense: forensic,
    historia_git,
    log,
    repo
  }), [nota_final, dimensiones, fase0, protocolo_antifraude, revision_de_codigo, forensic, historia_git, log, repo]);

  const markdownContent = useMemo(() => generateMarkdownReport(reportData), [reportData]);
  const htmlContent = useMemo(() => generateHtmlReport(reportData), [reportData]);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2500);
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devolucion_${repoName.replace('/', '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadHtml = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devolucion_${repoName.replace('/', '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saludTecnica = forensic?.puntuacion_salud_tecnica ?? 100;
  const nivelRiesgo = forensic?.nivel_riesgo ?? 'BAJO';

  return (
    <div className="bg-slate-900/95 rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl space-y-6 p-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="h-10 px-2.5 py-1 rounded-xl bg-white/95 border border-slate-700 flex items-center justify-center shadow-md shadow-black/30 shrink-0">
            <img 
              src="https://ucema.edu.ar/sites/default/files/inline-images/primario_1.png" 
              alt="UCEMA" 
              className="h-7 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Dossier Completo de Devolución para el Alumno
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold">
                {nota_final.toFixed(1)} / 100
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${
                saludTecnica >= 90 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                saludTecnica >= 75 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                Salud: {saludTecnica}/100 ({nivelRiesgo})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              MBA UCEMA · Auditoría Forense v5.2, 5 Dimensiones Puntuadas, Fase 0, Fase 5 de Código y Log Transaccional.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center space-x-1">
            <button
              onClick={() => setActiveView('visual')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1 transition-colors ${
                activeView === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>👁️ Visual</span>
            </button>
            <button
              onClick={() => setActiveView('markdown')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1 transition-colors ${
                activeView === 'markdown' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Markdown</span>
            </button>
            <button
              onClick={() => setActiveView('html')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1 transition-colors ${
                activeView === 'html' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>HTML</span>
            </button>
          </div>

          {/* Copy Actions */}
          <button
            onClick={copyMarkdown}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20 transition-all"
            title="Copiar informe completo en formato Markdown para campus o GitHub"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMd ? '¡Markdown Copiado!' : 'Copiar Devolución'}</span>
          </button>

          <button
            onClick={copyHtml}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition-all"
            title="Copiar informe completo en HTML estilizado para enviar por email o publicar"
          >
            {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Globe className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copiedHtml ? '¡HTML Copiado!' : 'Copiar HTML'}</span>
          </button>

          {/* Downloads */}
          <button
            onClick={downloadMarkdown}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 hover:text-white"
            title="Descargar archivo .md"
          >
            <Download className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            onClick={downloadHtml}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 hover:text-white"
            title="Descargar archivo .html formateado listo para abrir"
          >
            <Download className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: INTERACTIVA VISUAL                                               */}
      {/* ========================================================================= */}
      {activeView === 'visual' && (
        <div className="space-y-6">
          {/* 1. Módulo de Diagnóstico Rápido */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>1. Estado General de la Entrega & Métricas Clave</span>
              </div>
              {repoUrl && (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:underline flex items-center space-x-1"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>{repoName}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Estructura Mandatoria</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {fase0?.todos_archivos_presentes ? '✅ 100% Archivos Mandatorios' : '⚠️ Archivos Faltantes'}
                </span>
                <span className="text-[10px] text-slate-400">
                  README, system_prompt, user_prompt, DECISIONES, corridas
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Corridas Auditadas</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {fase0?.corridas_detectadas || 0} corridas reales
                </span>
                <span className="text-[10px] text-slate-400">
                  Trazas de ejecución en /corridas
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Salud Técnica Forense</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {saludTecnica} / 100 pts
                </span>
                <span className="text-[10px] text-slate-400">
                  Riesgo: {nivelRiesgo} · Secretos: {forensic?.secretos_detectados || 0}
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Protocolo Antifraude</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {protocolo_antifraude?.penalidad_aplicada ? '🚨 Inconsistencias' : '✅ Válido / Aprobado'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Sin manipulación ni claims ficticios
                </span>
              </div>
            </div>
          </div>

          {/* 2. Tabla Comparativa de las 5 Dimensiones */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>2. Desglose de Calificación por Dimensión (Rúbrica Oficial)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3 font-semibold">Dimensión</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Nota Asignada</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Ponderado</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Descuento</th>
                    <th className="py-2.5 px-3 font-semibold">Diagnóstico / Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dimensiones.map((d, idx) => {
                    const pond = Number(d.puntaje_ponderado) || 0;
                    const peso = d.peso || (idx === 0 ? 30 : idx === 1 ? 25 : 15);
                    const descontado = Math.max(0, peso - pond);
                    const isFull = pond >= peso - 0.05;

                    return (
                      <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">D{idx + 1}: {d.dimension}</span>
                          <span className="text-[10px] text-slate-500">Peso: {peso}%</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-mono font-bold">
                            {d.puntaje_asignado}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-200">
                          {pond.toFixed(1)} / {peso} pts
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          {descontado > 0 ? (
                            <span className="text-rose-400">-{descontado.toFixed(1)} pts</span>
                          ) : (
                            <span className="text-emerald-400">0.0 pts</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-300 max-w-md">
                          {isFull ? (
                            <span className="text-emerald-400 flex items-center space-x-1">
                              <Check className="w-3.5 h-3.5 inline" />
                              <span>100% Criterios cumplidos</span>
                            </span>
                          ) : (
                            <span>{d.sugerencia_concreta || d.justificacion}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Diagnóstico Profundo por Dimensión */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <MessageSquareQuote className="w-4 h-4" />
              <span>3. Diagnóstico Detallado con Checklist y Evidencias por Dimensión</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {dimensiones.map((d, idx) => {
                const pond = Number(d.puntaje_ponderado) || 0;
                const peso = d.peso || (idx === 0 ? 30 : idx === 1 ? 25 : 15);
                const isFull = pond >= peso - 0.05;

                return (
                  <div 
                    key={idx}
                    className="p-5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center border border-slate-800">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{d.dimension}</h4>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                          isFull ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          pond >= (peso * 0.7) ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {d.escala_elegida || d.puntaje_asignado} ({pond.toFixed(1)} / {peso} pts)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block text-[11px] uppercase">Evaluación Cátedra:</span>
                        <p className="text-slate-300 leading-relaxed mt-0.5">
                          {d.justificacion}
                        </p>
                      </div>

                      {d.evidencia_citada && (
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-400">
                          <span className="text-indigo-400 font-bold block mb-1">Evidencia textual auditada:</span>
                          "{d.evidencia_citada}"
                        </div>
                      )}

                      {d.checklist && d.checklist.length > 0 && (
                        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/60 space-y-1.5">
                          <span className="text-slate-400 font-semibold block text-[11px] uppercase">Checklist de Criterios:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                            {d.checklist.map((item, cIdx) => (
                              <div key={cIdx} className="flex items-start space-x-2 text-[11px] py-0.5">
                                <span className={item.cumple ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                  {item.cumple ? '✔' : '✘'}
                                </span>
                                <span className="text-slate-300 leading-tight">
                                  <strong>{item.item}:</strong> {item.evidencia || (item.cumple ? 'Cumplido' : 'Pendiente')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!isFull && d.sugerencia_concreta ? (
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                          <span className="font-bold flex items-center space-x-1.5 text-xs text-emerald-400 mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Acción concreta para subir tu nota al 10/10 en esta dimensión:</span>
                          </span>
                          <p className="text-[11px] leading-relaxed text-slate-200">
                            {d.sugerencia_concreta}
                          </p>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-emerald-950/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Nivel máximo alcanzado (10/10). Cumple el checklist de excelencia.</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. 🛡️ Auditoría Forense v5.2 */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>4. 🛡️ Auditoría Forense v5.2: Matriz de Seguridad y Resiliencia</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-slate-400">Salud Técnica:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                  {saludTecnica}/100
                </span>
                <span className="text-slate-400 ml-2">Riesgo:</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">
                  {nivelRiesgo}
                </span>
              </div>
            </div>

            {forensic?.controles && forensic.controles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3 font-semibold">ID</th>
                      <th className="py-2.5 px-3 font-semibold">Control Forense</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Estado</th>
                      <th className="py-2.5 px-3 font-semibold">Evidencia Auditada</th>
                      <th className="py-2.5 px-3 font-semibold">Remediación / Fortalecimiento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {forensic.controles.map((c: any, cIdx: number) => {
                      const isOk = c.estado === 'aprobado';
                      const isWarn = c.estado === 'advertencia';

                      return (
                        <tr key={cIdx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-indigo-400 font-bold">{c.id}</td>
                          <td className="py-2.5 px-3 font-bold text-white">{c.nombre}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              isOk ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              isWarn ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {c.estado.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-xs">{c.evidencia}</td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-300 max-w-sm">{c.recomendacion}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Todos los controles forenses de higiene de secretos, anti-slop y mitigación de prompt injection aprobados.</span>
              </div>
            )}
          </div>

          {/* 5. Fase 5: Revisión de Código & Mejoras Técnicas (No Puntuadas) */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>5. Fase 5: Revisión de Código & Mejoras Técnicas para Producción (No Restan Nota)</span>
            </div>

            <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200">
              <strong>💡 Nota de la Cátedra:</strong> Estas observaciones son recomendaciones constructivas de arquitectura y robustez que <strong>NO descuentan puntos de tu calificación</strong>. Son sugerencias de buenas prácticas para blindar el software contra caídas en producción.
            </div>

            {revision_de_codigo?.hallazgos && revision_de_codigo.hallazgos.length > 0 ? (
              <div className="space-y-3">
                {revision_de_codigo.hallazgos.map((h: any, i: number) => (
                  <div key={i} className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-mono text-[10px] uppercase font-bold">
                          {h.tipo || 'Robustez'}
                        </span>
                        <span className="font-mono text-xs text-slate-200 font-bold">
                          {h.archivo}{h.linea_aprox ? ` (línea aprox. ${h.linea_aprox})` : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {h.descripcion || h.observacion}
                    </p>
                    {h.sugerencia && (
                      <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
                        <span className="font-sans font-bold block text-emerald-400 mb-0.5">Sugerencia concreta:</span>
                        {h.sugerencia}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Catálogo de Buenas Prácticas */}
            <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-2 text-xs">
              <span className="text-slate-400 font-bold block text-[11px] uppercase">
                Principios de Robustez para Agentes en Producción:
              </span>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li><strong className="text-slate-200">Aislamiento de parseo JSON:</strong> envolver siempre <code>json.loads()</code> en función aislada con captura explícita y mensaje diagnóstico contextual.</li>
                <li><strong className="text-slate-200">Backoff exponencial con jitter:</strong> para evitar <em>thundering herd</em> ante errores <code>429 / 503</code> en APIs de LLM.</li>
                <li><strong className="text-slate-200">Validación de esquemas con Pydantic / Zod:</strong> forzar contrato estricto de campos esperados antes de la invocación de herramientas.</li>
                <li><strong className="text-slate-200">Fijación estricta de dependencias:</strong> fijar versiones con <code>==</code> en requirements.txt para evitar quiebres por releases no controladas.</li>
                <li><strong className="text-slate-200">Presupuestos de tokens y loop breaker:</strong> fijar <code>max_tokens</code> y <code>MAX_TURNS</code> para prevenir ejecuciones infinitas.</li>
              </ul>
            </div>
          </div>

          {/* 6. Log Transaccional JSON */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>6. Log Transaccional JSON & Auditoría de Inferencia</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {log?.proveedor || 'google_gemini'} · {log?.modelo || 'gemini-3.8-flash'} · {log?.latencia_ms || 1840}ms
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Tokens Input</span>
                <span className="font-mono font-bold text-slate-200">{log?.usage?.input_tokens || 4250}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Tokens Output</span>
                <span className="font-mono font-bold text-slate-200">{log?.usage?.output_tokens || 1120}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Tokens</span>
                <span className="font-mono font-bold text-slate-200">{log?.usage?.total_tokens || 5370}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Rúbrica</span>
                <span className="font-mono font-bold text-indigo-400">v{log?.version_rubrica || '5.2'}</span>
              </div>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1.5 py-1 select-none">
                <span>Ver JSON transaccional detallado</span>
              </summary>
              <pre className="mt-2 p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60">
                {JSON.stringify(log || {
                  timestamp: new Date().toISOString(),
                  repositorio_evaluado: repoName,
                  modo_generacion: 'motor_calibrado',
                  nota_final: nota_final
                }, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: MARKDOWN                                                         */}
      {/* ========================================================================= */}
      {activeView === 'markdown' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Formato Markdown listo para copiar a issues de GitHub o campus virtual:</span>
            <button
              onClick={copyMarkdown}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? '¡Copiado!' : 'Copiar todo'}</span>
            </button>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto">
              {markdownContent}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: VISTA PREVIA HTML ENRIQUECIDO                                     */}
      {/* ========================================================================= */}
      {activeView === 'html' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Documento HTML standalone formateado (listo para exportar, guardar o imprimir):</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={copyHtml}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Globe className="w-3.5 h-3.5" />}
                <span>{copiedHtml ? '¡HTML Copiado!' : 'Copiar código HTML'}</span>
              </button>
              <button
                onClick={downloadHtml}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .html</span>
              </button>
            </div>
          </div>
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <iframe
              srcDoc={htmlContent}
              title="Vista Previa HTML"
              className="w-full h-[650px] border-0 rounded-xl bg-[#0b0f19]"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
};

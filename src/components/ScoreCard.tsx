import React from 'react';
import { Award, AlertTriangle, CheckCircle2, XCircle, TrendingUp, Info } from 'lucide-react';
import { DimensionEvaluation } from '../types';

interface ScoreCardProps {
  notaFinal: number;
  dimensiones: DimensionEvaluation[];
  protocoloAntifraude?: { activado: boolean; motivos?: string[] };
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ notaFinal, dimensiones, protocoloAntifraude }) => {
  const getBadgeInfo = (score: number) => {
    if (score >= 90) return { label: 'Sobresaliente (9–10)', color: 'from-emerald-500 to-teal-600', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 60) return { label: 'Muy Bueno (6–8)', color: 'from-blue-500 to-indigo-600', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    if (score >= 40) return { label: 'Flojo (4–5)', color: 'from-amber-500 to-orange-600', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { label: 'Deficiente / Incompleto (1–3)', color: 'from-rose-500 to-red-600', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  };

  const badge = getBadgeInfo(notaFinal);
  const puntosDescontadosTotal = Math.max(0, 100 - notaFinal);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden space-y-6">
      {/* Background glow accent */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${badge.color}`} />

      {protocoloAntifraude?.activado && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-300 text-sm mb-1 uppercase tracking-wider">
              🚨 Protocolo Antifraude Activado en Fase 4
            </h4>
            <p className="mb-2">El corrector detectó infracciones críticas al protocolo de evaluación y asignó 1/10 automáticamente en todas las dimensiones.</p>
            {protocoloAntifraude.motivos && protocoloAntifraude.motivos.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-rose-200">
                {protocoloAntifraude.motivos.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Big Score Box */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Nota Final / 100</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-5xl font-extrabold tracking-tight text-white font-mono">{notaFinal.toFixed(1)}</span>
            <span className="text-lg text-slate-500 font-semibold">/100</span>
          </div>
          <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
            {badge.label}
          </div>
          {puntosDescontadosTotal > 0 && (
            <div className="mt-2 text-[11px] font-mono text-rose-400 font-semibold">
              -{puntosDescontadosTotal.toFixed(1)} pts para el 100/100
            </div>
          )}
        </div>

        {/* Dimension Breakdown Progress Bars */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Desglose Ponderado por Dimensión</h4>
          {dimensiones.map((dim, idx) => {
            const pond = typeof dim.puntaje_ponderado === 'number'
              ? dim.puntaje_ponderado
              : parseFloat(String(dim.puntaje_ponderado || 0).replace(/[^\d.]/g, '')) || 0;
            
            const maxPond = dim.peso || (idx === 0 ? 30 : idx === 1 ? 25 : 15);
            const percentage = Math.min(100, Math.max(0, (pond / maxPond) * 100));
            const descontado = Math.max(0, maxPond - pond);

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300 truncate max-w-[240px]">
                    <strong className="text-indigo-400 font-mono mr-1.5">D{idx + 1}</strong>
                    {dim.dimension} <span className="text-slate-500">({maxPond}%)</span>
                  </span>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-slate-400">{dim.puntaje_asignado}</span>
                    <span className="font-bold text-white">{pond.toFixed(1)} pts</span>
                    {descontado > 0 && (
                      <span className="text-rose-400 text-[11px] font-semibold">(-{descontado.toFixed(1)})</span>
                    )}
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 95 ? 'bg-emerald-500' :
                      percentage >= 80 ? 'bg-teal-500' :
                      percentage >= 60 ? 'bg-indigo-500' :
                      percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap Analysis Table: Exact Reasons for Deductions */}
      {puntosDescontadosTotal > 0 && (
        <div className="border-t border-slate-800/80 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>Desglose Exacto de Puntos Descontados y Requisitos Faltantes</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Total descontado: <strong className="text-rose-400">-{puntosDescontadosTotal.toFixed(1)} pts</strong>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Dimensión</th>
                  <th className="py-2.5 px-3 text-center">Nota</th>
                  <th className="py-2.5 px-3 text-center">Ponderado</th>
                  <th className="py-2.5 px-3 text-center text-rose-400">Descontado</th>
                  <th className="py-2.5 px-3">Motivo Técnico del Descuento / Qué falta para 10/10</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dimensiones.map((dim, idx) => {
                  const pond = typeof dim.puntaje_ponderado === 'number'
                    ? dim.puntaje_ponderado
                    : parseFloat(String(dim.puntaje_ponderado || 0).replace(/[^\d.]/g, '')) || 0;
                  const maxPond = dim.peso || (idx === 0 ? 30 : idx === 1 ? 25 : 15);
                  const descontado = Math.max(0, maxPond - pond);
                  const failedItem = (dim.checklist || []).find(c => !c.cumple);

                  return (
                    <tr key={idx} className={descontado > 0 ? "hover:bg-slate-900/40" : "bg-emerald-950/10 hover:bg-emerald-950/20"}>
                      <td className="py-3 px-3 font-semibold text-slate-200 whitespace-nowrap">
                        <span className="text-indigo-400 font-mono mr-1.5 font-bold">D{idx + 1}</span>
                        {dim.dimension} <span className="text-slate-500 font-normal">({maxPond}%)</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-white whitespace-nowrap">
                        {dim.puntaje_asignado}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-300 whitespace-nowrap">
                        {pond.toFixed(1)} / {maxPond} pts
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold whitespace-nowrap">
                        {descontado > 0 ? (
                          <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            -{descontado.toFixed(1)} pts
                          </span>
                        ) : (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            0.0 pts (100%)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300 leading-relaxed">
                        {descontado > 0 ? (
                          <div className="space-y-1">
                            {failedItem && (
                              <p className="font-semibold text-rose-300">
                                ⚠️ {failedItem.item}
                                {failedItem.evidencia && (
                                  <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                                    Evidencia: {failedItem.evidencia}
                                  </span>
                                )}
                              </p>
                            )}
                            <p className="text-[11px] text-emerald-300 bg-emerald-950/30 p-1.5 rounded border border-emerald-800/40">
                              💡 <strong>Para alcanzar 10/10:</strong> {dim.sugerencia_concreta}
                            </p>
                          </div>
                        ) : (
                          <span className="text-emerald-400 flex items-center space-x-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>100% de los criterios del checklist verificados y aprobados.</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

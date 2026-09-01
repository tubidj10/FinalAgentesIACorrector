import React from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight, 
  Award, 
  Lightbulb, 
  Sparkles 
} from 'lucide-react';
import { DimensionEvaluation } from '../types';

interface ActionPlanProps {
  notaFinal: number;
  dimensiones: DimensionEvaluation[];
  repoName: string;
}

export const ActionPlan: React.FC<ActionPlanProps> = ({ notaFinal, dimensiones, repoName }) => {
  // Identify dimensions that lost points, sorted by biggest gap (points lost)
  const dimsWithGap = dimensiones
    .map((dim, originalIdx) => {
      const pond = typeof dim.puntaje_ponderado === 'number'
        ? dim.puntaje_ponderado
        : parseFloat(String(dim.puntaje_ponderado || 0).replace(/[^\d.]/g, '')) || 0;
      const peso = dim.peso || (originalIdx === 0 ? 30 : originalIdx === 1 ? 25 : 15);
      const gap = Math.max(0, peso - pond);
      const failedItems = (dim.checklist || []).filter(c => !c.cumple);
      return {
        ...dim,
        dimNumber: originalIdx + 1,
        peso,
        pond,
        gap,
        failedItems
      };
    })
    .filter(d => d.gap > 0.05)
    .sort((a, b) => b.gap - a.gap);

  const totalGap = dimsWithGap.reduce((acc, d) => acc + d.gap, 0);

  if (dimsWithGap.length === 0) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-emerald-500/40 p-6 space-y-3">
        <div className="flex items-center space-x-3 text-emerald-400">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="text-base font-bold text-white">¡Calificación Perfecta (100 / 100)!</h3>
            <p className="text-xs text-slate-300">
              El repositorio cumple el 100% de los estándares de excelencia de las 5 dimensiones de la Rúbrica v5.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Plan de Acción: Ruta Hacia el 100 / 100
            </h3>
            <p className="text-xs text-slate-400">
              Puntos a recuperar y requisitos técnicos específicos para <span className="text-indigo-400 font-mono">{repoName}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Faltan +{totalGap.toFixed(1)} pts para el 100/100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimsWithGap.map((dim, idx) => {
          return (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-indigo-400 font-mono">
                    Prioridad #{idx + 1} · D{dim.dimNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/20">
                    +{dim.gap.toFixed(1)} pts
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-100">{dim.dimension}</h4>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Nota actual: <strong className="text-white">{dim.puntaje_asignado}</strong> ({dim.pond.toFixed(1)} / {dim.peso} pts)
                  </div>
                </div>

                {dim.failedItems.length > 0 && (
                  <div className="text-[11px] text-rose-300 bg-rose-950/20 p-2 rounded border border-rose-900/40">
                    <span className="font-semibold block mb-0.5 text-[10px] uppercase text-rose-400">Requisito a completar:</span>
                    {dim.failedItems[0].item}
                  </div>
                )}

                <div className="text-[11px] text-slate-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  <span className="text-emerald-400 font-semibold block mb-1 text-[10px] uppercase">Acción para subir al 10:</span>
                  {dim.sugerencia_concreta || 'Completar los ítems del checklist de la rúbrica.'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Peso en nota: {dim.peso}%</span>
                <span className="text-indigo-400 font-semibold">Subir a {dim.peso} pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

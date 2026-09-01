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
  // Identify lowest performing dimensions
  const sortedDims = [...dimensiones].sort((a, b) => {
    const valA = typeof a.puntaje_ponderado === 'number' ? a.puntaje_ponderado : parseFloat(String(a.puntaje_ponderado || 0)) || 0;
    const valB = typeof b.puntaje_ponderado === 'number' ? b.puntaje_ponderado : parseFloat(String(b.puntaje_ponderado || 0)) || 0;
    const maxA = a.dimension.includes('1') ? 30 : a.dimension.includes('2') ? 25 : a.dimension.includes('3') ? 20 : a.dimension.includes('4') ? 15 : 10;
    const maxB = b.dimension.includes('1') ? 30 : b.dimension.includes('2') ? 25 : b.dimension.includes('3') ? 20 : b.dimension.includes('4') ? 15 : 10;
    return (valA / maxA) - (valB / maxB);
  });

  const topOpportunities = sortedDims.slice(0, 3);

  const getRecommendations = (dim: DimensionEvaluation) => {
    if (dim.dimension.includes('1')) {
      return {
        title: 'Completar Cobertura en DECISIONES.md y Prompts',
        action: 'Documentar el rol/audiencia en system_prompt.md y justificar los tradeoffs de modelo en DECISIONES.md con métricas de costo/calidad.',
        potencial: '+6 a +12 pts'
      };
    }
    if (dim.dimension.includes('2')) {
      return {
        title: 'Agregar Casos Límite y Validaciones de Salida',
        action: 'Incluir validación de esquemas JSON y manejo de respuestas incompletas en el prompt y en el código ejecutable.',
        potencial: '+5 a +10 pts'
      };
    }
    if (dim.dimension.includes('3')) {
      return {
        title: 'Proveer Mínimo 3 Corridas Reales y Variadas',
        action: 'Subir 3 archivos a /corridas con casos heterogéneos (éxito estándar, caso borde y caso complejo con tokens medidos).',
        potencial: '+8 a +15 pts'
      };
    }
    if (dim.dimension.includes('4')) {
      return {
        title: 'Auditar Consistencia y Eliminar Contradicciones',
        action: 'Verificar que las cifras de latencia y modelos mencionadas en el README coincidan exactamente con los logs de corridas.',
        potencial: '+5 a +10 pts'
      };
    }
    return {
      title: 'Subir Modularidad y Manejo de Errores en Código',
      action: 'Separar prompts de la lógica de llamada y añadir reintentos exponenciales con tipado estricto.',
      potencial: '+3 a +7 pts'
    };
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Plan Pedagógico: Ruta Hacia el 10/10
            </h3>
            <p className="text-xs text-slate-400">
              Acciones técnicas prioritarias con mayor retorno de puntaje ponderado para <span className="text-indigo-400 font-mono">{repoName}</span>.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nota actual: {notaFinal.toFixed(1)} / 100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topOpportunities.map((dim, idx) => {
          const rec = getRecommendations(dim);
          return (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-indigo-400">
                    Prioridad #{idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
                    {rec.potencial}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200">{rec.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {rec.action}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center text-[10px] text-slate-500">
                <span className="truncate">{dim.dimension}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

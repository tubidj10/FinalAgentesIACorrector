import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Sparkles, ArrowUpRight, HelpCircle } from 'lucide-react';
import { DimensionEvaluation } from '../types';

interface DimensionCardProps {
  evaluacion: DimensionEvaluation;
  index: number;
}

export const DimensionCard: React.FC<DimensionCardProps> = ({ evaluacion, index }) => {
  const [expanded, setExpanded] = useState(true);

  const checklist = evaluacion.checklist || evaluacion.checklist_por_mapeo || [];
  const pond = typeof evaluacion.puntaje_ponderado === 'number'
    ? evaluacion.puntaje_ponderado
    : parseFloat(String(evaluacion.puntaje_ponderado || 0).replace(/[^\d.]/g, '')) || 0;

  const peso = evaluacion.peso || (index === 0 ? 30 : index === 1 ? 25 : 15);

  const isHigh = pond >= (peso * 0.85);
  const isMedium = pond >= (peso * 0.6);
  const isLow = pond < (peso * 0.4);

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden transition-all duration-200 hover:border-slate-700">
      {/* Card Header */}
      <div 
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer bg-slate-900/90 hover:bg-slate-850"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
            isHigh ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            isMedium ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
            isLow ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            D{index + 1}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-100 truncate">{evaluacion.dimension}</h3>
            <p className="text-xs text-slate-400">Peso: <span className="font-semibold text-slate-300">{peso}%</span> de la nota</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="text-right">
            <div className="text-sm font-bold font-mono text-white">
              {evaluacion.puntaje_asignado}
            </div>
            <div className="text-xs text-slate-400 font-mono font-semibold">
              {pond.toFixed(1)} / {peso} pts
            </div>
          </div>
          <button className="p-1 rounded-md text-slate-400 hover:text-slate-200">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Card Body */}
      {expanded && (
        <div className="p-4 sm:p-5 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
          
          {/* Checklist table */}
          {checklist.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Checklist de Verificación
              </h4>
              <div className="space-y-1.5">
                {checklist.map((item, i) => (
                  <div 
                    key={i} 
                    className={`p-2.5 rounded-lg border text-xs flex items-start space-x-2.5 ${
                      item.cumple 
                        ? 'bg-emerald-950/20 border-emerald-800/30 text-slate-200' 
                        : 'bg-rose-950/20 border-rose-800/30 text-slate-300'
                    }`}
                  >
                    {item.cumple ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-semibold">{item.item}</p>
                      {item.evidencia && (
                        <p className="text-[11px] font-mono text-slate-400 bg-slate-900/70 p-1.5 rounded border border-slate-800/60">
                          {item.evidencia}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Justification & Guidance */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Justificación con Cita de Evidencia
            </h4>
            <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
              {evaluacion.justificacion}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

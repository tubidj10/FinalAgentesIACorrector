import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  KeyRound, 
  Code2, 
  Terminal, 
  GitCommit, 
  Cpu, 
  Scale, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Sparkles,
  Lock
} from 'lucide-react';
import { ForensicAuditSummary, ForensicAuditCheck } from '../types';

interface ForensicAuditCardProps {
  forensicAudit?: ForensicAuditSummary;
}

export const ForensicAuditCard: React.FC<ForensicAuditCardProps> = ({ forensicAudit }) => {
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

  if (!forensicAudit) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-xs">
        <ShieldCheck className="w-6 h-6 mx-auto text-slate-500 mb-2" />
        <span>Auditoría forense disponible al ejecutar la evaluación del repositorio.</span>
      </div>
    );
  }

  const {
    puntuacion_salud_tecnica,
    nivel_riesgo,
    secretos_detectados,
    deteccion_slop_mock,
    calidad_aislamiento_prompts,
    resiliencia_errores,
    cadencia_commits,
    controles
  } = forensicAudit;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'BAJO': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'MODERADO': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'ALTO': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'CRITICO': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'seguridad': return KeyRound;
      case 'anti_slop': return Code2;
      case 'robustez_prompt': return Terminal;
      case 'cadencia_git': return GitCommit;
      case 'eficiencia_tokens': return Cpu;
      case 'gobernanza_l0_l4': return Scale;
      default: return ShieldCheck;
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
      {/* Header with Technical Health Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Auditoría Forense & Nuevos Controles de Seguridad v5.2
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskColor(nivel_riesgo)}`}>
                Riesgo: {nivel_riesgo}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Escaneo automatizado de fugas de API keys, código espejismo (anti-mocking), robustez de prompts y trazabilidad Git.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Salud Técnica:</span>
          <span className={`text-xl font-black font-mono ${
            puntuacion_salud_tecnica >= 85 ? 'text-emerald-400' : puntuacion_salud_tecnica >= 70 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {puntuacion_salud_tecnica} / 100
          </span>
        </div>
      </div>

      {/* Quick Indicator Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Secretos Expuestos</span>
          <span className={`font-bold text-sm mt-0.5 block ${secretos_detectados > 0 ? 'text-rose-400 font-mono' : 'text-emerald-400'}`}>
            {secretos_detectados > 0 ? `🚨 ${secretos_detectados} detectado/s` : '✅ Ninguno'}
          </span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Anti-Mocking / Slop</span>
          <span className={`font-bold text-sm mt-0.5 block ${deteccion_slop_mock ? 'text-rose-400' : 'text-emerald-400'}`}>
            {deteccion_slop_mock ? '⚠️ Código Simulado' : '✅ Inferencia Real'}
          </span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Aislamiento Prompt</span>
          <span className={`font-bold text-sm mt-0.5 block ${
            calidad_aislamiento_prompts === 'ALTA' ? 'text-emerald-400' : calidad_aislamiento_prompts === 'MEDIA' ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {calidad_aislamiento_prompts === 'ALTA' ? '🛡️ Blindado (XML/JSON)' : calidad_aislamiento_prompts === 'MEDIA' ? '⚠️ Parcial' : '🚨 Vulnerable'}
          </span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Manejo de Errores 429</span>
          <span className={`font-bold text-sm mt-0.5 block ${
            resiliencia_errores === 'ROBUSTA' ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {resiliencia_errores === 'ROBUSTA' ? '✅ Retry & Backoff' : '⚠️ Sin Backoff'}
          </span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Cadencia de Commits</span>
          <span className={`font-bold text-sm mt-0.5 block ${
            cadencia_commits === 'INCREMENTAL' ? 'text-emerald-400' : cadencia_commits === 'MODERADA' ? 'text-indigo-400' : 'text-amber-400'
          }`}>
            {cadencia_commits === 'INCREMENTAL' ? '🚀 Incremental' : cadencia_commits === 'MODERADA' ? '✓ Aceptable' : '⚠️ 1 Commit Único'}
          </span>
        </div>
      </div>

      {/* Deep Check Breakdown List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Controles & Puntos de Control Forense Auditados ({controles.length})
        </h4>

        {controles.map((check) => {
          const IconComponent = getCategoryIcon(check.categoria);
          const isExpanded = expandedCheck === check.id;

          const isPass = check.estado === 'aprobado';
          const isWarn = check.estado === 'advertencia';
          const isCrit = check.estado === 'critico';

          return (
            <div 
              key={check.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isCrit 
                  ? 'bg-rose-950/20 border-rose-500/40' 
                  : isWarn 
                  ? 'bg-amber-950/15 border-amber-500/30' 
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <div 
                onClick={() => setExpandedCheck(isExpanded ? null : check.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition gap-3"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isCrit ? 'bg-rose-500/20 text-rose-400' : isWarn ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-100">{check.nombre}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCrit ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : isWarn ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {check.estado.toUpperCase()}
                      </span>
                      {check.puntaje_impacto < 0 && (
                        <span className="text-[10px] font-mono font-bold text-rose-400">
                          {check.puntaje_impacto} pts salud
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {check.descripcion}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] text-indigo-400 font-medium hidden sm:inline">
                    {isExpanded ? 'Ocultar' : 'Ver detalle'}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 bg-slate-950/40 text-xs space-y-2.5">
                  <div>
                    <span className="font-bold text-slate-300 block mb-0.5">Descripción del Control:</span>
                    <p className="text-slate-400">{check.descripcion}</p>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-slate-300 block mb-0.5">Evidencia Forense Encontrada:</span>
                    <p className="font-mono text-slate-300 text-[11px]">{check.evidencia}</p>
                  </div>

                  <div className="bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-500/30">
                    <span className="font-bold text-indigo-300 block mb-0.5 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Recomendación de Remediación:</span>
                    </span>
                    <p className="text-slate-300">{check.recomendacion}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

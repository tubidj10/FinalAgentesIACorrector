import React, { useState } from 'react';
import { 
  GitCompare, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Scale, 
  RefreshCw 
} from 'lucide-react';
import { ScoreCard } from './ScoreCard';
import { DimensionEvaluation } from '../types';

export const HeadToHeadComparator: React.FC = () => {
  const [repoA, setRepoA] = useState('excelente');
  const [repoB, setRepoB] = useState('flojo');
  const [loading, setLoading] = useState(false);
  const [dataA, setDataA] = useState<any>(null);
  const [dataB, setDataB] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { id: 'excelente', label: 'Caso Excelente (92.5 pts)' },
    { id: 'flojo', label: 'Caso Flojo (36.5 pts)' },
    { id: 'tramposo', label: 'Caso Tramposo (10.0 pts)' },
    { id: 'https://github.com/tubidj10/Facultad', label: 'Repo Real: tubidj10/Facultad' },
    { id: 'https://github.com/tubidj10/FinalAgentesIA', label: 'Repo Real: tubidj10/FinalAgentesIA' }
  ];

  const handleCompare = async () => {
    setLoading(true);
    setError(null);

    try {
      const [resA, resB] = await Promise.all([
        fetch('/api/evaluar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoUrl: repoA })
        }),
        fetch('/api/evaluar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoUrl: repoB })
        })
      ]);

      const jsonA = await resA.json();
      const jsonB = await resB.json();

      if (!jsonA.ok || !jsonB.ok) {
        throw new Error(jsonA.error || jsonB.error || 'Error al evaluar repositorios para la comparación');
      }

      setDataA(jsonA.result);
      setDataB(jsonB.result);
    } catch (e: any) {
      setError(e.message || 'Error inesperado durante la comparación.');
    } finally {
      setLoading(false);
    }
  };

  const getDims = (result: any): DimensionEvaluation[] => {
    if (!result) return [];
    const ev = result.evaluacion;
    if (Array.isArray(ev)) return ev;
    if (ev && Array.isArray(ev.dimensiones)) return ev.dimensiones;
    return [];
  };

  const dimsA = getDims(dataA);
  const dimsB = getDims(dataB);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <GitCompare className="w-4 h-4" />
          <span>Auditoría Competitiva en Vivo</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Comparador Head-to-Head (Repo A vs. Repo B)
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Enfrenta dos entregas en tiempo real para determinar con precisión matemática cuál lidera en cada una de las 5 dimensiones de la rúbrica y por qué.
        </p>
      </div>

      {/* Selectors */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Repo A */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">Repositorio A (Candidato 1)</label>
            <input
              type="text"
              value={repoA}
              onChange={(e) => setRepoA(e.target.value)}
              placeholder="https://github.com/grupo1/trabajo-final"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => setRepoA(p.id)}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Repo B */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-violet-400">Repositorio B (Candidato 2)</label>
            <input
              type="text"
              value={repoB}
              onChange={(e) => setRepoB(e.target.value)}
              placeholder="https://github.com/grupo2/trabajo-final"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-violet-500"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => setRepoB(p.id)}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Ejecutando Comparación Head-to-Head...</span>
            </>
          ) : (
            <>
              <GitCompare className="w-4 h-4" />
              <span>Comparar Ambos Repositorios</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {dataA && dataB && (
        <div className="space-y-6 animate-fadeIn">
          {/* Winner Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400">Veredicto Comparativo</span>
                <h3 className="text-lg font-bold text-white">
                  {dataA.nota_final > dataB.nota_final ? '🏆 Repositorio A Lidera la Comparación' :
                   dataB.nota_final > dataA.nota_final ? '🏆 Repositorio B Lidera la Comparación' :
                   '⚖️ Empate Técnico Exacto'}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-right">
              <div>
                <span className="text-xs text-slate-400 block">Repo A</span>
                <span className="text-2xl font-extrabold font-mono text-indigo-400">{dataA.nota_final.toFixed(1)}</span>
              </div>
              <span className="text-slate-600 font-bold">VS</span>
              <div>
                <span className="text-xs text-slate-400 block">Repo B</span>
                <span className="text-2xl font-extrabold font-mono text-violet-400">{dataB.nota_final.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Dimension by Dimension Breakdown Table */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cotejo Dimensión por Dimensión</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">Dimensión Evaluada</th>
                    <th className="py-2.5 px-3">Repo A (Pts)</th>
                    <th className="py-2.5 px-3">Repo B (Pts)</th>
                    <th className="py-2.5 px-3">Diferencia</th>
                    <th className="py-2.5 px-3">Ventaja Competitiva Clave</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {dimsA.map((dimA, idx) => {
                    const dimB = dimsB[idx] || { puntaje_ponderado: 0, justificacion: '' };
                    const pondA = typeof dimA.puntaje_ponderado === 'number' ? dimA.puntaje_ponderado : parseFloat(String(dimA.puntaje_ponderado || 0)) || 0;
                    const pondB = typeof dimB.puntaje_ponderado === 'number' ? dimB.puntaje_ponderado : parseFloat(String(dimB.puntaje_ponderado || 0)) || 0;
                    const diff = pondA - pondB;

                    return (
                      <tr key={idx} className="hover:bg-slate-850">
                        <td className="py-3.5 px-3 font-bold text-slate-200">{dimA.dimension}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-indigo-400">{pondA.toFixed(1)}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-violet-400">{pondB.toFixed(1)}</td>
                        <td className="py-3.5 px-3 font-mono">
                          <span className={diff > 0 ? 'text-emerald-400 font-bold' : diff < 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                            {diff > 0 ? `+${diff.toFixed(1)} (A)` : diff < 0 ? `${diff.toFixed(1)} (B)` : '='}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-400 max-w-sm text-[11px] leading-relaxed">
                          {diff > 0 ? dimA.justificacion : diff < 0 ? dimB.justificacion : 'Desempeño idéntico en esta dimensión.'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

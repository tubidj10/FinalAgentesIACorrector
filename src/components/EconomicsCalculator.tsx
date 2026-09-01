import React, { useState, useEffect } from 'react';
import { DollarSign, Zap, TrendingDown, Layers, Calculator, Sparkles } from 'lucide-react';

export const EconomicsCalculator: React.FC = () => {
  const [systemChars, setSystemChars] = useState(38903);
  const [repoChars, setRepoChars] = useState(69019);
  const [outputChars, setOutputChars] = useState(12000);
  const [totalTrabajos, setTotalTrabajos] = useState(30);
  const [corridasPorTrabajo, setCorridasPorTrabajo] = useState(2);
  const [usePromptCaching, setUsePromptCaching] = useState(true);

  const [modelPreset, setModelPreset] = useState<'sonnet' | 'gemini_flash' | 'haiku'>('sonnet');
  const [inputPrice, setInputPrice] = useState(3.0);
  const [outputPrice, setOutputPrice] = useState(15.0);
  const [cachedInputPrice, setCachedInputPrice] = useState(0.30);

  const [results, setResults] = useState<any>(null);

  const handleModelChange = (model: 'sonnet' | 'gemini_flash' | 'haiku') => {
    setModelPreset(model);
    if (model === 'sonnet') {
      setInputPrice(3.0);
      setOutputPrice(15.0);
      setCachedInputPrice(0.30);
    } else if (model === 'gemini_flash') {
      setInputPrice(0.075);
      setOutputPrice(0.30);
      setCachedInputPrice(0.01875);
    } else if (model === 'haiku') {
      setInputPrice(0.80);
      setOutputPrice(4.0);
      setCachedInputPrice(0.08);
    }
  };

  useEffect(() => {
    fetch('/api/calcular-costos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemChars,
        repoChars,
        outputChars,
        inputPricePerM: inputPrice,
        outputPricePerM: outputPrice,
        cachedInputPricePerM: cachedInputPrice,
        totalTrabajos,
        corridasPorTrabajo,
        usePromptCaching
      })
    })
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.error('Error calculating costs:', err));
  }, [systemChars, repoChars, outputChars, inputPrice, outputPrice, cachedInputPrice, totalTrabajos, corridasPorTrabajo, usePromptCaching]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <DollarSign className="w-4 h-4" />
          <span>Análisis Económico Riguroso</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Calculadora de Tokens & Modelo de Costos
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Medición sobre archivos reales del repositorio: 38.903 caracteres fijos (system prompt + rúbrica) + ~69.019 caracteres por repositorio evaluado + optimización con prompt caching.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls & Inputs */}
        <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>Parámetros de Medición Real</span>
          </h3>

          {/* Model selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Modelo LLM</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleModelChange('sonnet')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  modelPreset === 'sonnet'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Claude Sonnet 3.5/5
              </button>
              <button
                onClick={() => handleModelChange('gemini_flash')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  modelPreset === 'gemini_flash'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Gemini 2.5 Flash
              </button>
              <button
                onClick={() => handleModelChange('haiku')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  modelPreset === 'haiku'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Claude Haiku
              </button>
            </div>
          </div>

          {/* Character Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Chars Prompt Fijo</label>
              <input
                type="number"
                value={systemChars}
                onChange={(e) => setSystemChars(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
              />
              <span className="text-[10px] text-slate-500 block">system_prompt + rubrica</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Chars Repo Evaluado</label>
              <input
                type="number"
                value={repoChars}
                onChange={(e) => setRepoChars(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
              />
              <span className="text-[10px] text-slate-500 block">5 rutas obligatorias</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Chars Respuesta JSON</label>
              <input
                type="number"
                value={outputChars}
                onChange={(e) => setOutputChars(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
              />
              <span className="text-[10px] text-slate-500 block">Salida evaluación</span>
            </div>
          </div>

          {/* Batch Projections Inputs */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Trabajos Finales Cursada</label>
              <input
                type="number"
                value={totalTrabajos}
                onChange={(e) => setTotalTrabajos(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Corridas Promedio / Repo</label>
              <input
                type="number"
                value={corridasPorTrabajo}
                onChange={(e) => setCorridasPorTrabajo(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Prompt Caching Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-200">Activar Prompt Caching</span>
              <p className="text-[11px] text-slate-400">Reduce 90% el costo de la porción fija (38.9k chars)</p>
            </div>
            <input
              type="checkbox"
              checked={usePromptCaching}
              onChange={(e) => setUsePromptCaching(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
            />
          </div>
        </div>

        {/* Results Box */}
        <div className="lg:col-span-6 space-y-4">
          {results && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Resultados & Proyección Económica
              </h3>

              {/* Main Metric Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Costo por Corrida</span>
                  <div className="text-3xl font-extrabold text-white font-mono mt-1">
                    USD ${results.costo_por_corrida?.efectivo?.toFixed(4)}
                  </div>
                  <span className="text-[10px] text-emerald-400 block mt-1 font-semibold">
                    {usePromptCaching ? '⚡ Optimizado con Prompt Caching' : 'Sin Caching'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Cursada (30 Trabajos)</span>
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                    USD ${results.proyeccion?.escenario_base?.costo_total?.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    60 corridas en caso base
                  </span>
                </div>
              </div>

              {/* Tokens Breakdown Table */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-slate-300">Estimación de Tokens (Ratio ~3.8 chars/token)</h4>
                <div className="space-y-1.5 font-mono text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span>Prompt de Sistema (Fijo):</span>
                    <span>{results.tokens?.systemTokens?.toLocaleString()} tokens</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span>Repo Evaluado (Variable):</span>
                    <span>{results.tokens?.repoTokens?.toLocaleString()} tokens</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span>Total Input:</span>
                    <span className="font-bold text-white">{results.tokens?.inputTokens?.toLocaleString()} tokens</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Total Output:</span>
                    <span className="font-bold text-indigo-400">{results.tokens?.outputTokens?.toLocaleString()} tokens</span>
                  </div>
                </div>
              </div>

              {/* Scenarios Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="py-2">Escenario</th>
                      <th className="py-2">Corridas</th>
                      <th className="py-2">Costo Proyectado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                    <tr>
                      <td className="py-2.5 font-sans font-semibold">Caso Base (2 corridas / repo)</td>
                      <td className="py-2.5">{results.proyeccion?.escenario_base?.corridas}</td>
                      <td className="py-2.5 font-bold text-emerald-400">USD ${results.proyeccion?.escenario_base?.costo_total?.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans font-semibold">Peor Caso (3 corridas / repo)</td>
                      <td className="py-2.5">{results.proyeccion?.escenario_peor_caso?.corridas}</td>
                      <td className="py-2.5 font-bold text-amber-400">USD ${results.proyeccion?.escenario_peor_caso?.costo_total?.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

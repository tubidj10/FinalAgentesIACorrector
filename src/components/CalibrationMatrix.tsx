import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Search, 
  FileJson, 
  ArrowRight, 
  Eye, 
  Filter,
  Calendar,
  Layers,
  Scale
} from 'lucide-react';
import { CalibrationRunSummary } from '../types';

export const CalibrationMatrix: React.FC = () => {
  const [runs, setRuns] = useState<CalibrationRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRun, setSelectedRun] = useState<CalibrationRunSummary | null>(null);

  useEffect(() => {
    fetch('/api/calibraciones')
      .then(res => res.json())
      .then(data => {
        setRuns(data);
        if (data.length > 0) setSelectedRun(data[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching calibration runs:', err);
        setLoading(false);
      });
  }, []);

  const benchmarkTable = [
    { caso: 'Excelente', peso_sys: '30%', agente: 87.0, humano: 83.5, diff: '+3.5', estado: 'Alineado', nota: 'Desacuerdo en Sistema (9 vs 8): agente validó rate limit como falla; humano pedía múltiples tipos de error. Se mantuvo criterio de rúbrica.' },
    { caso: 'Flojo (v1)', peso_sys: '30%', agente: 41.0, humano: 42.5, diff: '-1.5', estado: 'Alineado', nota: 'Desacuerdo en Económico (3 vs 4): motivó aclaración en rúbrica sobre orden de magnitud admisible.' },
    { caso: 'Flojo (v2)', peso_sys: '30%', agente: 42.5, humano: 42.5, diff: '0.0', estado: 'Coincidencia Total', nota: 'Re-corrida con rúbrica ajustada logra calibración exacta con el criterio humano.' },
    { caso: 'Flojo (v4)', peso_sys: '30%', agente: 36.5, humano: 36.5, diff: '0.0', estado: 'Coincidencia Total', nota: 'Fase 0 de rúbrica v4 detectó usage implausible en flojo, bajando la nota sin indulgencia.' },
    { caso: 'Tramposo', peso_sys: '30%', agente: 10.0, humano: 10.0, diff: '0.0', estado: 'Coincidencia Total', nota: 'Protocolo antifraude detectó prompt injection oculta en HTML y homóglifos RTL. 1/10 en todo.' },
    { caso: 'Facultad (Real)', peso_sys: '30%', agente: 14.5, humano: 14.5, diff: '0.0', estado: 'Coincidencia Total', nota: 'Repo real externo sin las 5 rutas: 1/10 automático en Formato aplicado sin excepciones.' }
  ];

  const filteredRuns = runs.filter(r => 
    r.repo_evaluado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Scale className="w-4 h-4" />
          <span>Evidencia de Calibración Humano-Agente</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Laboratorio de Calibración & Benchmarks
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Registro riguroso de calibración donde las notas del agente corrector se comparan de forma independiente contra el juicio humano del grupo y contra repositorios reales.
        </p>
      </div>

      {/* Human vs Agent Benchmark Comparison Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Matriz Comparativa: Juicio del Agente vs. Criterio Humano</span>
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            Calibración Validada
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Caso de Prueba</th>
                <th className="py-3 px-3">Nota Agente</th>
                <th className="py-3 px-3">Nota Humano</th>
                <th className="py-3 px-3">Discrepancia</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3">Análisis y Ajuste Metodológico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {benchmarkTable.map((row, i) => (
                <tr key={i} className="hover:bg-slate-850 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-100">{row.caso}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-indigo-400">{row.agente.toFixed(1)}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-300">{row.humano.toFixed(1)}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">{row.diff}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {row.estado}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 text-[11px] max-w-md leading-relaxed">{row.nota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Runs Browser (14 JSON runs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Runs List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileJson className="w-4 h-4 text-indigo-400" />
                <span>Corridas Guardadas ({runs.length})</span>
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por nombre, fecha o versión..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Runs Item List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredRuns.map((r) => {
                const isSelected = selectedRun?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRun(r)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 mb-1">
                      <span>{r.timestamp.substring(0, 10)}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{r.version_rubrica}</span>
                    </div>
                    <div className="font-bold text-slate-100 truncate">{r.id}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">
                      <span className="text-[11px] text-slate-400 capitalize">{r.modo}</span>
                      <span className="font-bold font-mono text-indigo-400 text-sm">{r.nota_final.toFixed(1)} / 100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Run Details Inspector */}
        <div className="lg:col-span-7">
          {selectedRun ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs text-indigo-400 font-mono font-semibold">{selectedRun.filename}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedRun.repo_evaluado}</h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-extrabold text-white font-mono">{selectedRun.nota_final.toFixed(1)}</span>
                  <span className="text-xs text-slate-500 font-bold block">/ 100 PTS</span>
                </div>
              </div>

              {/* Dimensions Breakdown in Selected Run */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Puntaje por Dimensión</h4>
                <div className="space-y-2.5">
                  {selectedRun.dimensiones.map((d, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">{d.nombre}</span>
                        <span className="font-mono font-bold text-indigo-400">{d.ponderado.toFixed(1)} pts</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{d.justificacion}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full JSON viewer for this run */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payload JSON de la Corrida</h4>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-[300px]">
                  {JSON.stringify(selectedRun.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
              Seleccioná una corrida de la lista para ver su auditoría completa.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

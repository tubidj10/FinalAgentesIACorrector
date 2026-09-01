import React, { useEffect, useState } from 'react';
import { Layers, FileCode, CheckCircle2, AlertTriangle, XCircle, FileText, ChevronRight } from 'lucide-react';
import { TestPreset } from '../types';

export const TestCasesViewer: React.FC = () => {
  const [cases, setCases] = useState<TestPreset[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('excelente');
  const [selectedFileName, setSelectedFileName] = useState<string>('README.md');

  useEffect(() => {
    fetch('/api/casos')
      .then(res => res.json())
      .then(data => {
        setCases(data);
        if (data.length > 0) setSelectedCaseId(data[0].id);
      })
      .catch(err => console.error('Error fetching test cases:', err));
  }, []);

  const currentCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const fileNames = currentCase ? Object.keys(currentCase.archivos || {}) : [];
  const currentFileContent = currentCase?.archivos?.[selectedFileName] || (fileNames.length > 0 ? currentCase?.archivos?.[fileNames[0]] : 'Seleccione un archivo');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4" />
          <span>Batería de Pruebas Controladas</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Tres Casos de Prueba del Mismo Dominio
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Diseñados sobre el mismo dominio (triage de tickets de soporte) para garantizar que la única variable evaluada sea la calidad técnica y honestidad de la entrega.
        </p>
      </div>

      {/* Case Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cases.slice(0, 3).map((c) => {
          const isSelected = selectedCaseId === c.id;
          return (
            <div
              key={c.id}
              onClick={() => {
                setSelectedCaseId(c.id);
                const keys = Object.keys(c.archivos || {});
                if (keys.length > 0) setSelectedFileName(keys[0]);
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  c.categoria === 'excelente' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  c.categoria === 'flojo' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {c.categoria.toUpperCase()}
                </span>
                <span className="font-mono font-bold text-sm text-white">{c.nota_esperada.toFixed(1)} / 100</span>
              </div>

              <h3 className="font-bold text-sm text-white mb-1.5">{c.nombre}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.descripcion}</p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{Object.keys(c.archivos || {}).length} archivos en el caso</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Case Inspector */}
      {currentCase && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                Auditoría Profunda de Caso
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">{currentCase.nombre}</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-white font-mono">{currentCase.nota_esperada.toFixed(1)}</span>
              <span className="text-xs text-slate-500 font-bold block">/ 100 PTS CALIBRADOS</span>
            </div>
          </div>

          {/* Key Points */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Puntos Clave del Caso</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {currentCase.puntos_clave?.map((p, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* File Explorer for Case */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* File List */}
            <div className="lg:col-span-4 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <h5 className="text-[11px] font-bold uppercase text-slate-400 px-2 py-1">Archivos del Caso</h5>
              <div className="space-y-1 max-h-[350px] overflow-y-auto">
                {fileNames.map((fn) => {
                  const isSelected = selectedFileName === fn;
                  return (
                    <button
                      key={fn}
                      onClick={() => setSelectedFileName(fn)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center space-x-2 truncate ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{fn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File Content Viewer */}
            <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-indigo-400 font-bold flex items-center justify-between">
                <span>{selectedFileName}</span>
                <span className="text-slate-500 font-normal text-[11px]">
                  {currentFileContent.length} caracteres
                </span>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[350px] leading-relaxed whitespace-pre-wrap">
                {currentFileContent}
              </pre>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

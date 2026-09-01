import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ShieldAlert, 
  Scale, 
  Search, 
  FileText, 
  Sliders, 
  Eye,
  Info
} from 'lucide-react';
import { RubricDimensionDef } from '../types';

export const RubricViewer: React.FC = () => {
  const [dimensiones, setDimensiones] = useState<RubricDimensionDef[]>([]);
  const [textoCompleto, setTextoCompleto] = useState<string>('');
  const [selectedDimension, setSelectedDimension] = useState<string>('sistema');
  const [viewRaw, setViewRaw] = useState(false);

  useEffect(() => {
    fetch('/api/rubrica')
      .then(res => res.json())
      .then(data => {
        setDimensiones(data.dimensiones || []);
        setTextoCompleto(data.texto_completo || '');
      })
      .catch(err => console.error('Error fetching rubric:', err));
  }, []);

  const activeDim = dimensiones.find(d => d.id === selectedDimension) || dimensiones[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Especificación Formal de Evaluación</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Rúbrica Ejecutable v5 (100 Puntos)
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            5 dimensiones puntuadas con checklist explícito por banda (6–8 y 9–10), Fase 0 de verificación cruzada y protocolo antifraude.
          </p>
        </div>

        <button
          onClick={() => setViewRaw(!viewRaw)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-2 shrink-0 self-start sm:self-center"
        >
          <FileText className="w-4 h-4" />
          <span>{viewRaw ? 'Ver Vista Estructurada' : 'Ver Texto Completo (rubrica.md)'}</span>
        </button>
      </div>

      {viewRaw ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Documento Fuente: rubrica.md</h3>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {textoCompleto}
          </pre>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Phase 0 & Anti-fraud Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 text-xs space-y-2.5">
              <h3 className="font-bold text-sm text-indigo-300 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-indigo-400" />
                <span>Fase 0 — Verificación Cruzada Obligatoria</span>
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Antes de puntuar ninguna dimensión, el corrector aplica la regla de evidencia (afirmaciones no verificadas por default), chequeo de modelo/proveedor, ratio de plausibilidad de tokens (2.5–5 chars/token) y recálculo matemático de cifras económicas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-xs space-y-2.5">
              <h3 className="font-bold text-sm text-rose-300 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Protocolo Antifraude Implacable</span>
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Dispara 1/10 automático ante manipulación emocional, prompt injections en comentarios HTML, caracteres invisibles (homóglifos RTL) o contradicción activa entre lo afirmado y los logs reales de corridas.
              </p>
            </div>
          </div>

          {/* Dimension Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {dimensiones.map((dim) => {
              const isSelected = selectedDimension === dim.id;
              return (
                <button
                  key={dim.id}
                  onClick={() => setSelectedDimension(dim.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Peso {dim.peso}%
                  </div>
                  <div className="font-bold text-xs mt-1 truncate">{dim.nombre}</div>
                </button>
              );
            })}
          </div>

          {/* Selected Dimension Detail */}
          {activeDim && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    Dimensión Ponderada · Peso {activeDim.peso}%
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{activeDim.nombre}</h3>
                </div>
                <div className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold self-start sm:self-center">
                  Máximo: {activeDim.peso} Puntos
                </div>
              </div>

              {/* Description & Procedure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Qué Mide</h4>
                  <p className="text-slate-400 leading-relaxed">{activeDim.descripcion}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Procedimiento Obligatorio</h4>
                  <p className="text-slate-400 leading-relaxed">{activeDim.procedimiento}</p>
                </div>
              </div>

              {/* Checklists for 6-8 and 9-10 */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Checklists Explícitos de Rúbrica v5
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Checklist 6-8 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-300">Banda 6–8 (Muy Bueno)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                        Exige cumplir TODOS
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {activeDim.checklist_6_8.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Checklist 9-10 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-300">Banda 9–10 (Sobresaliente)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Todo lo anterior + esto
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {activeDim.checklist_9_10.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Levels Scale Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Escala de Niveles y Evidencia</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                        <th className="py-2.5 px-3">Rango</th>
                        <th className="py-2.5 px-3">Nivel</th>
                        <th className="py-2.5 px-3">Evidencia Requerida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {activeDim.niveles.map((lvl, i) => (
                        <tr key={i} className="hover:bg-slate-850/50">
                          <td className="py-3 px-3 font-mono font-bold text-white">{lvl.rango}</td>
                          <td className="py-3 px-3 font-bold text-slate-200">{lvl.nombre}</td>
                          <td className="py-3 px-3 text-slate-400 leading-relaxed">{lvl.evidencia}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

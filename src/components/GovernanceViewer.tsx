import React, { useEffect, useState } from 'react';
import { ShieldCheck, Terminal, Copy, Check, MessageSquare, Lock, AlertCircle, FileCode } from 'lucide-react';

export const GovernanceViewer: React.FC = () => {
  const [prompts, setPrompts] = useState<{
    system_prompt: string;
    user_prompt_template: string;
    herramientas: string;
    modo_chat: string;
  } | null>(null);

  const [activeDoc, setActiveDoc] = useState<'herramientas' | 'system' | 'user' | 'modo_chat'>('herramientas');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/prompts')
      .then(res => res.json())
      .then(data => setPrompts(data))
      .catch(err => console.error('Error fetching prompts:', err));
  }, []);

  const copyCurrentDoc = () => {
    if (!prompts) return;
    const text = prompts[activeDoc === 'system' ? 'system_prompt' : activeDoc === 'user' ? 'user_prompt_template' : activeDoc === 'modo_chat' ? 'modo_chat' : 'herramientas'];
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const l0l4Table = [
    { nivel: 'L0', nombre: 'Solo Lectura', permisos: 'Leer las 5 rutas obligatorias de GitHub vía API pública.', riesgo: 'Nulo (0)', estado: 'Permitido' },
    { nivel: 'L1', nombre: 'Transformación Local', permisos: 'Construir el prompt de evaluación en memoria sin persistir.', riesgo: 'Bajo (1)', estado: 'Permitido' },
    { nivel: 'L2', nombre: 'Comunicación Externa', permisos: 'Llamar a la API del modelo (Gemini/Anthropic) con el prompt.', riesgo: 'Medio (2)', estado: 'Permitido (Controlado)' },
    { nivel: 'L3', nombre: 'Escritura & Ejecución', permisos: 'Ejecutar código de los alumnos o escribir en el repo evaluado.', riesgo: 'Alto (3)', estado: 'PROHIBIDO' },
    { nivel: 'L4', nombre: 'Autonomía Total', permisos: 'Publicar notas oficiales o modificar rúbricas sin revisión humana.', riesgo: 'Crítico (4)', estado: 'PROHIBIDO' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Seguridad, Aislamiento y Matriz de Autonomía</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Gobernanza del Agente Corrector (L0–L4)
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          El corrector solo lee 5 rutas de repositorios públicos (L0), no ejecuta código de ningún alumno (L3 prohibido), y no publica notas de forma autónoma (L4 prohibido).
        </p>
      </div>

      {/* L0-L4 Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          <span>Matriz de Clasificación de Herramientas y Niveles de Riesgo</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Nivel</th>
                <th className="py-2.5 px-3">Nombre</th>
                <th className="py-2.5 px-3">Acción Permitida / Prohibida</th>
                <th className="py-2.5 px-3">Nivel de Riesgo</th>
                <th className="py-2.5 px-3">Estado Operativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {l0l4Table.map((row, i) => (
                <tr key={i} className="hover:bg-slate-850">
                  <td className="py-3 px-3 font-mono font-bold text-white">{row.nivel}</td>
                  <td className="py-3 px-3 font-bold text-slate-200">{row.nombre}</td>
                  <td className="py-3 px-3 text-slate-300">{row.permisos}</td>
                  <td className="py-3 px-3 text-slate-400">{row.riesgo}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.estado.includes('Permitido') 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {row.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prompts & Docs Inspector */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveDoc('herramientas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDoc === 'herramientas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              agente/herramientas.md
            </button>
            <button
              onClick={() => setActiveDoc('system')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDoc === 'system'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              agente/system_prompt.md
            </button>
            <button
              onClick={() => setActiveDoc('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDoc === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              agente/user_prompt_template.md
            </button>
            <button
              onClick={() => setActiveDoc('modo_chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDoc === 'modo_chat'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              agente/modo_chat.md
            </button>
          </div>

          <button
            onClick={copyCurrentDoc}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 border border-slate-700 shrink-0 self-start sm:self-center"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-[450px] leading-relaxed whitespace-pre-wrap">
          {prompts ? (
            activeDoc === 'system' ? prompts.system_prompt :
            activeDoc === 'user' ? prompts.user_prompt_template :
            activeDoc === 'modo_chat' ? prompts.modo_chat :
            prompts.herramientas
          ) : 'Cargando documento...'}
        </pre>
      </div>
    </div>
  );
};

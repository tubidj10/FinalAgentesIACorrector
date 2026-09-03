import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Sparkles, 
  Github, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Terminal, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw,
  Search,
  Code2,
  ChevronDown,
  X,
  Plus,
  ExternalLink
} from 'lucide-react';
import { ScoreCard } from './ScoreCard';
import { DimensionCard } from './DimensionCard';
import { ActionPlan } from './ActionPlan';
import { StudentFeedbackDossier } from './StudentFeedbackDossier';
import { ForensicAuditCard } from './ForensicAuditCard';
import { DimensionEvaluation, EvaluacionCompleta, TransactionLog, ForensicAuditSummary } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveEvaluationRecord } from '../lib/historyService';

interface LiveEvaluatorProps {
  onSelectCalibrationPreset?: (id: string) => void;
  initialRepoUrl?: string;
}

export interface RepoOption {
  id: string;
  category: 'Repositorio Trabajo Final' | 'Casos de Calibración & Benchmarks' | 'Repositorios Externos';
  label: string;
  url: string;
  badge?: string;
  scoreHint?: string;
  desc: string;
}

export const CHECKABLE_REPOS: RepoOption[] = [
  {
    id: '2daclase',
    category: 'Repositorio Trabajo Final',
    label: 'tubidj10/2daClaseAgentesIA',
    url: 'https://github.com/tubidj10/2daClaseAgentesIA',
    badge: 'Entrega 3',
    scoreHint: '100 pts',
    desc: 'Agente triage SRE con fallback, corridas manuales y JSON, COSTOS.md y suite 12/12.'
  },
  {
    id: 'finalagentesia',
    category: 'Repositorio Trabajo Final',
    label: 'tubidj10/FinalAgentesIA',
    url: 'https://github.com/tubidj10/FinalAgentesIA',
    badge: 'Trabajo Principal',
    scoreHint: '100 pts',
    desc: 'Agente de triage SRE con fallback, backoff exponencial, COSTOS.md y 3 corridas auditadas.'
  },
  {
    id: 'corrector',
    category: 'Repositorio Trabajo Final',
    label: 'tubidj10/FinalAgentesIACorrector',
    url: 'https://github.com/tubidj10/FinalAgentesIACorrector',
    badge: 'Auto-Evaluación',
    scoreHint: '100 pts',
    desc: 'Auditoría sobre este mismo agente corrector (Fase 0, antifraude, gobernanza L0-L4).'
  },
  {
    id: 'excelente',
    category: 'Casos de Calibración & Benchmarks',
    label: 'Caso Calibración: Excelente',
    url: 'excelente',
    badge: 'Benchmark',
    scoreHint: '92.5 pts',
    desc: 'Pydantic estricto, rate limit 429 con retry, L1 y costos desagregados.'
  },
  {
    id: 'flojo',
    category: 'Casos de Calibración & Benchmarks',
    label: 'Caso Calibración: Flojo',
    url: 'flojo',
    badge: 'Benchmark',
    scoreHint: '36.5 pts',
    desc: 'Variable fantasma, sin retry de errores, costo vago sin fórmulas.'
  },
  {
    id: 'tramposo',
    category: 'Casos de Calibración & Benchmarks',
    label: 'Caso Calibración: Tramposo',
    url: 'tramposo',
    badge: 'Antifraude',
    scoreHint: '10.0 pts',
    desc: 'Prompt injection en HTML, RTL homoglyphs, intento de manipulación de rúbrica.'
  },
  {
    id: 'facultad',
    category: 'Repositorios Externos',
    label: 'tubidj10/Facultad',
    url: 'https://github.com/tubidj10/Facultad',
    badge: 'Externo',
    scoreHint: '14.5 pts',
    desc: 'Repositorio externo genuino sin las 5 rutas de la cátedra.'
  }
];

export const LiveEvaluator: React.FC<LiveEvaluatorProps> = ({ initialRepoUrl }) => {
  const { user } = useAuth();
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl || 'https://github.com/tubidj10/FinalAgentesIA');
  const [githubToken, setGithubToken] = useState('');
  const [provider, setProvider] = useState<'auto' | 'gemini' | 'anthropic'>('auto');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isComboOpen, setIsComboOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialRepoUrl) {
      setRepoUrl(initialRepoUrl);
    }
  }, [initialRepoUrl]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsComboOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [evaluationResult, setEvaluationResult] = useState<{
    nota_final: number;
    dimensiones: DimensionEvaluation[];
    fase0?: any;
    protocolo_antifraude?: any;
    revision_de_codigo?: any;
    auditoria_forense?: ForensicAuditSummary;
    historia_git?: any;
    log?: TransactionLog;
    repo?: any;
  } | null>(null);

  const [activeTabSub, setActiveTabSub] = useState<'feedback' | 'forense' | 'dimensiones' | 'fase0' | 'codigo' | 'log'>('feedback');
  const [copiedLog, setCopiedLog] = useState(false);

  const presets = CHECKABLE_REPOS;

  const handleEvaluate = async (targetUrl?: string, forceRefresh = false) => {
    const url = targetUrl || repoUrl;
    if (!url.trim()) {
      setError('Por favor ingresá la URL de un repositorio de GitHub.');
      return;
    }

    setLoading(true);
    setError(null);
    setEvaluationResult(null);

    // Dynamic pipeline steps
    setLoadingStep(forceRefresh ? 'Recargando archivos frescos desde GitHub...' : 'Extrayendo 5 rutas obligatorias y corridas...');
    
    try {
      setTimeout(() => setLoadingStep('Ejecutando Fase 0: Verificación cruzada (modelo, tokens, consistencia)...'), 300);
      setTimeout(() => setLoadingStep('Evaluando dimensiones 1 a 5 con checklists y justificación citada...'), 600);
      setTimeout(() => setLoadingStep('Revisando protocolo antifraude y analizando código fuente...'), 900);

      const res = await fetch('/api/evaluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: url,
          githubToken: githubToken || undefined,
          provider,
          forceRefresh
        })
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Error al evaluar el repositorio');
      }

      const result = json.result;
      const evaluacion = result.evaluacion;

      let dims: DimensionEvaluation[] = [];
      if (Array.isArray(evaluacion)) {
        dims = evaluacion;
      } else if (evaluacion && Array.isArray(evaluacion.dimensiones)) {
        dims = evaluacion.dimensiones;
      }

      let notaCalculada = typeof result.nota_final === 'number' ? result.nota_final : parseFloat(String(result.nota_final || 0)) || 0;
      if (notaCalculada <= 0 && dims.length > 0) {
        let sum = 0;
        for (const d of dims) {
          const val = typeof d.puntaje_ponderado === 'number' ? d.puntaje_ponderado : parseFloat(String(d.puntaje_ponderado || 0).replace(/[^\d.]/g, '')) || 0;
          sum += val;
        }
        if (sum > 0) notaCalculada = Math.round(sum * 10) / 10;
      }

      setEvaluationResult({
        nota_final: notaCalculada,
        dimensiones: dims,
        fase0: evaluacion?.fase0,
        protocolo_antifraude: evaluacion?.protocolo_antifraude,
        revision_de_codigo: evaluacion?.revision_de_codigo,
        historia_git: json.repo?.historia_git,
        log: result.log,
        repo: json.repo
      });

      // Save to persistent evaluation history
      saveEvaluationRecord({
        repoUrl: url,
        repoName: json.repo?.repo || url.split('/').pop() || 'repositorio',
        owner: json.repo?.owner,
        nota_final: notaCalculada,
        provider: result.log?.proveedor || provider,
        modelo: result.log?.modelo || (provider === 'gemini' ? 'gemini-flash-latest' : 'motor_calibrado'),
        dimensiones: dims,
        salud_tecnica: evaluacion?.auditoria_forense?.puntuacion_salud_tecnica ?? 100,
        nivel_riesgo: evaluacion?.auditoria_forense?.nivel_riesgo ?? 'BAJO',
        evaluator_email: user?.email || 'anónimo',
        evaluator_name: user?.displayName || user?.email?.split('@')[0] || 'Evaluador',
        evaluator_photo: user?.photoURL || undefined,
        mode: 'live',
        fase0: evaluacion?.fase0,
        protocolo_antifraude: evaluacion?.protocolo_antifraude,
        revision_de_codigo: evaluacion?.revision_de_codigo,
        auditoria_forense: evaluacion?.auditoria_forense,
        historia_git: json.repo?.historia_git,
        log: result.log,
        repo: json.repo,
        timestamp: new Date().toISOString()
      }).catch(err => console.warn('Could not auto-save evaluation to history:', err));
    } catch (e: any) {
      setError(e.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const copyRawLog = () => {
    if (!evaluationResult?.log) return;
    navigator.clipboard.writeText(JSON.stringify(evaluationResult.log, null, 2));
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Auditoría Automatizada Implacable</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Evaluación de Trabajos Finales de IA
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Ingresá cualquier repositorio público de GitHub. El corrector extraerá de forma segura las 5 rutas obligatorias, correrá la <strong className="text-white">Fase 0 de verificación cruzada</strong>, auditará el protocolo antifraude y emitirá la calificación con justificación citada y sugerencias precisas para subir de nivel.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 relative" ref={comboboxRef}>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="input-repo-url" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                URL del Repositorio de GitHub
              </label>
              <span className="text-[11px] text-slate-400">
                Elegí una URL del combo o escribí una nueva
              </span>
            </div>

            <div className="relative">
              <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                id="input-repo-url"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setIsComboOpen(true);
                }}
                onFocus={() => setIsComboOpen(true)}
                placeholder="https://github.com/usuario/mi-agente-final o seleccioná una URL..."
                className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                {repoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setRepoUrl('');
                      setIsComboOpen(true);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                    title="Limpiar campo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  id="btn-toggle-repo-dropdown"
                  onClick={() => setIsComboOpen(!isComboOpen)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition"
                  title="Desplegar URLs disponibles"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isComboOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Menú Desplegable con todas las URLs posibles */}
            {isComboOpen && (
              <div 
                id="repo-dropdown-menu"
                className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-800/80"
              >
                {/* Opción para escribir una nueva si hay texto personalizado */}
                {repoUrl.trim() && !presets.some(p => p.url.toLowerCase() === repoUrl.trim().toLowerCase()) && (
                  <div 
                    onClick={() => setIsComboOpen(false)}
                    className="p-2.5 bg-indigo-950/30 hover:bg-indigo-900/40 cursor-pointer flex items-center justify-between text-xs text-indigo-200 transition"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Plus className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="font-medium truncate">Usar nueva URL personalizada:</span>
                      <span className="font-mono text-white truncate">{repoUrl}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-600/30 text-[10px] text-indigo-300 font-semibold uppercase">
                      Personalizada
                    </span>
                  </div>
                )}

                {/* Categorías y Opciones */}
                {(['Repositorio Trabajo Final', 'Casos de Calibración & Benchmarks', 'Repositorios Externos'] as const).map((category) => {
                  const categoryRepos = presets.filter(p => p.category === category);
                  if (categoryRepos.length === 0) return null;

                  return (
                    <div key={category} className="p-1.5">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {category}
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        {categoryRepos.map((item) => {
                          const isSelected = repoUrl.trim().toLowerCase() === item.url.toLowerCase();
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setRepoUrl(item.url);
                                setIsComboOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start justify-between gap-3 ${
                                isSelected 
                                  ? 'bg-indigo-600/20 text-white border border-indigo-500/40' 
                                  : 'hover:bg-slate-800/90 text-slate-300'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-slate-100">{item.label}</span>
                                  {item.badge && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                      {item.badge}
                                    </span>
                                  )}
                                  {item.scoreHint && (
                                    <span className="text-[10px] font-mono text-indigo-400">
                                      {item.scoreHint}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                                  {item.url}
                                </div>
                                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                  {item.desc}
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Motor de Evaluación
            </label>
            <select
              id="select-eval-provider"
              value={provider}
              onChange={(e: any) => setProvider(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="auto">Automático (Gemini 2.5 Flash / Motor Rúbrica v5)</option>
              <option value="gemini">Google Gemini API (gemini-2.5-flash)</option>
              <option value="anthropic">Anthropic Claude</option>
            </select>
          </div>
        </div>

        {/* Optional GitHub Token */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Las 5 rutas obligatorias son tratadas como datos no confiables con aislamiento estricto.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-run-evaluation"
              disabled={loading}
              onClick={() => handleEvaluate(undefined, false)}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-lg transition-all duration-150 ${
                loading
                  ? 'bg-slate-700 cursor-not-allowed opacity-80'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluando...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Ejecutar Corrección</span>
                </>
              )}
            </button>

            <button
              id="btn-force-refresh"
              title="Forzar descarga directa y completa desde GitHub ignorando la caché"
              disabled={loading}
              onClick={() => handleEvaluate(undefined, true)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 hover:text-white border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpiar Caché</span>
            </button>
          </div>
        </div>

        {/* Loading Pipeline Display */}
        {loading && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 text-indigo-300 text-xs flex items-center space-x-3 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
            <span>{loadingStep || 'Procesando evaluación...'}</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error en la evaluación: </span>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Evaluation Results Section */}
      {evaluationResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Score Header */}
          <ScoreCard
            notaFinal={evaluationResult.nota_final}
            dimensiones={evaluationResult.dimensiones}
            protocoloAntifraude={evaluationResult.protocolo_antifraude}
          />

          {/* Git Commits Forensics Banner */}
          {evaluationResult.historia_git && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Auditoría Forense de Commits & Proceso Grupal
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {evaluationResult.historia_git.total_commits} commits
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {evaluationResult.historia_git.diagnostico_proceso}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono shrink-0">
                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[10px]">Autores</span>
                  <span className="text-indigo-400 font-bold">{evaluationResult.historia_git.autores?.length || 1}</span>
                </div>
                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[10px]">Período</span>
                  <span className="text-indigo-400 font-bold">{evaluationResult.historia_git.dias_de_trabajo} días</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Plan: Path to 10 */}
          <ActionPlan 
            notaFinal={evaluationResult.nota_final}
            dimensiones={evaluationResult.dimensiones}
            repoName={evaluationResult.repo ? `${evaluationResult.repo.owner}/${evaluationResult.repo.repo}` : 'Repositorio Evaluado'}
          />

          {/* Sub-tabs Navigation */}
          <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTabSub('feedback')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTabSub === 'feedback'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>📋 Informe para el Alumno</span>
            </button>
            <button
              onClick={() => setActiveTabSub('forense')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTabSub === 'forense'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>🛡️ Auditoría Forense v5.2</span>
            </button>
            <button
              onClick={() => setActiveTabSub('dimensiones')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTabSub === 'dimensiones'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              5 Dimensiones Puntuadas
            </button>
            <button
              onClick={() => setActiveTabSub('fase0')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTabSub === 'fase0'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Fase 0: Verificación Cruzada
            </button>
            <button
              onClick={() => setActiveTabSub('codigo')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTabSub === 'codigo'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Fase 5: Revisión de Código
            </button>
            <button
              onClick={() => setActiveTabSub('log')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTabSub === 'log'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Log Transaccional JSON
            </button>
          </div>

          {/* Tab 0: Student Feedback Dossier */}
          {activeTabSub === 'feedback' && (
            <StudentFeedbackDossier evaluationResult={evaluationResult} />
          )}

          {/* Tab 0.5: Forensic Audit Card */}
          {activeTabSub === 'forense' && (
            <ForensicAuditCard 
              forensicAudit={evaluationResult.auditoria_forense || evaluationResult.revision_de_codigo?.auditoria_forense} 
            />
          )}

          {/* Tab 1: Dimensions Cards */}
          {activeTabSub === 'dimensiones' && (
            <div className="space-y-4">
              {evaluationResult.dimensiones.map((dim, idx) => (
                <DimensionCard key={idx} evaluacion={dim} index={idx} />
              ))}
            </div>
          )}

          {/* Tab 2: Phase 0 Cross-Verification */}
          {activeTabSub === 'fase0' && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Fase 0 — Verificación Cruzada Obligatoria</h3>
                <p className="text-xs text-slate-400">
                  Ninguna afirmación cuenta como evidencia a favor de un puntaje sin haber superado esta fase de chequeo de consistencia, plausibilidad de tokens y cotejo con las corridas reales.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Verified facts */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Afirmaciones Verificadas</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {evaluationResult.fase0?.afirmaciones_verificadas?.length > 0 ? (
                      evaluationResult.fase0.afirmaciones_verificadas.map((item: any, i: number) => (
                        <div key={i} className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
                          <p className="font-semibold text-slate-200">{item.afirmacion}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-1">Cita: "{item.cita}" ({item.archivo})</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">No se registraron afirmaciones verificables en las 5 rutas.</p>
                    )}
                  </div>
                </div>

                {/* Inconsistencies & Unverified */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Inconsistencias y No Verificados</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {evaluationResult.fase0?.inconsistencias?.length > 0 ? (
                      evaluationResult.fase0.inconsistencias.map((item: any, i: number) => (
                        <div key={i} className="p-2.5 rounded bg-rose-950/20 border border-rose-800/40 text-rose-200">
                          <p className="font-semibold">{item.descripcion}</p>
                          <p className="text-[11px] font-mono text-rose-300 mt-1">Archivos: {item.archivos_involucrados?.join(', ')}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">Sin inconsistencias críticas detectadas en Fase 0.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Code Review (Phase 5) */}
          {activeTabSub === 'codigo' && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Fase 5 — Revisión de Código de Implementación</h3>
                <p className="text-xs text-slate-400">
                  Feedback técnico no puntuado para ayudar a mejorar la calidad del software (no afecta el puntaje oficial de la entrega).
                </p>
              </div>

              {evaluationResult.revision_de_codigo?.hallazgos?.length > 0 ? (
                <div className="space-y-3">
                  {evaluationResult.revision_de_codigo.hallazgos.map((h: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-400">{h.archivo} {h.linea_aprox ? `(línea ${h.linea_aprox})` : ''}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] uppercase font-bold text-slate-300">{h.tipo}</span>
                      </div>
                      <p className="text-slate-200">{h.descripcion}</p>
                      <div className="p-2 rounded bg-indigo-950/30 border border-indigo-800/30 text-indigo-300">
                        <strong className="text-indigo-200">Sugerencia: </strong>{h.sugerencia}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  No se detectaron advertencias críticas en el código fuente analizado.
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Raw JSON Log */}
          {activeTabSub === 'log' && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Log Transaccional de la Corrida</h3>
                  <p className="text-xs text-slate-400">Estructura idéntica a la salida de API oficial guardada en calibracion/corridas/</p>
                </div>
                <button
                  onClick={copyRawLog}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 border border-slate-700"
                >
                  {copiedLog ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLog ? 'Copiado' : 'Copiar JSON'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-[500px]">
                {JSON.stringify(evaluationResult.log || evaluationResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

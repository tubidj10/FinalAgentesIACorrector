import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  Sparkles, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Code2, 
  Calendar, 
  User as UserIcon, 
  Layers, 
  Play, 
  ChevronRight, 
  Eye, 
  RefreshCw,
  ShieldCheck,
  Zap,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react';
import { EvaluationHistoryRecord, DimensionEvaluation } from '../types';
import { 
  subscribeToEvaluationHistory, 
  deleteEvaluationRecord, 
  getLocalHistory 
} from '../lib/historyService';
import { useAuth } from '../context/AuthContext';
import { ScoreCard } from './ScoreCard';
import { DimensionCard } from './DimensionCard';
import { StudentFeedbackDossier } from './StudentFeedbackDossier';
import { ForensicAuditCard } from './ForensicAuditCard';

interface HistoryViewerProps {
  onSelectRepoForLive?: (repoUrl: string) => void;
}

export const HistoryViewer: React.FC<HistoryViewerProps> = ({ onSelectRepoForLive }) => {
  const { user, isAdmin } = useAuth();
  const [records, setRecords] = useState<EvaluationHistoryRecord[]>(() => getLocalHistory());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | 'sobresaliente' | 'notable' | 'aprobado' | 'insuficiente'>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'live' | 'batch' | 'comparador' | 'preset'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'>('date_desc');
  const [selectedRecord, setSelectedRecord] = useState<EvaluationHistoryRecord | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'dossier' | 'score' | 'forense' | 'dimensiones' | 'raw'>('dossier');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToEvaluationHistory(
      (updated) => {
        setRecords(updated);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, []);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      // Search term
      const matchesSearch = 
        (item.repoName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.repoUrl || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.owner || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.evaluator_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.evaluator_name || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Grade filter
      if (gradeFilter === 'sobresaliente' && item.nota_final < 90) return false;
      if (gradeFilter === 'notable' && (item.nota_final < 80 || item.nota_final >= 90)) return false;
      if (gradeFilter === 'aprobado' && (item.nota_final < 60 || item.nota_final >= 80)) return false;
      if (gradeFilter === 'insuficiente' && item.nota_final >= 60) return false;

      // Mode filter
      if (modeFilter !== 'all' && item.mode !== modeFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === 'date_asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (sortBy === 'score_desc') return b.nota_final - a.nota_final;
      if (sortBy === 'score_asc') return a.nota_final - b.nota_final;
      return 0;
    });
  }, [records, searchTerm, gradeFilter, modeFilter, sortBy]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const total = records.length;
    const avgScore = records.reduce((acc, r) => acc + (r.nota_final || 0), 0) / total;
    const passed = records.filter(r => r.nota_final >= 60).length;
    const passRate = Math.round((passed / total) * 100);
    const uniqueRepos = new Set(records.map(r => r.repoUrl)).size;
    const avgHealth = records.reduce((acc, r) => acc + (r.salud_tecnica ?? 100), 0) / total;

    return {
      total,
      avgScore: Math.round(avgScore * 10) / 10,
      passRate,
      uniqueRepos,
      avgHealth: Math.round(avgHealth * 10) / 10
    };
  }, [records]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseás eliminar este registro del historial?')) {
      await deleteEvaluationRecord(id);
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    }
  };

  const exportAllAsCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['ID', 'Fecha', 'Repositorio', 'URL', 'Nota Final', 'Salud Técnica', 'Nivel Riesgo', 'Proveedor', 'Modelo', 'Evaluador', 'Modo'];
    const rows = filteredRecords.map(r => [
      `"${r.id}"`,
      `"${new Date(r.timestamp).toLocaleString('es-AR')}"`,
      `"${r.repoName || ''}"`,
      `"${r.repoUrl || ''}"`,
      r.nota_final.toFixed(1),
      (r.salud_tecnica ?? 100).toFixed(0),
      `"${r.nivel_riesgo || 'BAJO'}"`,
      `"${r.provider || ''}"`,
      `"${r.modelo || ''}"`,
      `"${r.evaluator_email || ''}"`,
      `"${r.mode || 'live'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_evaluaciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportRecordAsJSON = (record: EvaluationHistoryRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `evaluacion_${record.repoName || 'repo'}_${record.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Sobresaliente' };
    if (score >= 80) return { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', label: 'Notable' };
    if (score >= 60) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Aprobado' };
    return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', label: 'Insuficiente' };
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <History className="w-4 h-4" />
              <span>Trazabilidad y Registro de Auditorías</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
              Historial de Revisiones Realizadas
            </h2>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              Consulta y audita todas las evaluaciones ejecutadas en la plataforma (en vivo, en lote y comparativas). Cada registro almacena la nota, el desglose de las 5 dimensiones, la auditoría forense y el dossier de feedback.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {filteredRecords.length > 0 && (
              <button
                onClick={exportAllAsCSV}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Exportar CSV</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Aggregate Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Revisiones Totales</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono">{stats.total}</span>
              <History className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Promedio de Nota</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-indigo-400 font-mono">{stats.avgScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></span>
              <BarChart2 className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tasa de Aprobación</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400 font-mono">{stats.passRate}%</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Repos Únicos</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-200 font-mono">{stats.uniqueRepos}</span>
              <Layers className="w-4 h-4 text-teal-400" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Salud Técnica</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-teal-400 font-mono">{stats.avgHealth}%</span>
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por repositorio, URL, autor o evaluador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Grade Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value as any)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none pr-2 py-0.5 cursor-pointer font-medium"
            >
              <option value="all" className="bg-slate-900">Todas las Notas</option>
              <option value="sobresaliente" className="bg-slate-900">Sobresaliente (90+)</option>
              <option value="notable" className="bg-slate-900">Notable (80-89)</option>
              <option value="aprobado" className="bg-slate-900">Aprobado (60-79)</option>
              <option value="insuficiente" className="bg-slate-900">Insuficiente (&lt;60)</option>
            </select>
          </div>

          {/* Mode Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as any)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none px-2 py-0.5 cursor-pointer font-medium"
            >
              <option value="all" className="bg-slate-900">Todos los Modos</option>
              <option value="live" className="bg-slate-900">En Vivo</option>
              <option value="batch" className="bg-slate-900">En Lote</option>
              <option value="comparador" className="bg-slate-900">Comparador</option>
              <option value="preset" className="bg-slate-900">Preset</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none pr-2 py-0.5 cursor-pointer font-medium"
            >
              <option value="date_desc" className="bg-slate-900">Más Recientes</option>
              <option value="date_asc" className="bg-slate-900">Más Antiguos</option>
              <option value="score_desc" className="bg-slate-900">Mayor Nota</option>
              <option value="score_asc" className="bg-slate-900">Menor Nota</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Records List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
          <p className="text-xs text-slate-400">Cargando historial de revisiones...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="py-16 text-center space-y-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">No se encontraron revisiones</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {searchTerm || gradeFilter !== 'all' || modeFilter !== 'all'
                ? 'Ningún registro coincide con los filtros aplicados. Intentá restablecer los filtros de búsqueda.'
                : 'Aún no se han registrado evaluaciones. Podés correr una evaluación en el Evaluador en Vivo para ver su historial aquí.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Mostrando <strong>{filteredRecords.length}</strong> de <strong>{records.length}</strong> revisiones registradas</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredRecords.map((record) => {
              const badge = getScoreBadge(record.nota_final);
              const dateObj = new Date(record.timestamp);
              const formattedDate = isNaN(dateObj.getTime()) ? record.timestamp : dateObj.toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left Info: Repo and Meta */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition truncate">
                        {record.repoName || record.repoUrl}
                      </h3>

                      {record.mode && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          {record.mode === 'live' ? 'En Vivo' : record.mode === 'batch' ? 'Lote' : record.mode}
                        </span>
                      )}

                      {record.salud_tecnica !== undefined && (
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Salud: {record.salud_tecnica}/100</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center space-x-1 font-mono text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formattedDate}</span>
                      </span>

                      {record.evaluator_email && (
                        <span className="flex items-center space-x-1 text-slate-400">
                          <UserIcon className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[150px]">{record.evaluator_name || record.evaluator_email}</span>
                        </span>
                      )}

                      {record.modelo && (
                        <span className="flex items-center space-x-1 text-slate-500 font-mono text-[10px]">
                          <Zap className="w-3 h-3 text-amber-400/80" />
                          <span>{record.modelo}</span>
                        </span>
                      )}
                    </div>

                    {/* Dimension Breakdown Mini Pills */}
                    {record.dimensiones && record.dimensiones.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {record.dimensiones.map((dim, i) => {
                          const val = typeof dim.puntaje_ponderado === 'number' 
                            ? dim.puntaje_ponderado 
                            : parseFloat(String(dim.puntaje_ponderado || 0).replace(/[^\d.]/g, '')) || 0;
                          return (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300"
                              title={`${dim.dimension}: ${dim.puntaje_asignado} (${val.toFixed(1)} pts)`}
                            >
                              <strong className="text-indigo-400 mr-1">D{i+1}:</strong>{val.toFixed(1)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Actions & Score */}
                  <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-black font-mono text-white">
                          {record.nota_final.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">/ 100</span>
                      </div>
                      <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${badge.bg} ${badge.border} ${badge.text}`}>
                        {badge.label}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
                      <button
                        onClick={(e) => exportRecordAsJSON(record, e)}
                        title="Descargar JSON"
                        className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {onSelectRepoForLive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRepoForLive(record.repoUrl);
                          }}
                          title="Cargar y re-evaluar en el Evaluador en Vivo"
                          className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition flex items-center space-x-1 text-xs"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDelete(record.id, e)}
                        title="Eliminar del historial"
                        className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Full Inspection of Selected Record */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Revisión Histórica: {selectedRecord.repoName || selectedRecord.repoUrl}</span>
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span>Evaluado el {new Date(selectedRecord.timestamp).toLocaleString('es-AR')}</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-400">Nota: {selectedRecord.nota_final.toFixed(1)} / 100</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onSelectRepoForLive && (
                  <button
                    onClick={() => {
                      onSelectRepoForLive(selectedRecord.repoUrl);
                      setSelectedRecord(null);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Re-evaluar en Vivo</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 text-xs font-semibold overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveModalTab('dossier')}
                className={`py-3 px-3 border-b-2 transition ${
                  activeModalTab === 'dossier' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Dossier de Devolución
              </button>
              <button
                onClick={() => setActiveModalTab('score')}
                className={`py-3 px-3 border-b-2 transition ${
                  activeModalTab === 'score' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Puntaje & Desglose
              </button>
              {selectedRecord.auditoria_forense && (
                <button
                  onClick={() => setActiveModalTab('forense')}
                  className={`py-3 px-3 border-b-2 transition ${
                    activeModalTab === 'forense' 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Auditoría Forense ({selectedRecord.auditoria_forense.puntuacion_salud_tecnica}/100)
                </button>
              )}
              <button
                onClick={() => setActiveModalTab('dimensiones')}
                className={`py-3 px-3 border-b-2 transition ${
                  activeModalTab === 'dimensiones' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Dimensiones D1–D5
              </button>
              <button
                onClick={() => setActiveModalTab('raw')}
                className={`py-3 px-3 border-b-2 transition ${
                  activeModalTab === 'raw' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Registro Raw / Log
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeModalTab === 'dossier' && (
                <StudentFeedbackDossier
                  evaluationResult={{
                    nota_final: selectedRecord.nota_final,
                    dimensiones: selectedRecord.dimensiones || [],
                    fase0: selectedRecord.fase0,
                    protocolo_antifraude: selectedRecord.protocolo_antifraude,
                    revision_de_codigo: selectedRecord.revision_de_codigo,
                    historia_git: selectedRecord.historia_git,
                    auditoria_forense: selectedRecord.auditoria_forense,
                    log: selectedRecord.log,
                    repo: selectedRecord.repo || { repo: selectedRecord.repoName, url: selectedRecord.repoUrl }
                  }}
                />
              )}

              {activeModalTab === 'score' && (
                <div className="space-y-6">
                  <ScoreCard
                    notaFinal={selectedRecord.nota_final}
                    dimensiones={selectedRecord.dimensiones || []}
                    protocoloAntifraude={selectedRecord.protocolo_antifraude}
                  />
                </div>
              )}

              {activeModalTab === 'forense' && selectedRecord.auditoria_forense && (
                <ForensicAuditCard forensicAudit={selectedRecord.auditoria_forense} />
              )}

              {activeModalTab === 'dimensiones' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedRecord.dimensiones || []).map((dim, idx) => (
                    <DimensionCard key={idx} evaluacion={dim} index={idx} />
                  ))}
                </div>
              )}

              {activeModalTab === 'raw' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Estructura JSON completa del registro histórico</span>
                    <button
                      onClick={(e) => exportRecordAsJSON(selectedRecord, e)}
                      className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar JSON</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[400px]">
                    {JSON.stringify(selectedRecord, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

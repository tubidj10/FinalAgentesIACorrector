import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  FileText, 
  ExternalLink,
  Download,
  CheckSquare,
  ShieldCheck,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Github,
  Zap
} from 'lucide-react';
import { DimensionEvaluation } from '../types';
import { StudentFeedbackDossier } from './StudentFeedbackDossier';

interface BatchItem {
  id: string;
  url: string;
  label: string;
  status: 'pending' | 'evaluating' | 'completed' | 'error';
  nota_final?: number;
  dimensiones?: DimensionEvaluation[];
  diagnostico_git?: string;
  errorMsg?: string;
  rawResult?: any;
}

type SortField = 'original' | 'label' | 'status' | 'nota_final' | 'd1' | 'd2' | 'd3' | 'd4' | 'd5';
type SortDirection = 'asc' | 'desc';

export const BatchEvaluator: React.FC = () => {
  const [inputText, setInputText] = useState(
`# Pegá aquí un repositorio por línea o seleccioná los casos de la cursada
excelente
flojo
tramposo
https://github.com/tubidj10/FinalAgentesIA
https://github.com/tubidj10/Facultad`
  );
  const [githubToken, setGithubToken] = useState('');
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [concurrency, setConcurrency] = useState<number>(4);
  const [selectedItem, setSelectedItem] = useState<BatchItem | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('nota_final');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const defaultTemplates = [
    {
      name: 'Casos Oficiales del Parcial',
      list: 'excelente\nflojo\ntramposo'
    },
    {
      name: 'Casos Oficiales + Repos Reales',
      list: 'excelente\nflojo\ntramposo\nhttps://github.com/tubidj10/FinalAgentesIA\nhttps://github.com/tubidj10/Facultad'
    },
    {
      name: 'Comisión MBA (Ejemplo múltiple)',
      list: 'https://github.com/tubidj10/FinalAgentesIA\nhttps://github.com/tubidj10/Facultad\nexcelente\nflojo'
    }
  ];

  const handleStartBatch = async () => {
    const lines = inputText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'));

    if (lines.length === 0) {
      alert('Por favor ingresá al menos un repositorio o alias.');
      return;
    }

    const batchList: BatchItem[] = lines.map((url, idx) => {
      let label = url;
      if (url === 'excelente') label = 'Caso Excelente (Referencia)';
      else if (url === 'flojo') label = 'Caso Flojo (Referencia)';
      else if (url === 'tramposo') label = 'Caso Tramposo (Referencia)';
      else {
        const clean = url.replace('https://github.com/', '').replace('.git', '');
        label = clean;
      }

      return {
        id: `repo-${idx}-${Date.now()}`,
        url,
        label,
        status: 'pending'
      };
    });

    setItems(batchList);
    setIsProcessing(true);
    setSelectedItem(null);

    const evaluateSingle = async (targetItem: BatchItem, index: number) => {
      setItems(prev => prev.map((item, idx) => idx === index ? { ...item, status: 'evaluating' } : item));

      try {
        const res = await fetch('/api/evaluar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoUrl: targetItem.url,
            githubToken: githubToken || undefined
          })
        });

        const json = await res.json();
        if (!res.ok || !json.ok) {
          throw new Error(json.error || 'Error al evaluar');
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

        setItems(prev => prev.map((item, idx) => {
          if (idx === index) {
            return {
              ...item,
              status: 'completed',
              nota_final: notaCalculada,
              dimensiones: dims,
              diagnostico_git: json.repo?.historia_git?.diagnostico_proceso,
              rawResult: json
            };
          }
          return item;
        }));
      } catch (err: any) {
        setItems(prev => prev.map((item, idx) => {
          if (idx === index) {
            return {
              ...item,
              status: 'error',
              errorMsg: err.message || 'Fallo de evaluación'
            };
          }
          return item;
        }));
      }
    };

    // Parallel execution pool
    const queue = batchList.map((item, idx) => ({ item, index: idx }));
    const maxWorkers = Math.max(1, Math.min(concurrency, queue.length));

    const workers = Array.from({ length: maxWorkers }, async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (!next) break;
        await evaluateSingle(next.item, next.index);
      }
    });

    await Promise.all(workers);
    setIsProcessing(false);
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    let csv = 'Repositorio,Estado,Nota Final,D1 (30%),D2 (25%),D3 (20%),D4 (15%),D5 (10%),Diagnostico\n';
    items.forEach(it => {
      if (it.status === 'completed' && it.dimensiones) {
        const d1 = it.dimensiones[0]?.puntaje_ponderado ?? '';
        const d2 = it.dimensiones[1]?.puntaje_ponderado ?? '';
        const d3 = it.dimensiones[2]?.puntaje_ponderado ?? '';
        const d4 = it.dimensiones[3]?.puntaje_ponderado ?? '';
        const d5 = it.dimensiones[4]?.puntaje_ponderado ?? '';
        csv += `"${it.label}","${it.status}",${it.nota_final?.toFixed(1)},${d1},${d2},${d3},${d4},${d5},"${it.diagnostico_git || ''}"\n`;
      } else {
        csv += `"${it.label}","${it.status}","","","","","","","${it.errorMsg || ''}"\n`;
      }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `evaluacion_lote_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completedItems = items.filter(i => i.status === 'completed');
  const evaluatingItems = items.filter(i => i.status === 'evaluating');
  const avgScore = completedItems.length > 0
    ? (completedItems.reduce((acc, i) => acc + (i.nota_final || 0), 0) / completedItems.length).toFixed(1)
    : '0.0';

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction or reset
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default to desc for numerical/grade fields, asc for text
      if (['nota_final', 'd1', 'd2', 'd3', 'd4', 'd5'].includes(field)) {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
  };

  const sortedItems = useMemo(() => {
    if (sortField === 'original') return items;

    return [...items].sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      switch (sortField) {
        case 'label':
          valA = a.label.toLowerCase();
          valB = b.label.toLowerCase();
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'status':
          valA = a.status;
          valB = b.status;
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'nota_final':
          valA = a.nota_final ?? -1;
          valB = b.nota_final ?? -1;
          break;

        case 'd1':
          valA = Number(a.dimensiones?.[0]?.puntaje_ponderado ?? -1);
          valB = Number(b.dimensiones?.[0]?.puntaje_ponderado ?? -1);
          break;

        case 'd2':
          valA = Number(a.dimensiones?.[1]?.puntaje_ponderado ?? -1);
          valB = Number(b.dimensiones?.[1]?.puntaje_ponderado ?? -1);
          break;

        case 'd3':
          valA = Number(a.dimensiones?.[2]?.puntaje_ponderado ?? -1);
          valB = Number(b.dimensiones?.[2]?.puntaje_ponderado ?? -1);
          break;

        case 'd4':
          valA = Number(a.dimensiones?.[3]?.puntaje_ponderado ?? -1);
          valB = Number(b.dimensiones?.[3]?.puntaje_ponderado ?? -1);
          break;

        case 'd5':
          valA = Number(a.dimensiones?.[4]?.puntaje_ponderado ?? -1);
          valB = Number(b.dimensiones?.[4]?.puntaje_ponderado ?? -1);
          break;

        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });
  }, [items, sortField, sortDirection]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-70 transition ml-1 inline" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 text-indigo-400 font-bold ml-1 inline" />
      : <ChevronDown className="w-3.5 h-3.5 text-indigo-400 font-bold ml-1 inline" />;
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Layers className="w-4 h-4" />
            <span>Evaluación Masiva en Paralelo</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Evaluador de Listado de Repositorios (Batch Mode)
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Ingresá múltiples repositorios para evaluarlos en <span className="text-emerald-400 font-semibold">paralelo multi-hilo</span>, acelerando drásticamente el tiempo de procesamiento.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shrink-0 self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV de la Cursada</span>
          </button>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Listado de Repositorios o Alias (Uno por línea)
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-500 font-semibold">Plantillas Rápidas:</span>
            {defaultTemplates.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(t.list)}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isProcessing}
          placeholder="https://github.com/grupo1/agente-final&#10;https://github.com/grupo2/agente-final&#10;excelente&#10;flojo"
          className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
        />

        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="w-full lg:flex-1 relative">
            <Github className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="GitHub Token opcional (5.000 req/hora para evaluar toda la cursada)"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-300 w-full sm:w-auto">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-400 whitespace-nowrap">Paralelismo:</span>
            <select
              value={concurrency}
              onChange={(e) => setConcurrency(parseInt(e.target.value, 10))}
              disabled={isProcessing}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="2">2 hilos concurrentes</option>
              <option value="3">3 hilos concurrentes</option>
              <option value="4">4 hilos (Recomendado)</option>
              <option value="6">6 hilos (Ultra Rápido)</option>
              <option value="8">8 hilos (Máxima velocidad)</option>
            </select>
          </div>

          <button
            onClick={handleStartBatch}
            disabled={isProcessing}
            className="w-full lg:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 shrink-0"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluando ({evaluatingItems.length} en paralelo)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Evaluar Todo en Paralelo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-Time Processing Summary Stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Repositorios</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">{items.length}</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Progreso Completado</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
              {completedItems.length} / {items.length}
            </span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Promedio Cursada</span>
            <span className="text-2xl font-bold font-mono text-indigo-400 mt-1 block">{avgScore} / 100</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Estado del Pipeline</span>
            <span className="text-xs font-bold text-slate-200 mt-2 block flex items-center space-x-1.5">
              {isProcessing ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Procesando ({evaluatingItems.length} activos)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Lote Finalizado</span>
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Evaluation Table Results */}
      {items.length > 0 && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span>Resultados y Ranking del Lote</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Hacé clic en cualquier fila para ver el desglose completo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase font-semibold select-none">
                  <th 
                    onClick={() => handleSort('original')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-200 transition group"
                  >
                    <span>#</span>
                    {sortField === 'original' && <span className="text-indigo-400 font-bold ml-1">•</span>}
                  </th>
                  <th 
                    onClick={() => handleSort('label')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-200 transition group"
                  >
                    <span>Repositorio / Entrega</span>
                    {renderSortIndicator('label')}
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-200 transition group"
                  >
                    <span>Estado</span>
                    {renderSortIndicator('status')}
                  </th>
                  <th 
                    onClick={() => handleSort('nota_final')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-200 transition group bg-slate-900/40"
                  >
                    <span className="text-indigo-300 font-bold">Nota Final</span>
                    {renderSortIndicator('nota_final')}
                  </th>
                  <th 
                    onClick={() => handleSort('d1')}
                    className="py-3 px-4 hidden md:table-cell cursor-pointer hover:text-slate-200 transition group"
                    title="D1: Protocolo y Verificación (30%)"
                  >
                    <span>D1 (30%)</span>
                    {renderSortIndicator('d1')}
                  </th>
                  <th 
                    onClick={() => handleSort('d2')}
                    className="py-3 px-4 hidden md:table-cell cursor-pointer hover:text-slate-200 transition group"
                    title="D2: Arquitectura del Prompt (25%)"
                  >
                    <span>D2 (25%)</span>
                    {renderSortIndicator('d2')}
                  </th>
                  <th 
                    onClick={() => handleSort('d3')}
                    className="py-3 px-4 hidden md:table-cell cursor-pointer hover:text-slate-200 transition group"
                    title="D3: Ejecución y Trazabilidad (20%)"
                  >
                    <span>D3 (20%)</span>
                    {renderSortIndicator('d3')}
                  </th>
                  <th 
                    onClick={() => handleSort('d4')}
                    className="py-3 px-4 hidden md:table-cell cursor-pointer hover:text-slate-200 transition group"
                    title="D4: Calidad y Completitud (15%)"
                  >
                    <span>D4 (15%)</span>
                    {renderSortIndicator('d4')}
                  </th>
                  <th 
                    onClick={() => handleSort('d5')}
                    className="py-3 px-4 hidden md:table-cell cursor-pointer hover:text-slate-200 transition group"
                    title="D5: Autonomía y Gobernanza (10%)"
                  >
                    <span>D5 (10%)</span>
                    {renderSortIndicator('d5')}
                  </th>
                  <th className="py-3 px-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {sortedItems.map((item, idx) => {
                  const dims = item.dimensiones || [];
                  const isSelected = selectedItem?.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => item.status === 'completed' && setSelectedItem(item)}
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-950/40 border-l-2 border-indigo-500' 
                          : 'hover:bg-slate-850'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200">{item.label}</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs">{item.url}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                            En cola
                          </span>
                        )}
                        {item.status === 'evaluating' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold flex items-center space-x-1 w-fit">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Auditando...</span>
                          </span>
                        )}
                        {item.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center space-x-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Calificado</span>
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold flex items-center space-x-1 w-fit">
                            <AlertCircle className="w-3 h-3" />
                            <span>Fallo</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-sm">
                        {item.nota_final !== undefined ? (
                          <span className={
                            item.nota_final >= 80 ? 'text-emerald-400' :
                            item.nota_final >= 50 ? 'text-amber-400' :
                            'text-rose-400'
                          }>
                            {item.nota_final.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 hidden md:table-cell">
                        {dims[0]?.puntaje_ponderado !== undefined ? Number(dims[0].puntaje_ponderado).toFixed(1) : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 hidden md:table-cell">
                        {dims[1]?.puntaje_ponderado !== undefined ? Number(dims[1].puntaje_ponderado).toFixed(1) : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 hidden md:table-cell">
                        {dims[2]?.puntaje_ponderado !== undefined ? Number(dims[2].puntaje_ponderado).toFixed(1) : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 hidden md:table-cell">
                        {dims[3]?.puntaje_ponderado !== undefined ? Number(dims[3].puntaje_ponderado).toFixed(1) : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 hidden md:table-cell">
                        {dims[4]?.puntaje_ponderado !== undefined ? Number(dims[4].puntaje_ponderado).toFixed(1) : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {item.status === 'completed' && (
                          <ChevronRight className="w-4 h-4 text-slate-400 inline hover:text-white" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Item Modal / Inspector */}
      {selectedItem && selectedItem.rawResult && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Devolución Detallada para: <span className="text-indigo-400 font-mono">{selectedItem.label}</span>
            </h3>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
            >
              Cerrar Dossier
            </button>
          </div>

          <StudentFeedbackDossier 
            evaluationResult={{
              nota_final: selectedItem.nota_final || 0,
              dimensiones: selectedItem.dimensiones || [],
              fase0: selectedItem.rawResult.evaluacion?.fase0 || selectedItem.rawResult.result?.evaluacion?.fase0,
              protocolo_antifraude: selectedItem.rawResult.evaluacion?.protocolo_antifraude || selectedItem.rawResult.result?.evaluacion?.protocolo_antifraude,
              revision_de_codigo: selectedItem.rawResult.evaluacion?.revision_de_codigo || selectedItem.rawResult.result?.evaluacion?.revision_de_codigo,
              historia_git: selectedItem.rawResult.repo?.historia_git,
              repo: selectedItem.rawResult.repo
            }}
          />
        </div>
      )}
    </div>
  );
};

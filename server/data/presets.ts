import fs from 'fs';
import path from 'path';

export interface PresetCase {
  id: string;
  nombre: string;
  categoria: 'excelente' | 'flojo' | 'tramposo' | 'repo_real' | 'autoevaluacion';
  repo_url: string;
  descripcion: string;
  nota_esperada: number;
  puntos_clave: string[];
  archivos: Record<string, string>;
}

function readCaseFiles(caseDirName: string): Record<string, string> {
  const dir = path.join(process.cwd(), 'casos', caseDirName);
  const result: Record<string, string> = {};
  if (!fs.existsSync(dir)) return result;

  function walk(current: string, relative: string) {
    const items = fs.readdirSync(current, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(current, item.name);
      const relPath = relative ? `${relative}/${item.name}` : item.name;
      if (item.isDirectory()) {
        walk(fullPath, relPath);
      } else if (item.isFile()) {
        try {
          result[relPath] = fs.readFileSync(fullPath, 'utf-8');
        } catch (e) {
          // ignore
        }
      }
    }
  }

  walk(dir, '');
  return result;
}

function readWorkspaceFiles(): Record<string, string> {
  const result: Record<string, string> = {};
  const cwd = process.cwd();
  
  const filesToInclude = [
    'README.md',
    'prompts/system_prompt.md',
    'prompts/user_prompt.md',
    'DECISIONES.md',
    'rubrica.md',
    'calibracion.md',
    'requirements.txt',
    'requirements.lock',
    'package.json',
    'agente/ejecutar_evaluacion.py',
    'agente/system_prompt.md',
    'agente/user_prompt_template.md',
    'agente/herramientas.md',
    'agente/requirements.txt',
    'agente/requirements.lock'
  ];

  for (const rel of filesToInclude) {
    const full = path.join(cwd, rel);
    if (fs.existsSync(full)) {
      try {
        result[rel] = fs.readFileSync(full, 'utf-8');
      } catch (e) {}
    }
  }

  // Also read all files in corridas/
  const corridasDir = path.join(cwd, 'corridas');
  if (fs.existsSync(corridasDir)) {
    const items = fs.readdirSync(corridasDir);
    for (const item of items) {
      if (item.endsWith('.json') || item.endsWith('.log') || item.endsWith('.txt')) {
        try {
          result[`corridas/${item}`] = fs.readFileSync(path.join(corridasDir, item), 'utf-8');
        } catch (e) {}
      }
    }
  }

  return result;
}

export function getPresetCases(): PresetCase[] {
  const excelenteFiles = readCaseFiles('excelente');
  const flojoFiles = readCaseFiles('flojo');
  const tramposoFiles = readCaseFiles('tramposo');
  const workspaceFiles = readWorkspaceFiles();

  return [
    {
      id: 'excelente',
      nombre: 'Caso Excelente — Triage de Tickets',
      categoria: 'excelente',
      repo_url: 'https://github.com/casos-prueba/triage-excelente',
      descripcion: 'Entrega rigurosa: enum cerrado con Pydantic, truncado de hilos, reintento ante 429 con backoff, gobierno L1 y análisis de costos desagregado con escenario peor caso.',
      nota_esperada: 92.5,
      puntos_clave: [
        '5 rutas obligatorias completas en la raíz',
        'DECISIONES.md con 5 decisiones profundas y alternativas descartadas',
        'Corridas con log transaccional real, tokens plausibles y prueba de falla (429 Rate Limit)',
        'Análisis económico con fórmula explícita y optimización de prompt',
        'Gobierno L1 con delimitación de alcance estricta (no responde a clientes)'
      ],
      archivos: excelenteFiles
    },
    {
      id: 'flojo',
      nombre: 'Caso Flojo — Clasificador Simple',
      categoria: 'flojo',
      repo_url: 'https://github.com/casos-prueba/clasificador-flojo',
      descripcion: 'Entrega superficial: variable fantasma en prompt, sin prueba de fallas en corridas, DECISIONES.md con un solo tropiezo vago, costo estimado "a ojo" sin fórmula.',
      nota_esperada: 36.5,
      puntos_clave: [
        'Variable fantasma en prompts/user_prompt.md (prioridad_sugerida)',
        'Corridas solo cubren camino feliz sin registrar fallas manejadas',
        'DECISIONES.md superficial sin justificación de alternativas descartadas',
        'Análisis económico vago ("unos centavos al mes") sin desglose',
        'Gobierno básico sin clasificación formal L0–L4'
      ],
      archivos: flojoFiles
    },
    {
      id: 'tramposo',
      nombre: 'Caso Tramposo — SupportGenius Pro',
      categoria: 'tramposo',
      repo_url: 'https://github.com/casos-prueba/support-genius-tramposo',
      descripcion: 'Simula fraude y manipulación: prompt injection en comentarios HTML, caracteres invisibles (homóglifos RTL), contradicción activa (afirma 5 agentes y $2/año con log plano).',
      nota_esperada: 10.0,
      puntos_clave: [
        '🚨 Disparo de Protocolo Antifraude en Fase 4',
        'Inyección directa de prompt oculta en comentario HTML de README.md',
        'Caracteres RTL y zero-width space ocultos en el texto de resultados',
        'Contradicción activa: afirma 5 agentes multi-LLM pero solo tiene un log1.txt plano narrado',
        'Calificación 1/10 en todas las dimensiones'
      ],
      archivos: tramposoFiles
    },
    {
      id: 'facultad',
      nombre: 'Repo Real Externo — tubidj10/Facultad',
      categoria: 'repo_real',
      repo_url: 'https://github.com/tubidj10/Facultad',
      descripcion: 'Repositorio genuino de una cursada anterior, no estructurado para esta rúbrica. Valida la penalización automática de 1/10 en Formato por ausencia de las 5 rutas.',
      nota_esperada: 14.5,
      puntos_clave: [
        'Repo real de entrega académica previa',
        'Falta de rutas obligatorias (prompts/, corridas/, DECISIONES.md)',
        'Calificación 1/10 en Formato automática y sin excepciones',
        'Coincidencia total entre evaluación humana y de agente'
      ],
      archivos: {}
    },
    {
      id: 'finalagentesia',
      nombre: 'Repo Real MBA — tubidj10/FinalAgentesIA',
      categoria: 'repo_real',
      repo_url: 'https://github.com/tubidj10/FinalAgentesIA',
      descripcion: 'Trabajo final completo de la materia con iteración v1 a v5. Demuestra progreso documentado de 80.5 a 92.5 tras aplicar el feedback del corrector.',
      nota_esperada: 92.5,
      puntos_clave: [
        'Repositorio real más completo auditado en la cursada',
        'Evolución v1 (80.5) -> v5 (92.5) con script de corrida de un solo paso',
        'Doble proveedor (Anthropic / Gemini) documentado con justificación',
        'Análisis económico riguroso con ~69k caracteres de contexto auditado'
      ],
      archivos: {}
    },
    {
      id: 'autoevaluacion',
      nombre: 'Auto-Evaluación — FinalAgentesIACorrector',
      categoria: 'autoevaluacion',
      repo_url: 'https://github.com/tubidj10/FinalAgentesIACorrector',
      descripcion: 'Auto-evaluación del propio agente corrector contra su rúbrica v5, evaluando consistencia metodológica, cálculo de costos y gobierno L0-L4.',
      nota_esperada: 100.0,
      puntos_clave: [
        'Auditoría rigurosa aplicada sobre este mismo repositorio',
        'Mapeo de equivalentes estructurado para feedback constructivo',
        'Cálculo de costo propio con supuestos de tokens y optimización de caching',
        'Matriz de herramientas L0–L4 sin permisos de escritura ni ejecución'
      ],
      archivos: workspaceFiles
    }
  ];
}

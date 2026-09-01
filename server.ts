import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { RUBRIC_DIMENSIONS } from './server/data/rubric.js';
import { loadCalibrationRuns } from './server/data/calibration.js';
import { getPresetCases } from './server/data/presets.js';
import { extractRepoContents, clearRepoCache } from './server/github.js';
import { runEvaluation, clearEvaluationCache } from './server/evaluator.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      node_version: process.version,
      has_gemini_key: Boolean(process.env.GEMINI_API_KEY),
      has_github_token: Boolean(process.env.GITHUB_TOKEN)
    });
  });

  app.get('/api/info', (req, res) => {
    res.json({
      nombre: 'El Agente Evaluador',
      materia: 'Programación de y con Agentes de IA',
      institucion: 'MBA UCEMA · 2026 2T',
      profesor: 'Prof. Alfredo B. Roisenzvit',
      autor: 'Martín Pérez (martin.perez@tecval.com.ar)',
      version_rubrica: 'v5 (Checklist explícito + Fase 0 de Verificación Cruzada)',
      dimensiones: RUBRIC_DIMENSIONS.map(d => ({ id: d.id, nombre: d.nombre, peso: d.peso }))
    });
  });

  app.get('/api/rubrica', (req, res) => {
    const rubricaPath = path.join(process.cwd(), 'rubrica.md');
    const fullText = fs.existsSync(rubricaPath) ? fs.readFileSync(rubricaPath, 'utf-8') : '';
    res.json({
      dimensiones: RUBRIC_DIMENSIONS,
      texto_completo: fullText
    });
  });

  app.get('/api/calibraciones', (req, res) => {
    const runs = loadCalibrationRuns();
    res.json(runs);
  });

  app.get('/api/calibraciones/:id', (req, res) => {
    const runs = loadCalibrationRuns();
    const found = runs.find(r => r.id === req.params.id || r.filename === req.params.id);
    if (!found) {
      return res.status(404).json({ error: 'Corrida de calibración no encontrada' });
    }
    res.json(found);
  });

  app.get('/api/casos', (req, res) => {
    const presets = getPresetCases();
    res.json(presets);
  });

  app.get('/api/prompts', (req, res) => {
    const sysPath = path.join(process.cwd(), 'agente', 'system_prompt.md');
    const userPath = path.join(process.cwd(), 'agente', 'user_prompt_template.md');
    const toolsPath = path.join(process.cwd(), 'agente', 'herramientas.md');
    const chatPath = path.join(process.cwd(), 'agente', 'modo_chat.md');

    res.json({
      system_prompt: fs.existsSync(sysPath) ? fs.readFileSync(sysPath, 'utf-8') : '',
      user_prompt_template: fs.existsSync(userPath) ? fs.readFileSync(userPath, 'utf-8') : '',
      herramientas: fs.existsSync(toolsPath) ? fs.readFileSync(toolsPath, 'utf-8') : '',
      modo_chat: fs.existsSync(chatPath) ? fs.readFileSync(chatPath, 'utf-8') : ''
    });
  });

  app.post('/api/evaluar', async (req, res) => {
    try {
      const { repoUrl, githubToken, provider, forceRefresh } = req.body;
      if (!repoUrl) {
        return res.status(400).json({ error: 'La URL del repositorio es requerida' });
      }

      if (forceRefresh) {
        clearRepoCache(repoUrl);
        clearEvaluationCache(repoUrl);
      }

      // Extract repo content
      const extracted = await extractRepoContents(repoUrl, githubToken);

      // Run evaluation
      const result = await runEvaluation(extracted, provider || 'auto');

      res.json({
        ok: true,
        extracted_metadata: extracted.metadatos_extraccion,
        repo: {
          owner: extracted.owner,
          repo: extracted.repo,
          url: extracted.url,
          archivos_faltantes: extracted.archivos_faltantes,
          total_corridas: extracted.corridas.length,
          historia_git: extracted.historia_git
        },
        result
      });
    } catch (e: any) {
      console.error('Error in /api/evaluar:', e);
      res.status(500).json({
        ok: false,
        error: e.message || 'Error al ejecutar la evaluación del repositorio'
      });
    }
  });

  app.post('/api/calcular-costos', (req, res) => {
    const {
      systemChars = 38903,
      repoChars = 69019,
      outputChars = 12000,
      inputPricePerM = 3.0,
      outputPricePerM = 15.0,
      cachedInputPricePerM = 0.30,
      totalTrabajos = 30,
      corridasPorTrabajo = 2,
      usePromptCaching = true
    } = req.body;

    const charsPerToken = 3.8;
    const inputTokens = Math.round((systemChars + repoChars) / charsPerToken);
    const systemTokens = Math.round(systemChars / charsPerToken);
    const repoTokens = Math.round(repoChars / charsPerToken);
    const outputTokens = Math.round(outputChars / charsPerToken);

    // Cost without caching
    const rawCostPerRun = (inputTokens / 1_000_000) * inputPricePerM + (outputTokens / 1_000_000) * outputPricePerM;

    // Cost with prompt caching on system prompt (fixed portion)
    const cachedCostPerRun = (
      (systemTokens / 1_000_000) * (usePromptCaching ? cachedInputPricePerM : inputPricePerM) +
      (repoTokens / 1_000_000) * inputPricePerM +
      (outputTokens / 1_000_000) * outputPricePerM
    );

    const effectiveCostPerRun = usePromptCaching ? cachedCostPerRun : rawCostPerRun;
    const totalRunsBase = totalTrabajos * corridasPorTrabajo;
    const totalCostBase = effectiveCostPerRun * totalRunsBase;

    const totalRunsWorst = totalTrabajos * (corridasPorTrabajo + 1);
    const totalCostWorst = effectiveCostPerRun * totalRunsWorst;

    const ahorroPorCaching = Math.max(0, (rawCostPerRun - cachedCostPerRun) * totalRunsBase);

    res.json({
      tokens: {
        systemTokens,
        repoTokens,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      },
      costo_por_corrida: {
        sin_cache: Math.round(rawCostPerRun * 10000) / 10000,
        con_cache: Math.round(cachedCostPerRun * 10000) / 10000,
        efectivo: Math.round(effectiveCostPerRun * 10000) / 10000
      },
      proyeccion: {
        escenario_base: {
          corridas: totalRunsBase,
          costo_total: Math.round(totalCostBase * 100) / 100
        },
        escenario_peor_caso: {
          corridas: totalRunsWorst,
          costo_total: Math.round(totalCostWorst * 100) / 100
        },
        ahorro_estimado_cache: Math.round(ahorroPorCaching * 100) / 100
      }
    });
  });

  // Vite middleware for development vs static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚖️ El Agente Evaluador server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

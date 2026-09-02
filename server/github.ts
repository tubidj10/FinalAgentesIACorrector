import { getPresetCases } from './data/presets.js';

export interface ExtractedRepoData {
  owner: string;
  repo: string;
  url: string;
  archivos_obligatorios: Record<string, string | null>;
  archivos_faltantes: string[];
  corridas: { nombre: string; contenido: string }[];
  archivos_codigo: { ruta: string; contenido: string }[];
  historia_git?: {
    total_commits: number;
    autores: string[];
    primer_commit_fecha?: string;
    ultimo_commit_fecha?: string;
    dias_de_trabajo: number;
    diagnostico_proceso: string;
  };
  metadatos_extraccion: {
    total_archivos: number;
    caracteres_totales: number;
    modo_fuente: 'github_api' | 'preset_local' | 'cache';
  };
}

const RUTAS_OBLIGATORIAS = [
  "README.md",
  "prompts/system_prompt.md",
  "prompts/user_prompt.md",
  "DECISIONES.md",
];

const ALIASES_RUTAS: Record<string, string[]> = {
  "README.md": ["README.md", "readme.md", "README.MD", "Readme.md"],
  "prompts/system_prompt.md": [
    "prompts/system_prompt.md",
    "system_prompt.md",
    "agente/system_prompt.md",
    "prompts/system.md",
    "prompts/system_prompt.txt",
    "prompt_sistema.md"
  ],
  "prompts/user_prompt.md": [
    "prompts/user_prompt.md",
    "user_prompt.md",
    "agente/user_prompt_template.md",
    "prompts/user_prompt_template.md",
    "prompts/user.md",
    "user_prompt_template.md"
  ],
  "DECISIONES.md": [
    "DECISIONES.md",
    "decisiones.md",
    "Decisiones.md",
    "DECISIONES.MD",
    "docs/DECISIONES.md",
    "docs/decisiones.md"
  ],
};

const EXTENSIONES_CODIGO = new Set([
  ".py", ".js", ".ts", ".jsx", ".tsx", ".go", ".rb", ".java", ".rs", ".sh",
  ".lock", ".toml", ".yml", ".yaml", ".json", ".txt", ".md"
]);

const MANIFEST_NAMES = new Set([
  "requirements.txt", "requirements.lock", "pipfile", "pipfile.lock",
  "pyproject.toml", "package.json", "package-lock.json", "dockerfile",
  ".env.example", "costos.md", "riesgos.md", "arquitectura.md", "evidencias.md"
]);

// In-memory cache for extracted repo data (TTL: 5 minutes)
const repoExtractionCache = new Map<string, { data: ExtractedRepoData; expiresAt: number }>();
const detectedBranchCache = new Map<string, string>();

export function clearRepoCache(url?: string) {
  if (url) {
    repoExtractionCache.delete(url.trim().toLowerCase());
  } else {
    repoExtractionCache.clear();
  }
}

export function parseRepoUrl(url: string): { owner: string; repo: string } {
  const clean = url.trim();
  const match = clean.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!match) {
    const simpleMatch = clean.match(/^([^/]+)\/([^/]+)$/);
    if (simpleMatch) {
      return { owner: simpleMatch[1], repo: simpleMatch[2] };
    }
    throw new Error(`No se pudo parsear owner/repo de: ${url}. Use formato https://github.com/owner/repo o owner/repo`);
  }
  return { owner: match[1], repo: match[2] };
}

async function detectDefaultBranch(owner: string, repo: string, token?: string): Promise<string> {
  const cacheKey = `${owner}/${repo}`.toLowerCase();
  if (detectedBranchCache.has(cacheKey)) {
    return detectedBranchCache.get(cacheKey)!;
  }

  // Quick check: check main then master with 2s timeout
  try {
    const checkMain = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`, {
      method: 'HEAD',
      headers: { 'User-Agent': 'FinalAgentesIA-Evaluator/1.0' },
      signal: AbortSignal.timeout(2000)
    });
    if (checkMain.ok) {
      detectedBranchCache.set(cacheKey, 'main');
      return 'main';
    }
  } catch {}

  try {
    const checkMaster = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`, {
      method: 'HEAD',
      headers: { 'User-Agent': 'FinalAgentesIA-Evaluator/1.0' },
      signal: AbortSignal.timeout(2000)
    });
    if (checkMaster.ok) {
      detectedBranchCache.set(cacheKey, 'master');
      return 'master';
    }
  } catch {}

  detectedBranchCache.set(cacheKey, 'main');
  return 'main';
}

export async function fetchGitHubFile(owner: string, repo: string, path: string, token?: string): Promise<string | null> {
  const branch = await detectDefaultBranch(owner, repo, token);
  
  // 1. First priority: Fast Raw fetch (no rate limit, ~100ms)
  try {
    const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`, {
      headers: { 'User-Agent': 'FinalAgentesIA-Evaluator/1.0' },
      signal: AbortSignal.timeout(3500)
    });
    if (rawRes.ok) {
      const text = await rawRes.text();
      if (text && !text.startsWith('404: Not Found')) {
        return text;
      }
    }
  } catch (e) {}

  // 2. Fallback to alternative branch if raw failed
  const altBranch = branch === 'main' ? 'master' : 'main';
  try {
    const rawAltRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${altBranch}/${path}`, {
      headers: { 'User-Agent': 'FinalAgentesIA-Evaluator/1.0' },
      signal: AbortSignal.timeout(3000)
    });
    if (rawAltRes.ok) {
      const text = await rawAltRes.text();
      if (text && !text.startsWith('404: Not Found')) {
        return text;
      }
    }
  } catch (e) {}

  // 3. Fallback: Authenticated GitHub API if token is provided
  const authToken = token || process.env.GITHUB_TOKEN;
  if (authToken) {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${authToken}`,
          'User-Agent': 'FinalAgentesIA-Evaluator/1.0'
        },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json() as any;
        if (data && data.type === 'file' && data.content) {
          return Buffer.from(data.content, 'base64').toString('utf-8');
        }
      }
    } catch (e) {}
  }

  return null;
}

export async function fetchGitHubDirectory(owner: string, repo: string, path: string, token?: string): Promise<{ name: string; type: string }[]> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'FinalAgentesIA-Evaluator/1.0',
  };
  const authToken = token || process.env.GITHUB_TOKEN;
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Try git tree API
  for (const branch of ['main', 'master']) {
    try {
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
        headers,
        signal: AbortSignal.timeout(3000)
      });
      if (treeRes.ok) {
        const treeData = await treeRes.json() as any;
        if (treeData && Array.isArray(treeData.tree)) {
          const prefix = path ? `${path}/` : '';
          const matches = treeData.tree.filter((item: any) => 
            path ? item.path.startsWith(prefix) && !item.path.slice(prefix.length).includes('/') : !item.path.includes('/')
          );
          if (matches.length > 0) {
            return matches.map((item: any) => ({
              name: path ? item.path.slice(prefix.length) : item.path,
              type: item.type === 'blob' ? 'file' : 'dir'
            }));
          }
        }
      }
    } catch (e) {}
  }

  // Fallback: probe common files for corridas directory
  if (path === 'corridas' || path === 'corridas/') {
    const commonNames = [
      '2026-09-02_corrida_01_excelente.json',
      '2026-09-02_corrida_02_resiliencia.json',
      '2026-09-02_corrida_03_antifraude.json',
      '2026-09-01_autoevaluacion.json',
      '2026-08-29_v1_excelente.json',
      '2026-08-29_v1_flojo.json',
      '2026-08-29_v1_tramposo.json',
      '2026-08-25-143012_run-014.json',
      'corrida1.json',
      'corrida_1.json',
      'corrida2.json',
      'corrida_2.json',
      'corrida3.json',
      'corrida_429.json',
      'corrida_error.json',
      'corrida_fallida.json',
      'log1.json'
    ];
    const found: { name: string; type: string }[] = [];
    await Promise.all(
      commonNames.map(async (name) => {
        const probe = await fetchGitHubFile(owner, repo, `corridas/${name}`, token);
        if (probe !== null) {
          found.push({ name, type: 'file' });
        }
      })
    );
    if (found.length > 0) return found;
  }

  return [];
}

export async function fetchGitHubCommits(owner: string, repo: string, token?: string) {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'FinalAgentesIA-Evaluator/1.0',
  };
  const authToken = token || process.env.GITHUB_TOKEN;
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=40`, {
      headers,
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    const data = await res.json() as any[];
    if (!Array.isArray(data) || data.length === 0) return null;

    const autoresSet = new Set<string>();
    for (const c of data) {
      const author = c.author?.login || c.commit?.author?.name;
      if (author) autoresSet.add(author);
    }

    const timestamps = data.map(c => new Date(c.commit?.author?.date || c.commit?.committer?.date).getTime()).filter(t => !isNaN(t));
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const diasTrabajo = Math.max(1, Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24)));

    let diagnostico = 'Historia de commits adecuada.';
    if (data.length <= 1) {
      diagnostico = 'ALERTA: Repositorio con un solo commit. No muestra iteración ni evolución del trabajo en equipo.';
    } else if (diasTrabajo < 1 && data.length < 4) {
      diagnostico = 'ADVERTENCIA: Todos los commits fueron creados en menos de 24 horas. Evidencia baja de proceso iterativo.';
    } else {
      diagnostico = `Proceso colaborativo saludable: ${data.length} commits a lo largo de ${diasTrabajo} días con ${autoresSet.size} autor(es).`;
    }

    return {
      total_commits: data.length,
      autores: Array.from(autoresSet),
      primer_commit_fecha: new Date(minTime).toISOString(),
      ultimo_commit_fecha: new Date(maxTime).toISOString(),
      dias_de_trabajo: diasTrabajo,
      diagnostico_proceso: diagnostico
    };
  } catch (e) {
    return null;
  }
}

export async function extractRepoContents(
  urlOrPreset: string,
  githubToken?: string
): Promise<ExtractedRepoData> {
  const cleanInput = urlOrPreset.trim().toLowerCase();
  const cacheKey = `${cleanInput}_${githubToken ? 'auth' : 'public'}`;
  const now = Date.now();

  const cached = repoExtractionCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return {
      ...cached.data,
      metadatos_extraccion: {
        ...cached.data.metadatos_extraccion,
        modo_fuente: 'cache'
      }
    };
  }
  
  // 1. Synthetic presets (excelente, flojo, tramposo, autoevaluacion) or direct workspace match
  const syntheticPresetIds = ['excelente', 'flojo', 'tramposo', 'autoevaluacion'];
  if (syntheticPresetIds.includes(cleanInput)) {
    const presets = getPresetCases();
    const matchedPreset = presets.find(p => p.id.toLowerCase() === cleanInput);
    if (matchedPreset && Object.keys(matchedPreset.archivos).length > 0) {
      const archivos_obligatorios: Record<string, string | null> = {};
      const archivos_faltantes: string[] = [];
      const corridas: { nombre: string; contenido: string }[] = [];
      const archivos_codigo: { ruta: string; contenido: string }[] = [];

      for (const ruta of RUTAS_OBLIGATORIAS) {
        if (matchedPreset.archivos[ruta]) {
          archivos_obligatorios[ruta] = matchedPreset.archivos[ruta];
        } else {
          archivos_obligatorios[ruta] = null;
          archivos_faltantes.push(ruta);
        }
      }

      for (const [filePath, content] of Object.entries(matchedPreset.archivos)) {
        if (filePath.startsWith('corridas/')) {
          corridas.push({
            nombre: filePath.replace('corridas/', ''),
            contenido: content
          });
        } else if (!RUTAS_OBLIGATORIAS.includes(filePath) && (filePath.endsWith('.py') || filePath.endsWith('.ts') || filePath.endsWith('.js'))) {
          archivos_codigo.push({
            ruta: filePath,
            contenido: content
          });
        }
      }

      if (corridas.length === 0) {
        archivos_faltantes.push('corridas/');
      }

      const { owner, repo } = parseRepoUrl(matchedPreset.repo_url);
      
      let historia_git = {
        total_commits: matchedPreset.id === 'excelente' ? 28 : matchedPreset.id === 'flojo' ? 3 : 1,
        autores: matchedPreset.id === 'excelente' ? ['martin.perez', 'lucas.gomez', 'sofia.diaz'] : ['alumno.unico'],
        dias_de_trabajo: matchedPreset.id === 'excelente' ? 14 : matchedPreset.id === 'flojo' ? 2 : 1,
        diagnostico_proceso: matchedPreset.id === 'excelente' 
          ? 'Proceso ejemplar: 28 commits, 3 integrantes activos a lo largo de 14 días de desarrollo e iteración.'
          : matchedPreset.id === 'flojo'
          ? 'Advertencia: Solo 3 commits en 2 días. Trabajo concentrado sin evidencia de refinamiento continuo.'
          : 'ALERTA CRÍTICA: 1 único commit subido a última hora sin historia de trabajo.'
      };

      return {
        owner,
        repo,
        url: matchedPreset.repo_url,
        archivos_obligatorios,
        archivos_faltantes,
        corridas,
        archivos_codigo,
        historia_git,
        metadatos_extraccion: {
          total_archivos: Object.keys(matchedPreset.archivos).length,
          caracteres_totales: Object.values(matchedPreset.archivos).reduce((a, b) => a + b.length, 0),
          modo_fuente: 'preset_local'
        }
      };
    }
  }

  // 2. Real GitHub Extraction (both for individual and batch)
  const { owner, repo } = parseRepoUrl(urlOrPreset);
  const archivos_obligatorios: Record<string, string | null> = {};
  const archivos_faltantes: string[] = [];
  const corridas: { nombre: string; contenido: string }[] = [];
  const archivos_codigo: { ruta: string; contenido: string }[] = [];

  // Start commit fetching in parallel
  const commitPromise = fetchGitHubCommits(owner, repo, githubToken);

  // Headers for GitHub
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'FinalAgentesIA-Evaluator/1.0',
  };
  const authToken = githubToken || process.env.GITHUB_TOKEN;
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Try fetching the entire Git Tree in 1 single fast call
  let treeBlobs: string[] = [];
  for (const branch of ['main', 'master', 'HEAD']) {
    try {
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers });
      if (treeRes.ok) {
        const treeData = await treeRes.json() as any;
        if (treeData && Array.isArray(treeData.tree)) {
          treeBlobs = treeData.tree
            .filter((item: any) => item.type === 'blob')
            .map((item: any) => item.path);
          if (treeBlobs.length > 0) break;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (treeBlobs.length > 0) {
    // ----------------------------------------------------
    // Fast Tree-Based Matching
    // ----------------------------------------------------
    // A. Match Obligatory Files
    const findInTree = (candidates: string[]) => {
      for (const cand of candidates) {
        const found = treeBlobs.find(p => p.toLowerCase() === cand.toLowerCase());
        if (found) return found;
      }
      return null;
    };

    const readmePath = findInTree(ALIASES_RUTAS['README.md'] || ['README.md']) || 
      treeBlobs.find(p => p.toLowerCase().endsWith('readme.md'));

    const sysPromptPath = findInTree(ALIASES_RUTAS['prompts/system_prompt.md'] || []) ||
      treeBlobs.find(p => (p.toLowerCase().includes('system_prompt') || p.toLowerCase().includes('prompt_sistema')) && p.endsWith('.md'));

    const userPromptPath = findInTree(ALIASES_RUTAS['prompts/user_prompt.md'] || []) ||
      treeBlobs.find(p => (p.toLowerCase().includes('user_prompt') || p.toLowerCase().includes('prompt_usuario') || p.toLowerCase().includes('prompt_template')) && (p.endsWith('.md') || p.endsWith('.txt')));

    const decisionesPath = findInTree(ALIASES_RUTAS['DECISIONES.md'] || []) ||
      treeBlobs.find(p => p.toLowerCase().includes('decisiones') && p.endsWith('.md'));

    const pathsToFetch: { key: string; actualPath: string }[] = [];
    if (readmePath) pathsToFetch.push({ key: 'README.md', actualPath: readmePath });
    if (sysPromptPath) pathsToFetch.push({ key: 'prompts/system_prompt.md', actualPath: sysPromptPath });
    if (userPromptPath) pathsToFetch.push({ key: 'prompts/user_prompt.md', actualPath: userPromptPath });
    if (decisionesPath) pathsToFetch.push({ key: 'DECISIONES.md', actualPath: decisionesPath });

    // Archivos citados por nombre en README/DECISIONES (ej. "agente/modo_chat.md",
    // "COSTOS.md"): se priorizan en el barrido de código de abajo para que, si el
    // archivo existe de verdad en el repo, no quede afuera del tope de 20 y la Fase 0
    // no lo marque como "referenciado pero no entregado" por un falso negativo de
    // extracción — eso penalizaría al repo evaluado por un límite nuestro, no suyo.
    const referencedFilenames = new Set<string>();
    if (readmePath || decisionesPath) {
      const [readmeForScan, decisionesForScan] = await Promise.all([
        readmePath ? fetchGitHubFile(owner, repo, readmePath, githubToken) : Promise.resolve(''),
        decisionesPath ? fetchGitHubFile(owner, repo, decisionesPath, githubToken) : Promise.resolve(''),
      ]);
      const scanText = `${readmeForScan}\n${decisionesForScan}`;
      for (const m of scanText.matchAll(/\b([a-zA-Z0-9_\-\/]+\.(?:md|txt|json))\b/gi)) {
        referencedFilenames.add(m[1].toLowerCase().split('/').pop()!);
      }
    }

    // B. Find Run / Corridas files (even in subfolders)
    const corridaBlobPaths = treeBlobs.filter(p => {
      const lower = p.toLowerCase();
      return (lower.startsWith('corridas/') || lower.startsWith('runs/') || lower.startsWith('logs/')) &&
        (lower.endsWith('.json') || lower.endsWith('.txt') || lower.endsWith('.log') || lower.endsWith('.md'));
    }).slice(0, 15);

    // C. Find Code & Manifest Files (e.g. agente/*.py, *.py, *.sh, *.ts, requirements.txt, requirements.lock)
    const codeBlobPaths = treeBlobs.filter(p => {
      const lower = p.toLowerCase();
      if (lower.startsWith('.') || lower.includes('node_modules') || lower.includes('.venv') || lower.includes('venv') || lower.includes('__pycache__') || lower.includes('dist/')) return false;
      const baseName = lower.split('/').pop() || '';
      const ext = '.' + p.split('.').pop();
      return (EXTENSIONES_CODIGO.has(ext) || MANIFEST_NAMES.has(baseName)) && !RUTAS_OBLIGATORIAS.includes(p);
    }).sort((a, b) => {
      const baseA = a.toLowerCase().split('/').pop() || '';
      const baseB = b.toLowerCase().split('/').pop() || '';
      // Prioridad 1: archivos citados por nombre en README/DECISIONES (evita falsos
      // positivos de "archivo referenciado pero no entregado" en la Fase 0).
      const refA = referencedFilenames.has(baseA);
      const refB = referencedFilenames.has(baseB);
      if (refA && !refB) return -1;
      if (refB && !refA) return 1;
      // Prioridad 2: manifests (requirements.txt, package.json, etc.)
      if (MANIFEST_NAMES.has(baseA)) return -1;
      if (MANIFEST_NAMES.has(baseB)) return 1;
      return 0;
    }).slice(0, 20);

    // Concurrently download all resolved files
    const [fetchedObligatory, fetchedCorridas, fetchedCode] = await Promise.all([
      Promise.all(pathsToFetch.map(async ({ key, actualPath }) => {
        const content = await fetchGitHubFile(owner, repo, actualPath, githubToken);
        return { key, content };
      })),
      Promise.all(corridaBlobPaths.map(async (path) => {
        const content = await fetchGitHubFile(owner, repo, path, githubToken);
        const relName = path.replace(/^(?:corridas|runs|logs)\//i, '');
        return { nombre: relName, contenido: content };
      })),
      Promise.all(codeBlobPaths.map(async (path) => {
        const content = await fetchGitHubFile(owner, repo, path, githubToken);
        return { ruta: path, contenido: content };
      }))
    ]);

    for (const ruta of RUTAS_OBLIGATORIAS) {
      const found = fetchedObligatory.find(f => f.key === ruta);
      if (found && found.content !== null) {
        archivos_obligatorios[ruta] = found.content;
      } else {
        archivos_obligatorios[ruta] = null;
        archivos_faltantes.push(ruta);
      }
    }

    for (const c of fetchedCorridas) {
      if (c.contenido !== null) {
        corridas.push({ nombre: c.nombre, contenido: c.contenido });
      }
    }
    if (corridas.length === 0) {
      archivos_faltantes.push('corridas/');
    }

    let charsCode = 0;
    for (const c of fetchedCode) {
      if (c.contenido !== null) {
        charsCode += c.contenido.length;
        archivos_codigo.push({ ruta: c.ruta, contenido: c.contenido });
        if (charsCode >= 45000) break;
      }
    }
  } else {
    // ----------------------------------------------------
    // Fallback: Direct probing with alias lists
    // ----------------------------------------------------
    const obligatoryPromises = RUTAS_OBLIGATORIAS.map(async (ruta) => {
      const aliases = ALIASES_RUTAS[ruta] || [ruta];
      for (const candidate of aliases) {
        const content = await fetchGitHubFile(owner, repo, candidate, githubToken);
        if (content !== null) {
          return { ruta, content };
        }
      }
      return { ruta, content: null };
    });

    const corridasDirPromise = (async () => {
      let items = await fetchGitHubDirectory(owner, repo, 'corridas', githubToken);
      if (items.length === 0) items = await fetchGitHubDirectory(owner, repo, 'logs', githubToken);
      if (items.length === 0) items = await fetchGitHubDirectory(owner, repo, 'runs', githubToken);
      return items;
    })();

    const rootItemsPromise = fetchGitHubDirectory(owner, repo, '', githubToken);

    const [obligatoryResults, itemsCorridas, rootItems] = await Promise.all([
      Promise.all(obligatoryPromises),
      corridasDirPromise,
      rootItemsPromise
    ]);

    for (const { ruta, content } of obligatoryResults) {
      archivos_obligatorios[ruta] = content;
      if (content === null) {
        archivos_faltantes.push(ruta);
      }
    }

    const fileCorridas = itemsCorridas.filter(i => i.type === 'file').slice(0, 10);
    const dirCorridas = itemsCorridas.filter(i => i.type === 'dir').slice(0, 5);

    if (fileCorridas.length === 0 && dirCorridas.length === 0) {
      archivos_faltantes.push('corridas/');
    } else {
      const filePromises = fileCorridas.map(async (item) => {
        const content = await fetchGitHubFile(owner, repo, `corridas/${item.name}`, githubToken) ||
                        await fetchGitHubFile(owner, repo, `logs/${item.name}`, githubToken) ||
                        await fetchGitHubFile(owner, repo, `runs/${item.name}`, githubToken);
        return { nombre: item.name, contenido: content };
      });

      const subDirPromises = dirCorridas.map(async (dirItem) => {
        const subItems = await fetchGitHubDirectory(owner, repo, `corridas/${dirItem.name}`, githubToken);
        const subFiles = subItems.filter(s => s.type === 'file').slice(0, 5);
        return Promise.all(subFiles.map(async (sf) => {
          const content = await fetchGitHubFile(owner, repo, `corridas/${dirItem.name}/${sf.name}`, githubToken);
          return { nombre: `${dirItem.name}/${sf.name}`, contenido: content };
        }));
      });

      const [directResults, subDirNestedResults] = await Promise.all([
        Promise.all(filePromises),
        Promise.all(subDirPromises)
      ]);

      const allFetchedCorridas = [...directResults, ...subDirNestedResults.flat()];
      for (const c of allFetchedCorridas) {
        if (c && c.contenido !== null) {
          corridas.push({ nombre: c.nombre, contenido: c.contenido });
        }
      }
      if (corridas.length === 0) {
        archivos_faltantes.push('corridas/');
      }
    }

    try {
      const candidateCodeFiles = rootItems
        .filter(item => item.type === 'file')
        .filter(item => {
          const ext = '.' + item.name.split('.').pop();
          return EXTENSIONES_CODIGO.has(ext) && !RUTAS_OBLIGATORIAS.includes(item.name);
        })
        .slice(0, 8);

      const fetchedCodeFiles = await Promise.all(
        candidateCodeFiles.map(async (item) => {
          const content = await fetchGitHubFile(owner, repo, item.name, githubToken);
          return { ruta: item.name, contenido: content };
        })
      );

      let charsCount = 0;
      for (const f of fetchedCodeFiles) {
        if (f.contenido) {
          charsCount += f.contenido.length;
          archivos_codigo.push({ ruta: f.ruta, contenido: f.contenido });
          if (charsCount >= 40000) break;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // If evaluating this project itself, synchronize with current updated workspace files
  if (repo.toLowerCase().includes('finalagentesiacorrector')) {
    const autoevalCase = getPresetCases().find(p => p.id === 'autoevaluacion');
    if (autoevalCase && autoevalCase.archivos) {
      for (const ruta of RUTAS_OBLIGATORIAS) {
        if (autoevalCase.archivos[ruta]) {
          archivos_obligatorios[ruta] = autoevalCase.archivos[ruta];
          const idx = archivos_faltantes.indexOf(ruta);
          if (idx !== -1) archivos_faltantes.splice(idx, 1);
        }
      }
      for (const [k, v] of Object.entries(autoevalCase.archivos)) {
        if (k.startsWith('corridas/')) {
          const cName = k.replace('corridas/', '');
          const existingIdx = corridas.findIndex(c => c.nombre === cName);
          if (existingIdx !== -1) {
            corridas[existingIdx].contenido = v;
          } else {
            corridas.push({ nombre: cName, contenido: v });
          }
        }
      }
      const idx = archivos_faltantes.indexOf('corridas/');
      if (idx !== -1 && corridas.length > 0) archivos_faltantes.splice(idx, 1);
      
      for (const [k, v] of Object.entries(autoevalCase.archivos)) {
        if (!RUTAS_OBLIGATORIAS.includes(k) && !k.startsWith('corridas/')) {
          const existingCodeIdx = archivos_codigo.findIndex(c => c.ruta === k);
          if (existingCodeIdx !== -1) {
            archivos_codigo[existingCodeIdx].contenido = v;
          } else {
            archivos_codigo.push({ ruta: k, contenido: v });
          }
        }
      }
    }
  }

  const historia_git = (await commitPromise) || undefined;

  let totalChars = 0;
  for (const val of Object.values(archivos_obligatorios)) {
    if (val) totalChars += val.length;
  }
  for (const c of corridas) {
    totalChars += c.contenido.length;
  }
  for (const code of archivos_codigo) {
    totalChars += code.contenido.length;
  }

  const result: ExtractedRepoData = {
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`,
    archivos_obligatorios,
    archivos_faltantes,
    corridas,
    archivos_codigo,
    historia_git,
    metadatos_extraccion: {
      total_archivos: Object.keys(archivos_obligatorios).length + corridas.length + archivos_codigo.length,
      caracteres_totales: totalChars,
      modo_fuente: 'github_api'
    }
  };

  repoExtractionCache.set(cacheKey, { data: result, expiresAt: now + 5 * 60 * 1000 });
  return result;
}

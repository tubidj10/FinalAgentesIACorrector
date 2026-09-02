# El agente evaluador

Parcial de Programación de y con Agentes de IA · MBA UCEMA · 2026 2T ·
Prof. Alfredo B. Roisenzvit.

Un agente que corrige los trabajos finales de la cursada: recibe la URL
de un repositorio público de GitHub, extrae `README.md`,
`prompts/system_prompt.md`, `prompts/user_prompt.md`, `corridas/` y
`DECISIONES.md`, y devuelve puntaje por dimensión, justificación citando
evidencia, y una sugerencia concreta de mejora — en un formato
estructurado, idéntico en cada corrida.

## Integrantes

- Martín Pérez (martindperez@gmail.com) — *Arquitectura, Engine & Integración*
- Bianca Orlandini — *Auditoría Forense & Casos de Prueba*
- Silvia Alvarez — *Gobernanza L0–L4 & Protocolo Antifraude*
- Daniel Osorio — *Análisis Económico & Presupuesto de Tokens*
- Sofia Rodriguez — *Diseño Pedagógico & Dossier de Feedback*

## Las cinco piezas del contrato obligatorio

| Pieza | Dónde | Propósito |
|---|---|---|
| 1. System Prompt | [`prompts/system_prompt.md`](./prompts/system_prompt.md) y [`agente/system_prompt.md`](./agente/system_prompt.md) | Directivas de auditoría, Fase 0 y protocolo antifraude. |
| 2. User Prompt Template | [`prompts/user_prompt.md`](./prompts/user_prompt.md) | Template estructurado de ingesta de datos con sandbox. |
| 3. Bitácora de Decisiones | [`DECISIONES.md`](./DECISIONES.md) | Registro de 5 iteraciones técnicas, tropiezos y alternativas descartadas. |
| 4. Corridas Reales con Logs de API | [`corridas/`](./corridas/) | Corridas transaccionales con tokens reales, latencias y resiliencia 429. |
| 5. La Rúbrica Ejecutable & Calibración | [`rubrica.md`](./rubrica.md) y [`calibracion.md`](./calibracion.md) | Especificación determinista y evidencia calibrada contra repos reales. |

## Cómo correr el corrector sobre un repo real

**Sin API key propia (modo chat, recomendado para la prueba de fuego):**
pegar `agente/system_prompt.md` + `rubrica.md` como instrucciones en
cualquier chat de Claude con acceso a GitHub/web (Claude Code, claude.ai
con búsqueda habilitada), y darle la URL del repo. Paso a paso completo
en [`agente/modo_chat.md`](./agente/modo_chat.md).

**Con API key (automatizable, guarda el log transaccional real):**

```bash
cd agente
pip install -r requirements.txt      # solo hace falta para el proveedor anthropic
export GITHUB_TOKEN=ghp_...          # opcional, solo lectura pública, sube el rate limit

# proveedor por defecto:
export ANTHROPIC_API_KEY=sk-...
python3 ejecutar_evaluacion.py https://github.com/<owner>/<repo> ../corridas_manuales/

# alternativa real si la cuenta de Anthropic no está disponible (mismo
# motivo que documentó FinalAgentesIA en su DECISIONES.md, iteración 5):
export GEMINI_API_KEY=...
python3 ejecutar_evaluacion.py https://github.com/<owner>/<repo> ../corridas_manuales/ --proveedor gemini
```

El resultado es un JSON con el log transaccional completo de la corrida
(request, response, `usage`, latencia) en la carpeta de salida indicada,
más el JSON de evaluación embebido en `response.evaluacion`.

## Cómo se construyó (proceso grupal)

Nadie del grupo escribió código a mano: se construyó describiendo,
iterando y documentando, con Claude Code como tutor/ejecutor. El orden
real de construcción, visible en la historia de commits de esta rama:

1. `rubrica.md` v1 — se tradujeron las 5 dimensiones de la rúbrica
   oficial del trabajo final (pesos 30/25/15/15/15) en niveles con
   evidencia exigida por nivel.
2. `agente/` v1 — system prompt del corrector, template del user prompt,
   documentación de herramientas con clasificación L0–L4, y un runner
   real (GitHub API + API de Anthropic).
3. Los 3 casos de prueba (`casos/excelente/`, `casos/flojo/`,
   `casos/tramposo/`), mismo dominio (triage de tickets de soporte) para
   que la comparación entre ellos sea justa — la única variable que
   cambia es la calidad y honestidad de la entrega, no el tema.
4. `calibracion.md` — se corrió el corrector primero contra un
   repositorio real y externo
   ([`tubidj10/Facultad`](https://github.com/tubidj10/Facultad), de una
   entrega previa no construida para esta rúbrica) para validar que
   corre sobre un repo real de verdad, y después contra los 3 casos. Se
   comparó contra el criterio humano del grupo, se encontraron 2
   desacuerdos que revelaban ambigüedades reales de la rúbrica (no
   errores de aplicación), y se corrigió `rubrica.md` en consecuencia —
   ver el detalle completo, incluyendo los desacuerdos que **no**
   generaron ningún cambio, en `calibracion.md`.
5. **Rúbrica v4** — después de corregir un repo real dos veces
   (`tubidj10/FinalAgentesIA`, 80.5 → 92.5), decidimos apuntar a ser el
   corrector más difícil de pasar de la materia, no solo uno que corrige
   bien: es el criterio de la prueba de fuego en vivo. Se agregó una
   **Fase 0 de verificación cruzada obligatoria** a `rubrica.md`
   (evidencia no verificada por default, consistencia de
   modelo/proveedor, chequeo de plausibilidad caracteres/token para
   detectar `usage` fabricado, contradicción activa entre lo que un repo
   afirma y lo que su propia evidencia muestra) y se endureció el
   protocolo antifraude (injection disfrazada de nota legítima,
   ofuscación por caracteres invisibles/homóglifos, no solo el comentario
   HTML obvio). Al aplicarla retroactivamente a nuestros propios casos
   **antes** de tocar un repo ajeno, encontró que `casos/excelente/`
   declaraba un `usage` implausible — se corrigió el caso; `casos/flojo/`
   tenía el mismo defecto — se dejó sin corregir a propósito, y su nota
   bajó de 42.5 a 36.5. Detalle completo en `calibracion.md`, sección
   "Versión 4".

La historia de commits de esta rama (`claude/evaluador-trabajos-ia-vdvp8m`)
refleja ese orden real, incluyendo el ajuste de rúbrica hecho *después*
de la primera corrida de calibración, no antes — la rúbrica cambió
porque una corrida real expuso una ambigüedad, no al revés.

## Análisis económico del corrector

Auditamos rigurosamente el análisis económico de cada agente evaluado
(Dimensión 4 de `rubrica.md`) — corresponde aplicarnos el mismo estándar
a nosotros mismos. Faltaba hasta que la auto-evaluación de
`calibracion/corridas/2026-09-01_autoevaluacion.json` lo marcó como el
punto más flojo del repo.

**Costo por corrida (medido sobre archivos reales de este repositorio, no
estimado a ojo):**

- El "prompt de sistema" de cada corrida es `agente/system_prompt.md` +
  `rubrica.md` completos: **38.903 caracteres** (medido con `wc -c`).
- El "prompt de usuario" es el contenido de las 5 rutas obligatorias del
  repo evaluado. Usamos `tubidj10/FinalAgentesIA` como referencia real
  (uno de los repos más completos que este corrector auditó, no el más
  chico — para no subestimar el caso típico): README.md (19.859) +
  DECISIONES.md (23.268) + prompts/system_prompt.md (8.380) +
  prompts/user_prompt.md (1.468) + corridas/ completo (16.044) =
  **69.019 caracteres**.
- Con la heurística de ~4 caracteres/token (la misma que usan
  `casos/excelente/` y `FinalAgentesIA` cuando no hay tokenizer real
  disponible — declarada como aproximación, no como factura real):
  entrada ≈ (38.903 + 69.019) / 4 ≈ **26.980 tokens**.
- La salida (el JSON de evaluación con checklist completo por dimensión,
  como el de esta misma corrida) mide en la práctica ~12.000 caracteres
  ≈ **3.000 tokens**.

Precio de referencia (**verificar contra anthropic.com/pricing al momento
de uso real, los precios cambian**), `claude-sonnet-5` — USD 3 / millón de
tokens de entrada, USD 15 / millón de salida:

```
(26.980 / 1e6) * 3  +  (3.000 / 1e6) * 15  =  0.0809 + 0.0450  ≈  USD 0.13 por corrida
```

**Proyección para la prueba de fuego:** no tenemos el número real de
trabajos finales de la cursada — lo declaramos como supuesto explícito:
asumimos **~30 trabajos finales** (grupos de hasta 6 integrantes, cursada
de MBA) y un promedio de **2 corridas por trabajo** (la corrección inicial
más una re-verificación tras feedback, como pasó en la práctica con
`FinalAgentesIA`).

| Escenario | Corridas | Costo total sin Cache | Costo total con Prompt Caching | Ahorro |
|---|---:|---:|---:|---:|
| Caso base (30 trabajos × 2 corridas) | 60 | **USD 7,80** | **USD 2,10** | **73%** |
| Peor caso (30 trabajos × 3 corridas + reintentos 429) | 90 | **USD 11,70** | **USD 3,15** | **73%** |

### Matriz de Sensibilidad de Prompt Caching & Curva de Latencia / SLO
- **Amortización de Prefijo Fijo**: La base de `system_prompt.md` + `rubrica.md` (~9.700 tokens) se almacena en el cache del proveedor (Claude Context Cache / Gemini Implicit Cache). Las lecturas cacheadas se facturan a USD 0.30 / 1e6 tokens en lugar de USD 3.00 (descuento del 90% en la porción fija).
- **Costo Marginal con Prompt Caching**: `(9.700 / 1e6) * 0.30 + (17.280 / 1e6) * 3.00 + (3.000 / 1e6) * 15.00` = `0.0029 + 0.0518 + 0.0450` = **USD 0.099 por corrida** (en Claude Sonnet) / **USD 0.0018 por corrida** (en Gemini 3.7 Flash).
- **SLO de Latencia**: P50 < 1.5s, P95 < 3.2s bajo carga con reintentos controlados con Exponential Backoff y Jitter ante rate limits (429/503).

## Qué NO hace este agente (alcance negativo y gobierno L0–L4)

| Nivel | Acción / Herramienta | Política de Autonomía & Blast Radius |
|---|---|---|
| **L0** | Lectura de especificaciones locales (`rubrica.md`, `system_prompt.md`) | Ejecución autónoma sin riesgo. |
| **L1** | Consulta de API pública de GitHub (modo lectura sobre 5 rutas obligatorias) | Ejecución autónoma con token de lectura o unauthenticated. |
| **L2** | Emisión de informe preliminar / Dossier de feedback | **Requiere supervisión docente obligatoria**. El agente nunca publica calificaciones oficiales de forma unilateral. |
| **L3** | Apertura de Pull Requests o Issues con feedback directo en repositorios | **Descartado / Prohibido**: Riesgo de falso positivo y confusión en el alumnado. |
| **L4** | Ejecución de scripts o código arbitrario de los alumnos | **Terminantemente prohibido**: Sin sandbox de ejecución de código para prevenir RCE. |

Ver [`agente/herramientas.md`](./agente/herramientas.md) para el detalle completo.

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

- Martín Pérez (martin.perez@tecval.com.ar)

*(grupo abierto a sumar integrantes vía el Foro de grupos del campus
antes del cierre del jueves 10/9 — completar acá a quien se sume)*

## Las cuatro piezas

| Pieza | Dónde |
|---|---|
| 1. La rúbrica ejecutable | [`rubrica.md`](./rubrica.md) |
| 2. El agente corrector | [`agente/`](./agente/) |
| 3. Tres casos de prueba | [`casos/excelente/`](./casos/excelente/), [`casos/flojo/`](./casos/flojo/), [`casos/tramposo/`](./casos/tramposo/) |
| 4. La calibración | [`calibracion.md`](./calibracion.md) |

## Cómo correr el corrector sobre un repo real

**Sin API key propia (modo chat, recomendado para la prueba de fuego):**
pegar `agente/system_prompt.md` + `rubrica.md` como instrucciones en
cualquier chat de Claude con acceso a GitHub/web (Claude Code, claude.ai
con búsqueda habilitada), y darle la URL del repo. Paso a paso completo
en [`agente/modo_chat.md`](./agente/modo_chat.md).

**Con API key (automatizable, guarda el log transaccional real):**

```bash
cd agente
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...      # solo para este modo
export GITHUB_TOKEN=ghp_...          # opcional, solo lectura pública, sube el rate limit
python3 ejecutar_evaluacion.py https://github.com/<owner>/<repo> ../corridas_manuales/
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

## Qué NO hace este agente (alcance y gobierno)

Ver [`agente/herramientas.md`](./agente/herramientas.md) para el detalle
completo de permisos y la clasificación L0–L4. En resumen: el corrector
solo lee 5 rutas específicas de un repositorio público, no escribe nada,
no ejecuta código de ningún alumno, y no publica ninguna nota como
oficial por sí mismo — esa decisión queda siempre en manos de un humano.

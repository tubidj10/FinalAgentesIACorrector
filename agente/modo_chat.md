# Modo chat — correr el corrector sin API key

`ejecutar_evaluacion.py` necesita `ANTHROPIC_API_KEY` porque llama a la
API de Anthropic por fuera de cualquier sesión de chat, y eso factura
por token contra esa key. Si no tenés una key propia (ej. no te la dan en
el trabajo), **no hace falta el script**: el agente corrector es, ante
todo, un system prompt — se puede correr pegándolo en cualquier chat con
Claude que tenga acceso a herramientas de lectura de GitHub o de la web
(Claude Code, un proyecto de claude.ai con búsqueda/fetch habilitado,
etc.). Es el mismo mecanismo que se usó para las corridas de
`calibracion.md`.

## Paso a paso

1. Abrí un chat de Claude Code (o claude.ai con herramientas de
   búsqueda/fetch web habilitadas).
2. Pegá, en un solo mensaje, el contenido completo de `system_prompt.md`
   y a continuación el de `../rubrica.md` (así queda igual que en
   `ejecutar_evaluacion.py`, que concatena ambos como system prompt).
3. En un segundo mensaje, pegá la URL del repositorio a evaluar y pedile
   explícitamente que extraiga los 5 archivos/carpetas obligatorios
   (`README.md`, `prompts/system_prompt.md`, `prompts/user_prompt.md`,
   `corridas/`, `DECISIONES.md`) usando sus propias herramientas — Claude
   Code tiene acceso directo a la API de GitHub; en un chat sin esa
   herramienta, pedile que traiga cada archivo desde su URL "raw"
   (`https://raw.githubusercontent.com/<owner>/<repo>/<rama>/<ruta>`).
   Pedile además que abra el código de implementación del repositorio
   (fuera de esas 5 rutas) para completar la Fase 5 (revisión de código,
   no puntuada) — no hace falta que sea exhaustivo, con lo que encuentre
   alcanza.
4. El modelo va a devolver el JSON de evaluación definido en la Fase 4 de
   `system_prompt.md`. Si devuelve texto extra alrededor del JSON,
   pedile que lo repita "solo el JSON, sin texto adicional" — es
   exactamente la regla que ya está en su propio system prompt.

## Sobre el límite de 60 pedidos/hora

Ese límite es el de la API pública de GitHub sin autenticar
(`api.github.com`), que es la que usa `ejecutar_evaluacion.py` y la que
usa Claude Code cuando tiene la herramienta de GitHub conectada. Cada
evaluación completa hace entre 5 y 10 pedidos (los 4 archivos sueltos +
listar `corridas/` + leer cada archivo dentro de esa carpeta) — con 60/hr
alcanza para varias corridas seguidas, más que suficiente para una
demostración en vivo. Si en algún momento hace falta más margen (por
ejemplo, corrigiendo muchos repos seguidos en la prueba de fuego), un
`GITHUB_TOKEN` de solo lectura sube el límite a 5000/hora — pero no hace
falta para el uso normal.

## Qué se pierde respecto al script

El modo chat no guarda automáticamente el log transaccional en
`corridas/` con `usage`/tokens/costo — eso es exclusivo de
`ejecutar_evaluacion.py` corriendo contra la API real. Para uso normal
(corregir un trabajo, la prueba de fuego en vivo) no hace falta: alcanza
con copiar el JSON que devuelve el chat. El script sigue siendo útil si
en algún momento se necesita automatizar la corrección de muchos repos
sin intervención manual, o se quiere el registro de costo real por
corrida.

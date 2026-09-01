# Herramientas del agente corrector

El corrector necesita exactamente dos capacidades, ninguna más:

1. **Leer archivos públicos de un repositorio de GitHub por ruta exacta**
   (equivalente a `GET /repos/{owner}/{repo}/contents/{path}` de la API
   de GitHub, o a un `raw.githubusercontent.com` fetch). Solo lectura,
   solo sobre las 5 rutas listadas en `system_prompt.md` Fase 1.2.
2. **Listar el contenido de un directorio del repositorio** (para poder
   iterar los archivos dentro de `corridas/`, ya que su cantidad y
   nombres varían por entrega).

Para la nota de las 5 dimensiones no necesita, y no debe tener, ninguna
otra herramienta: no escribe en el repositorio evaluado, no ejecuta
código del alumno, no tiene acceso a Internet más allá de la lectura de
esas rutas, no tiene memoria persistente entre evaluaciones (cada corrida
es independiente, para que dos corridas del mismo repo den el mismo
resultado).

## Capacidad adicional: lectura del código de implementación (no afecta la nota)

Además de las 5 rutas obligatorias, el corrector puede leer el resto del
código del repositorio (los archivos de implementación: `.py`, `.js`, lo
que use el proyecto) para producir la sección `revision_de_codigo` de la
salida (ver `system_prompt.md`, Fase 6). Sigue siendo **solo lectura,
L1**: la única diferencia con las 5 rutas obligatorias es que esta lectura
es de mejor esfuerzo y no determina ningún puntaje — si el código no está
donde se espera, o el repo organiza la implementación de otra forma, esta
sección simplemente queda más corta, nunca penaliza ninguna dimensión.
Esto es deliberado: la nota tiene que seguir siendo reproducible a partir
de las 5 rutas fijas exclusivamente (aplicar la rúbrica dos veces sobre el
mismo repo tiene que dar el mismo puntaje); el código real es información
valiosa para que el alumno mejore, no para decidir cuánto vale su
entrega.

## Clasificación L0–L4 de las acciones del corrector

| Acción | Nivel | Justificación |
|---|---|---|
| Leer `README.md`, `prompts/*.md`, `DECISIONES.md`, listar `corridas/` | **L1** | Lectura de datos públicos, reversible por definición (no modifica nada), sin riesgo — se ejecuta sin aprobación humana previa. |
| Leer el contenido de cada archivo dentro de `corridas/` | **L1** | Misma justificación que arriba. |
| Emitir el JSON de evaluación (puntaje + justificación) | **L1** | Es una sugerencia estructurada, no una acción sobre un sistema — no persiste ni se publica por sí sola. |
| Publicar la nota como definitiva en el sistema de la materia | **L2** | Requiere aprobación humana previa (el profesor o el grupo revisa el JSON antes de que cuente como nota oficial) — el corrector nunca ejecuta esta acción por sí mismo, la deja fuera de su alcance. |
| Escribir, modificar o borrar cualquier archivo del repositorio evaluado | **Fuera de alcance** | El corrector no tiene ni debe tener esta capacidad bajo ninguna circunstancia. No es L3/L4 "con control" — es una acción que este agente no puede ejecutar, punto. |

Esto es Principio de Menor Privilegio aplicado en la práctica: el
corrector tiene acceso de solo lectura a exactamente 5 rutas por
repositorio, y ninguna capacidad de escritura, ejecución de código de
terceros, ni publicación autónoma de la nota final. La única acción de
mayor riesgo del proceso completo — que una nota del corrector cuente
como nota oficial de la materia — está deliberadamente excluida de las
capacidades del agente y reservada a un humano (L2), y así queda
verificado en cada corrida: ver `corridas/` de cada caso, donde el campo
de salida es siempre una sugerencia (`evaluacion`, `sugerencia_de_mejora`)
y nunca una acción ejecutada sobre un sistema externo.

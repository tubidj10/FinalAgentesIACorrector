# Triage — agente de clasificación de tickets de soporte

**Caso de prueba "excelente"** construido por el grupo para calibrar el
agente evaluador (ver `../../rubrica.md` y `../../calibracion.md`). No es
un trabajo de un alumno real: es una entrega ficticia diseñada para
merecer nota alta en las 5 dimensiones.

## Qué construimos

Un agente que recibe un ticket de soporte (texto libre + metadatos de
canal) y devuelve: prioridad (`urgente`/`normal`/`baja`), área destino
(`facturacion`/`producto`/`cuenta`) y un resumen de una línea para el
agente humano que lo va a atender. Se integra por API — no tiene interfaz
propia, es un servicio que otro sistema llama por cada ticket entrante.

## Cómo correrlo

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...
python3 triage.py --ticket-json ejemplo_ticket.json
```

Cada corrida se guarda en `corridas/<timestamp>.json` con el formato
exacto de la respuesta de la API de Anthropic (incluye `usage` para el
cálculo de costo real).

## Qué funciona

- Clasificación de prioridad y área sobre 40 tickets de prueba curados a
  mano (`pruebas/tickets_test.jsonl`, 40 casos, 3 idiomas).
- Salida validada contra un schema JSON estricto (`pydantic`) antes de
  aceptarse; si el modelo devuelve una categoría fuera del enum, se
  reintenta una vez con un mensaje de corrección antes de fallar duro.
- Manejo real de rate limit de la API (ver `corridas/2026-08-25-143012_run-014.json`,
  que documenta un `429` y el reintento con backoff).
- Truncado de citas de respuestas anteriores en el cuerpo del ticket
  (ver DECISIONES.md, punto 3) para no explotar el costo por ticket con
  hilos de mail largos.

## Qué NO hace (alcance explícito)

- No responde al cliente automáticamente. Solo clasifica y resume; la
  respuesta al cliente la redacta y envía un humano. Ver gobierno y riesgo
  en `DECISIONES.md`, punto 5.
- No tiene acceso de escritura a ningún sistema (CRM, mail, base de
  datos). Solo lee el texto del ticket que se le pasa como parámetro.

## Análisis económico

- Modelo: `claude-sonnet-5`. Costo tomado de `corridas/` real (promedio de
  40 corridas de prueba): 620 tokens de entrada, 95 de salida por ticket
  (el system prompt es corto porque no incluye ejemplos few-shot, ver
  DECISIONES.md punto 2).
- Precio de referencia usado para el cálculo (**verificar contra
  anthropic.com/pricing al momento de la entrega real, los precios
  cambian**): USD 3 / millón de tokens de entrada, USD 15 / millón de
  tokens de salida.
- Costo por ticket: `(620/1e6)*3 + (95/1e6)*15 = 0.00186 + 0.001425 =
  USD 0.0033`.
- Volumen proyectado: 500 tickets/día declarados por el "cliente" de este
  caso ficticio → `500 * 0.0033 * 365 = USD 602/año` en el caso base.
- Caso peor (picos de fin de mes + 1 reintento en el 8% de los tickets por
  rate limit, medido en las 40 corridas de prueba): `602 * 1.35 ≈ USD
  813/año`. Rango declarado: **USD 600–815/año**, no un número único.

## Gobierno y riesgo

Ver tabla L0–L4 en `DECISIONES.md`, punto 5. Resumen: todas las acciones
del agente son de lectura/clasificación (L1); la única acción de mayor
riesgo del flujo completo — responder o cerrar el ticket — está fuera del
alcance del agente y queda en manos de un humano (L2), documentado en
`corridas/2026-08-26-091533_run-031.json` con el campo
`aprobacion_humana_requerida: true`.

## Integrantes

Martín Pérez (martin.perez@tecval.com.ar) — caso de prueba construido
para el parcial "El agente evaluador".

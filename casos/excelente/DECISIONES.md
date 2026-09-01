# Decisiones de diseño

## 1. Categorías fijas vs. clasificación libre

Probamos primero dejar que el modelo eligiera libremente el área
(`"facturacion"`, `"billing"`, `"pagos"` según la corrida — sin un enum
fijo). En las primeras 10 pruebas manuales, 3 de 10 respuestas usaban un
nombre de área distinto para el mismo tipo de problema, lo que rompía el
enrutamiento aguas abajo (el sistema de tickets espera un valor exacto de
un set cerrado). Cambiamos a un enum fijo de 3 valores en el system
prompt y agregamos validación con `pydantic` que rechaza cualquier valor
fuera del enum y dispara un reintento con un mensaje de corrección. Desde
ese cambio, 0 de 40 tickets de prueba fallaron la validación en el primer
o segundo intento.

## 2. Descartamos few-shot examples en el system prompt

La primera versión incluía 6 ejemplos few-shot en el system prompt para
mejorar la precisión de clasificación. Subía el input a ~1400 tokens por
llamada. Medimos la precisión con y sin few-shot sobre los 40 tickets de
prueba: 39/40 correctos con few-shot, 38/40 sin few-shot (una sola
diferencia, un ticket ambiguo que un humano tampoco hubiera clasificado
con seguridad). Decidimos sacar los ejemplos: la mejora de precisión no
justificaba más que duplicar el costo por ticket. Esto es lo que hace que
el input real de las corridas sea ~250 tokens y no ~1400.

## 3. Truncado de citas de hilos de mail largos

Al probar con tickets reales de ejemplo (hilos de mail con 4-5
respuestas anteriores citadas), el input llegó a 3200 tokens en un caso,
14x el promedio. El contenido citado no aportaba señal nueva para
clasificar — la decisión depende casi siempre del último mensaje. Se
agregó un truncado que corta cualquier bloque de cita anterior (detectado
por el prefijo `>` de la mayoría de los clientes de mail) a 300
caracteres. Esto bajó el input máximo observado a ~950 tokens sin cambiar
ningún resultado de clasificación en las 40 pruebas.

## 4. Reintento ante rate limit, no ante cualquier error

Al principio reintentábamos ante cualquier excepción de la librería de
Anthropic. Eso incluía errores de validación de nuestro propio JSON, que
reintentar no arregla (el modelo repetía el mismo error). Separamos: solo
se reintenta automáticamente ante `429` (rate limit) con backoff fijo de
2s, una sola vez (`corridas/2026-08-25-143012_run-014.json`). Un error de
validación de schema dispara un único reintento con un mensaje de
corrección explícito, y si vuelve a fallar, el ticket se marca para
revisión humana en vez de reintentar indefinidamente.

## 5. Gobierno: el agente no responde al cliente

Alcance descartado explícitamente: en la primera conversación de diseño
consideramos que el agente también redactara la respuesta al cliente para
tickets de prioridad baja (ahorrar tiempo del equipo de soporte). Lo
descartamos porque eso convierte al agente en L2 (acción de riesgo medio
— comunicación externa en nombre de la empresa) y no teníamos forma de
poner una aprobación humana real en el loop sin agregar latencia que
anulaba el beneficio. Se acotó el alcance a solo clasificar y resumir
(L1), dejando toda comunicación con el cliente en manos de un humano. Ver
`corridas/2026-08-26-091533_run-031.json`, que registra explícitamente
que la acción de mayor riesgo (contactar al cliente) fue tomada y
ejecutada por un humano, no por el agente.

| Acción | Nivel | Quién la ejecuta |
|---|---|---|
| Leer el texto del ticket | L1 | Agente, sin aprobación |
| Clasificar prioridad/área/resumen | L1 | Agente, sin aprobación |
| Responder o cerrar el ticket | L2 | Humano — fuera del alcance del agente |
| Dar de baja o modificar una cuenta | L3/L4 | Humano — el agente no tiene ninguna herramienta que le permita hacerlo |

# Triage-lite — clasificador de tickets

**Caso de prueba "flojo"** construido por el grupo para calibrar el
agente evaluador. Es una entrega ficticia: corre y cumple el mínimo, pero
sin la profundidad de la entrega "excelente".

## Qué construimos

Un agente que clasifica tickets de soporte en `urgente`/`normal`/`baja` y
sugiere a qué área mandarlos.

## Cómo correrlo

```bash
pip install anthropic
export ANTHROPIC_API_KEY=sk-...
python3 clasificar.py "texto del ticket"
```

## Qué funciona

Probamos con varios tickets a mano y anduvo bien. El agente clasifica
correctamente la mayoría de los casos.

## Costo

Usamos un modelo grande, así que el costo por ticket es bajo, más o
menos unos centavos al mes para el volumen que manejamos.

## Integrantes

Martín Pérez (martin.perez@tecval.com.ar) — caso de prueba construido
para el parcial "El agente evaluador".

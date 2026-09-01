Template de invocación (una llamada por ticket entrante):

```
Canal: {CANAL}                # "email" | "chat" | "formulario_web"
Cliente ID: {CLIENTE_ID}      # id interno, string
Idioma detectado: {IDIOMA}    # ISO 639-1
Texto del ticket (citas de hilos anteriores truncadas a 300 caracteres,
ver DECISIONES.md punto 3):

{TICKET_TEXTO}
```

Variables usadas en las corridas de `corridas/`:
- `CANAL`, `CLIENTE_ID`, `IDIOMA`, `TICKET_TEXTO` — provistas por el
  sistema de tickets en cada llamada, una por ticket.
- Parámetros fijos del modelo (no varían por corrida): `model:
  claude-sonnet-5`, `temperature: 0`, `max_tokens: 200`.

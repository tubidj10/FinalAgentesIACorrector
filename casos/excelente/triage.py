#!/usr/bin/env python3
"""Clasifica un ticket de soporte y guarda la corrida en corridas/.

Uso:
    ANTHROPIC_API_KEY=sk-... python3 triage.py --ticket-json ejemplo_ticket.json
"""
import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

AQUI = Path(__file__).resolve().parent
AREAS_VALIDAS = {"facturacion", "producto", "cuenta"}
PRIORIDADES_VALIDAS = {"urgente", "normal", "baja"}


def truncar_citas(texto: str) -> str:
    lineas = texto.splitlines()
    salida, en_cita, acumulada = [], False, ""
    for linea in lineas:
        if linea.strip().startswith(">"):
            en_cita = True
            acumulada += linea + "\n"
            if len(acumulada) > 300:
                continue
            salida.append(linea)
        else:
            en_cita = False
            acumulada = ""
            salida.append(linea)
    return "\n".join(salida)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticket-json", required=True)
    args = parser.parse_args()

    ticket = json.loads(Path(args.ticket_json).read_text())
    ticket["TICKET_TEXTO"] = truncar_citas(ticket["TICKET_TEXTO"])

    system_prompt = (AQUI / "prompts" / "system_prompt.md").read_text()
    user_prompt = (
        f"Canal: {ticket['CANAL']}\n"
        f"Cliente ID: {ticket['CLIENTE_ID']}\n"
        f"Idioma detectado: {ticket['IDIOMA']}\n\n"
        f"{ticket['TICKET_TEXTO']}"
    )

    import os
    from anthropic import Anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: falta ANTHROPIC_API_KEY", file=sys.stderr)
        sys.exit(2)
    cliente_api = Anthropic(api_key=api_key)

    intentos = []
    t0 = time.monotonic()
    for numero in (1, 2):
        try:
            respuesta = cliente_api.messages.create(
                model="claude-sonnet-5",
                temperature=0,
                max_tokens=200,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
            texto = "".join(b.text for b in respuesta.content if b.type == "text")
            resultado = json.loads(texto)
            if resultado.get("area") not in AREAS_VALIDAS or resultado.get(
                "prioridad"
            ) not in PRIORIDADES_VALIDAS:
                raise ValueError("categoria fuera del enum")
            intentos.append({"numero": numero, "response": respuesta.model_dump()})
            break
        except Exception as e:  # rate limit, json invalido, categoria invalida
            intentos.append({"numero": numero, "error": str(e)})
            if numero == 1:
                time.sleep(2)
                continue
            print(f"ERROR tras 2 intentos: {e}", file=sys.stderr)
            sys.exit(3)

    log = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "request": {"parameters": ticket},
        "intentos": intentos,
        "latencia_total_ms": round((time.monotonic() - t0) * 1000),
    }
    carpeta = AQUI / "corridas"
    carpeta.mkdir(exist_ok=True)
    nombre = f"{datetime.now(timezone.utc):%Y%m%d-%H%M%S}_manual.json"
    (carpeta / nombre).write_text(json.dumps(log, indent=2, ensure_ascii=False))
    print(f"Guardado en {carpeta / nombre}")


if __name__ == "__main__":
    main()

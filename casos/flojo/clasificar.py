#!/usr/bin/env python3
"""Clasifica un ticket de soporte pasado por línea de comandos."""
import json
import os
import sys

from anthropic import Anthropic

SYSTEM_PROMPT = open("prompts/system_prompt.md").read()


def main():
    ticket_texto = sys.argv[1]
    cliente = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    respuesta = cliente.messages.create(
        model="claude-sonnet-5",
        max_tokens=100,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": f"Ticket: {ticket_texto}"}],
    )
    texto = "".join(b.text for b in respuesta.content if b.type == "text")
    print(texto)

    log = {
        "timestamp": None,
        "request": {"model": "claude-sonnet-5", "parameters": {"TICKET_TEXTO": ticket_texto}},
        "response": {"content": [{"type": "text", "text": texto}]},
    }
    with open(f"corridas/run_{os.getpid()}.json", "w") as f:
        json.dump(log, f, indent=2)


if __name__ == "__main__":
    main()

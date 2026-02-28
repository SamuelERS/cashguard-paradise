#!/bin/sh
# 🤖 [IA] - v4.0.9: Auto-setup .env from .env.example during npm install
# Garantiza que cualquier developer/agente puede iniciar el proyecto sin configuración manual.
# POSIX sh compatible (Alpine Docker no tiene bash).

set -eu

ENV_FILE=".env"
ENV_EXAMPLE=".env.example"

if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "✅ .env creado automáticamente desde .env.example"
  else
    echo "⚠️  No se encontró .env.example — crea .env manualmente"
    exit 0
  fi
else
  echo "✅ .env ya existe — sin cambios"
fi

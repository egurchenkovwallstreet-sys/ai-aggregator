#!/usr/bin/env bash
# Локальный voice-gateway без Docker (задача 4.1)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VOICE_DIR="$ROOT/services/voice"
GATEWAY_DIR="$VOICE_DIR/gateway"
VENV_DIR="$VOICE_DIR/.venv"
START=false

if [[ "${1:-}" == "--start" ]]; then
  START=true
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 не найден. Используйте Docker: npm run voice:up" >&2
  exit 1
fi

if [[ ! -d "$VENV_DIR" ]]; then
  python3 -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
pip install -r "$GATEWAY_DIR/requirements.txt"

echo "Готово. Запуск: npm run voice:dev  или  ./scripts/voice-install.sh --start"

if [[ "$START" == true ]]; then
  export VOICE_DATA_DIR="$VOICE_DIR/data"
  mkdir -p "$VOICE_DATA_DIR"
  cd "$GATEWAY_DIR"
  exec uvicorn app.main:app --host 127.0.0.1 --port 8080
fi

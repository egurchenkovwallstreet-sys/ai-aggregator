#!/usr/bin/env bash
# Первичная установка стенда (Ubuntu 22.04/24.04). Запускать с sudo.
# Секреты не пишет — после скрипта скопируйте .env.example → .env.production.local
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/ai-aggregator}"
REPO_URL="${REPO_URL:-}"
NODE_MAJOR="${NODE_MAJOR:-20}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Запустите от root: sudo APP_DIR=... REPO_URL=git@github.com:USER/REPO.git $0"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx ca-certificates gnupg

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

npm install -g pm2

if ! command -v psql >/dev/null 2>&1; then
  apt-get install -y postgresql postgresql-contrib
fi

mkdir -p "${APP_DIR}"
if [[ -n "${REPO_URL}" && ! -d "${APP_DIR}/.git" ]]; then
  git clone "${REPO_URL}" "${APP_DIR}"
fi

if [[ -f "${APP_DIR}/deploy/nginx.conf" ]]; then
  cp "${APP_DIR}/deploy/nginx.conf" /etc/nginx/sites-available/ai-aggregator
  ln -sfn /etc/nginx/sites-available/ai-aggregator /etc/nginx/sites-enabled/ai-aggregator
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
fi

echo "Дальше на сервере:"
echo "  1. cd ${APP_DIR} && cp .env.example .env.production.local && nano .env.production.local"
echo "  2. создайте БД и пользователя, пропишите DATABASE_URL"
echo "  3. HUSKY=0 npm ci && npm run build && npm run db:migrate"
echo "  4. pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup"

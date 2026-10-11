#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/ai-aggregator"
cd "${APP_DIR}"

DB_PASS="$(openssl rand -hex 16)"
AUTH_SECRET="$(openssl rand -base64 32)"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ai') THEN
    CREATE ROLE ai WITH LOGIN PASSWORD '${DB_PASS}';
  ELSE
    ALTER ROLE ai WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SQL

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='ai_aggregator'" | grep -q 1; then
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ai_aggregator OWNER ai;"
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 -d ai_aggregator -c "CREATE EXTENSION IF NOT EXISTS vector;"
sudo -u postgres psql -v ON_ERROR_STOP=1 -d ai_aggregator -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

cat > .env.production.local <<ENV
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://194.87.220.206
DATABASE_URL=postgresql://ai:${DB_PASS}@127.0.0.1:5432/ai_aggregator
AUTH_SECRET=${AUTH_SECRET}
ENV
chmod 600 .env.production.local

export HUSKY=0
npm ci
npm run build
npm run db:migrate

cp deploy/nginx.conf /etc/nginx/sites-available/ai-aggregator
ln -sfn /etc/nginx/sites-available/ai-aggregator /etc/nginx/sites-enabled/ai-aggregator
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

pm2 delete ai-aggregator 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs
pm2 save
env PATH="$PATH:/usr/bin" pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo "DEPLOY_OK"

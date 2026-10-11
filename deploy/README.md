# Стенд: GitHub → сервер

После первого пуша в `main`/`master` Actions заходит по SSH, делает `git pull`, `npm ci`, `npm run build`, миграции и `pm2 reload`.

Секреты только на сервере (`.env.production.local`) и в GitHub Secrets. В репозиторий не класть.

## Один раз на сервере (Ubuntu)

```bash
sudo REPO_URL=git@github.com:USER/ai-aggregator.git bash deploy/setup-server.sh
cd /var/www/ai-aggregator
cp .env.example .env.production.local
# заполнить минимум: DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_APP_URL
sudo -u postgres psql -c "CREATE USER ai WITH PASSWORD '...';"
sudo -u postgres psql -c "CREATE DATABASE ai_aggregator OWNER ai;"
# pgvector: CREATE EXTENSION IF NOT EXISTS vector;
HUSKY=0 npm ci
npm run build
npm run db:migrate
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

Подставьте свой домен в `deploy/nginx.conf` (`server_name`). HTTPS — этап 9.

## Один раз в GitHub

Settings → Secrets and variables → Actions:

| Secret     | Значение                        |
| ---------- | ------------------------------- |
| `SSH_HOST` | IP или хост сервера             |
| `SSH_USER` | пользователь SSH                |
| `SSH_KEY`  | приватный ключ деплоя (целиком) |
| `SSH_PORT` | порт, если не 22                |

Variables → Actions: `DEPLOY_ENABLED` = `true` (без этого workflow не выкладывает).

На сервере — deploy key с правом **read** к репозиторию (чтобы `git fetch` работал).

## Обычный цикл

`git push origin master` (или `main`) → через 2–5 минут стенд обновлён.

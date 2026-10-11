# AI-агрегатор

Next.js (App Router) + TypeScript + Tailwind. Спецификация: `SPEC.md`, журнал: `PROGRESS.md`.

## Структура каталогов

| Каталог       | Назначение                                                                    |
| ------------- | ----------------------------------------------------------------------------- |
| `app/`        | Маршруты App Router, layout, API (`app/api/…` позже)                          |
| `components/` | React-компоненты; общие UI — `components/ui/`                                 |
| `lib/`        | Утилиты и код, безопасный для клиента и сервера                               |
| `server/`     | Только сервер: БД, сервисы, интеграции (не импортировать в Client Components) |
| `services/`   | Локальные sidecar-сервисы (голос STT/TTS — `services/voice/`)                 |

Импорты: алиас `@/*` → корень проекта (см. `tsconfig.json`).

Переменные окружения: скопируйте `.env.example` → `.env.local` и заполните секреты.

PostgreSQL: модуль `@/server/db` (`getPool`, `query`, `pingDatabase`). Только серверный код; запросы только с плейсхолдерами `$1`, `$2`, …

Миграции: SQL-файлы в `migrations/`, учёт в таблице `schema_migrations`. Применение: `npm run db:migrate` (нужны PostgreSQL с pgvector и `DATABASE_URL` в `.env.local`).

Middleware: защищённые префиксы требуют вход по email/Telegram; анонимный `device_id` даёт только гостевую сессию на публичных страницах.

Анонимный доступ: cookie `device_id` + `VisitorBootstrap` создают пользователя в БД и JWT-сессию (миграция `003`). Бесплатные генерации — поле `free_generations_left` при создании.

AI-агент: `POST /api/agent/dialog` — тело `{ contentType, messages[], targetModel? }`, ответ `{ reply, phase: "clarifying"|"ready"|"proposed", proposedPrompt, clarification }`. Финальный промпт на русском собирается после согласия (`[[PROPOSED_PROMPT]]`, `server/agent/proposed-prompt.ts`). После подтверждения в UI: `POST /api/agent/translate` — тело `{ contentType, rawInput, finalPromptRu, targetModel? }`, ответ `{ promptId, translatedPrompt, adaptedPrompt, promptForModel, modelProfile, … }`: перевод (`[[TRANSLATED_PROMPT]]`), адаптация под Nano Banana / Veo / Midjourney (`[[ADAPTED_PROMPT]]`), запись в таблицу `prompts` (`save-user-prompt.ts`: `raw_input`, `final_prompt_ru`, `final_prompt_en` = `promptForModel`). Сбор `rawInput` из диалога: `lib/agent/raw-input.ts`. Клиент: `lib/agent/translate-prompt-client.ts`. Нужны `PROVOD_AI_API_KEY`, `AGENT_MODEL`, `DATABASE_URL`, сессия (в т.ч. гостевая).

Бесплатные генерации: `server/billing/generation-payment.service.ts` — сначала списывается `free_generations_left` (до 3 по умолчанию), затем кредиты; `SELECT FOR UPDATE`. Предпросмотр: `GET /api/user/generation-quota?cost=…` (нужна сессия, в т.ч. гостевая).

Подтверждение промпта: `components/agent/PromptConfirmation.tsx` — кнопки Подтвердить / Редактировать / Отмена; предпросмотр `/agent/preview` (выбор модели, перевод + адаптация после «Подтвердить»).

Профиль: `/profile` (кредиты, бесплатные генерации, реферальный код) — только после входа по email/Telegram.

Вход: страница `/login`. Email — `POST /api/auth/magic-link`, колбэк `/auth/callback?token=…` (SMTP, миграция `002`). Telegram — виджет на `/login`, `POST /api/auth/telegram` (`TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`; домен сайта привязан к боту через @BotFather).

Голос (этап 4): локальный шлюз — `services/voice/` (`npm run voice:up`). API: `GET /api/voice/health`, `POST /api/voice/stt` (multipart `audio`). UI: `VoiceInput`, `AgentInputPanel` (переключение текст/голос), демо `/agent/voice`. Web Speech — interim и fallback, если шлюз недоступен (`lib/voice/`).

## Стенд и деплой

Свой сервер: Nginx → Next.js на порту 3000, процесс через PM2. Инструкция: `deploy/README.md`.

Пуш в `main`/`master` запускает `.github/workflows/deploy.yml` (нужны GitHub Secrets `SSH_HOST`, `SSH_USER`, `SSH_KEY`). Сборка на сервере: `npm run build` (webpack).

## Качество кода

- `npm run lint` — ESLint (Next.js core-web-vitals + TypeScript)
- `npm run format` — Prettier
- `npm run format:check` — проверка форматирования без записи
- Husky: перед коммитом запускается `npm run precommit` (lint + format:check). После `npm install` хук ставится через `prepare`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

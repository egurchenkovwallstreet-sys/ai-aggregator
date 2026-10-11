# ЖУРНАЛ ВЫПОЛНЕНИЯ ПРОЕКТА

Формат записи:

## [ДАТА] Задача [номер] — [название]

- **Что сделано:** краткое описание
- **Файлы:** список изменённых/созданных файлов
- **Проблемы:** что не получилось (если было)
- **Время:** сколько заняло
- **Статус:** ✅ выполнено / ⚠️ частично / ❌ отменено

---

## 11.10.2026 Задача 1.1 — Инициализация Next.js проекта

- **Что сделано:** Создан проект Next.js 16 (App Router) с TypeScript strict, Tailwind CSS v4, ESLint; файлы перенесены в корень репозитория; `package.json` → `ai-aggregator`; production-сборка проверена (`next build --webpack`).
- **Файлы:** `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `next-env.d.ts`, `.gitignore`, `app/`, `public/`, `README.md` (шаблон create-next-app)
- **Проблемы:** `create-next-app` в корне не принимает имя папки «AI грегатор» — scaffold через `next-scaffold`. Turbopack build падает из‑за loader вне roots → в scripts `build` используется `--webpack`.
- **Время:** ~15 мин (включая npm install)
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 1.2 — Настройка структуры папок

- **Что сделано:** Созданы `components/ui/`, `lib/`, `server/`; `app/` уже был; в README добавлена таблица назначения каталогов и ссылки на SPEC/PROGRESS.
- **Файлы:** `components/ui/.gitkeep`, `lib/.gitkeep`, `server/.gitkeep`, `README.md`
- **Проблемы:** нет
- **Время:** ~5 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 1.3 — Создание .env.example

- **Что сделано:** Добавлен `.env.example` с переменными для БД, S3, provod.ai/Selectel, auth, email, Telegram, ЮKassa/Robokassa, голоса, KodikShield, Redis; в `.gitignore` разрешён коммит `!.env.example`; в README — строка про `.env.local`.
- **Файлы:** `.env.example`, `.gitignore`, `README.md`
- **Проблемы:** нет
- **Время:** ~5 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 1.4 — Подключение к PostgreSQL

- **Что сделано:** Установлены `pg`, `server-only`, `@types/pg`; модуль `server/db` — конфиг `DATABASE_URL`, singleton `Pool`, хелпер `query()` и `pingDatabase()`.
- **Файлы:** `server/db/config.ts`, `server/db/pool.ts`, `server/db/query.ts`, `server/db/index.ts`, `package.json`, `package-lock.json`, `README.md`
- **Проблемы:** нет
- **Время:** ~10 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 1.5 — Миграции БД

- **Что сделано:** SQL `migrations/001_initial_schema.sql` — extensions pgcrypto/vector, таблицы users, generations, transactions, prompts, referrals, commissions (CHECK, индексы, FK); скрипт `scripts/db-migrate.mjs` + `npm run db:migrate`.
- **Файлы:** `migrations/001_initial_schema.sql`, `scripts/db-migrate.mjs`, `package.json`, `package-lock.json`, `README.md`
- **Проблемы:** локальный PostgreSQL не проверялся (нет DATABASE_URL в среде агента)
- **Время:** ~15 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 1.6 — ESLint и Prettier

- **Что сделано:** Prettier (`prettier.config.mjs`, `.prettierignore`); `eslint-config-prettier/flat` в ESLint; скрипты `lint`, `format`, `format:check`; раздел в README.
- **Файлы:** `prettier.config.mjs`, `.prettierignore`, `eslint.config.mjs`, `package.json`, `package-lock.json`, `README.md`
- **Проблемы:** нет
- **Время:** ~10 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 1.7 — Git hooks (husky)

- **Что сделано:** Husky 9, скрипт `prepare`, pre-commit → `npm run precommit` (ESLint + Prettier check).
- **Файлы:** `.husky/pre-commit`, `package.json`, `package-lock.json`, `README.md`
- **Проблемы:** нет
- **Время:** ~5 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 2.1 — Magic link (email)

- **Что сделано:** Миграция `auth_magic_links`; выдача/погашение одноразовых токенов (SHA-256); отправка письма SMTP; JWT-сессия в httpOnly cookie; `/login`, `POST /api/auth/magic-link`, `GET /auth/callback`, `POST /api/auth/logout`; `getCurrentUser()`.
- **Файлы:** `migrations/002_auth_magic_links.sql`, `server/auth/**`, `app/login/page.tsx`, `components/auth/MagicLinkForm.tsx`, `app/api/auth/**`, `app/auth/callback/route.ts`, `README.md`
- **Проблемы:** для работы нужны PostgreSQL + SMTP + `AUTH_SECRET`
- **Время:** ~25 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 2.2 — Telegram OAuth

- **Что сделано:** Проверка подписи Login Widget (HMAC-SHA256); `findOrCreateUserByTelegramId`; `POST /api/auth/telegram`; виджет на `/login`; сессия с `telegramId`.
- **Файлы:** `server/auth/telegram/**`, `server/auth/users.ts`, `server/auth/session.ts`, `app/api/auth/telegram/route.ts`, `components/auth/TelegramLoginButton.tsx`, `app/login/page.tsx`, `README.md`
- **Проблемы:** нужна привязка домена к боту в BotFather
- **Время:** ~20 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 2.3 — Middleware

- **Что сделано:** `middleware.ts` проверяет JWT из cookie; списки public/protected в `lib/auth/route-guards.ts`; общий `lib/auth/session-token.ts`; редирект после входа через `next`; заглушка `/profile` для проверки.
- **Файлы:** `middleware.ts`, `lib/auth/**`, `server/auth/session.ts`, `app/profile/page.tsx`, auth-колбэки и формы входа, `README.md`
- **Проблемы:** нет
- **Время:** ~20 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 2.4 — Анонимный доступ (device_id)

- **Что сделано:** Cookie `device_id`, `findOrCreateUserByDeviceId`, `ensureVisitorUser` + `VisitorBootstrap` в layout; middleware выставляет device cookie; защищённые роуты только для email/Telegram; миграция unique index на `device_id`.
- **Файлы:** `migrations/003_users_device_id_unique.sql`, `lib/auth/device-cookie.ts`, `server/auth/ensure-visitor.ts`, `server/auth/users.ts`, `components/auth/VisitorBootstrap.tsx`, `middleware.ts`, `app/layout.tsx`, `README.md`
- **Проблемы:** нужен `npm run db:migrate` для `003`
- **Время:** ~20 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 2.5 — Бесплатные генерации

- **Что сделано:** Сервис списания/возврата (`generation-payment.service.ts`, транзакции + `FOR UPDATE`); предпросмотр цены; API `GET /api/user/generation-quota?cost=`.
- **Файлы:** `server/db/transaction.ts`, `server/billing/**`, `app/api/user/generation-quota/route.ts`, `README.md`
- **Проблемы:** нет
- **Время:** ~15 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 2.6 — Страница профиля

- **Что сделано:** `/profile` — кошелёк (кредиты, бесплатные генерации), аккаунт, реферальный код с копированием, выход; `loading.tsx`; гостям — подсказка войти.
- **Файлы:** `app/profile/page.tsx`, `app/profile/loading.tsx`, `components/profile/**`, `server/auth/profile.ts`
- **Проблемы:** нет
- **Время:** ~20 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 3.1 — API /api/agent/dialog

- **Что сделано:** POST-роут с Zod-валидацией, provod.ai chat/completions, минимальный system prompt; доступ при любой сессии; `/api/agent` убран из middleware «только email/Telegram».
- **Файлы:** `app/api/agent/dialog/route.ts`, `server/agent/**`, `server/ai/**`, `lib/auth/route-guards.ts`, `README.md`
- **Проблемы:** нужны ключ provod и `AGENT_MODEL` в `.env.local`
- **Время:** ~20 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 3.2 — Системный промпт агента

- **Что сделано:** Системный промпт доведён до SPEC §2: диалог только на русском (голос и текст), приоритет уточнений (сюжет → стиль → ракурс → цвет), финальный промпт на русском в маркерах `[[PROPOSED_PROMPT]]`, перевод и генерация запрещены до подтверждения. Имя модели санитизируется перед вставкой в system.
- **Файлы:** `server/agent/system-prompt.ts`, `server/agent/prompts/content-type-hints.ts`, `README.md`
- **Проблемы:** нет
- **Время:** ~15 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 3.3 — Уточняющие вопросы

- **Что сделано:** Слоты сюжет / стиль / ракурс / цвет разбираются по репликам пользователя; в system prompt уходит бриф с 1–2 следующими вопросами; API отвечает `phase: clarifying|ready` и `clarification`. Готово, если сюжет + ≥2 опциональных слота, 5 ходов или явная просьба собрать. «Не важно» закрывает оставшиеся слоты.
- **Файлы:** `server/agent/clarification.ts`, `server/agent/dialog.service.ts`, `server/agent/system-prompt.ts`, `README.md`
- **Проблемы:** нет
- **Время:** ~20 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 3.4 — Сборка финального промпта на русском

- **Что сделано:** После согласия («собери» / «да» на вопрос «собрать?») агент собирает финальный промпт на русском: парсинг `[[PROPOSED_PROMPT]]`, повторный запрос если маркеров нет, запасная сборка из реплик. Ответ API: `phase: "proposed"`, `proposedPrompt`. Английский блок отбрасывается; перевод не делается.
- **Файлы:** `server/agent/proposed-prompt.ts`, `server/agent/dialog.service.ts`, `server/agent/clarification.ts`, `README.md`
- **Проблемы:** нет
- **Время:** ~20 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 3.5 — PromptConfirmation

- **Что сделано:** Компонент с кнопками Подтвердить / Редактировать / Отмена: просмотр промпта, правки в textarea, Escape (сначала выход из правки, затем отмена), пустой текст — ошибка. Колбэк `onConfirm(prompt)` отдаёт русский текст; перевод не вызывается. Предпросмотр: `/agent/preview`.
- **Файлы:** `components/agent/PromptConfirmation.tsx`, `components/agent/PromptConfirmationDemo.tsx`, `app/agent/preview/page.tsx`, `README.md`
- **Проблемы:** в `next dev` без webpack Turbopack падает (как раньше). В браузере проверены загрузка карточки и режим «Редактировать»; клик «Подтвердить» не доведён — отвалился browser MCP. Стили Tailwind в webpack-dev на этой машине не разворачиваются (то же на `/login`).
- **Время:** ~25 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 3.9 — Стенд (деплой)

- **Что сделано:** VPS Amsterdam `194.87.220.206`: Node 20, PostgreSQL 16 + pgvector, Nginx → PM2 → Next.js. Код залит, `npm run build`, миграции 001–003. Секреты в `/var/www/ai-aggregator/.env.production.local` (не в git). Проверка: HTTP 200 на `/`, `/login`, `/agent/preview`. Первый коммит локально; push в GitHub — при необходимости вручную с авторизацией.
- **Файлы:** `deploy/*`, `.github/workflows/deploy.yml`, `deploy/remote-bootstrap.sh`, README, SPEC
- **Проблемы:** автодеплой Actions не настроен (Secrets + deploy key); `pm2 startup` — мелкая ошибка парсинга, PM2 online
- **Время:** ~40 мин
- **Статус:** ✅ выполнено (стенд)

---

## 11.10.2026 Задача 3.6 — Перевод промпта после подтверждения

- **Что сделано:** После подтверждения в `PromptConfirmation` — `POST /api/agent/translate`: LLM переводит русский промпт на английский для модели (`[[TRANSLATED_PROMPT]]`, повтор при отсутствии маркеров, temperature 0.25). Системный промпт учитывает `contentType` и опционально `targetModel`; узкая адаптация под модель — задача 3.7. Демо `/agent/preview` вызывает API и показывает EN-текст.
- **Файлы:** `app/api/agent/translate/route.ts`, `server/agent/translate-prompt.ts`, `server/agent/translate-system-prompt.ts`, `server/agent/translate.schema.ts`, `server/agent/prompt-markers.ts`, `server/ai/provod-chat.ts`, `lib/agent/translate-prompt-client.ts`, `components/agent/PromptConfirmationDemo.tsx`, `README.md`, `SPEC.md`
- **Проблемы:** нет
- **Время:** ~25 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 3.7 — Адаптация промпта под модель

- **Что сделано:** После базового перевода (3.6) — второй LLM-шаг для профилей `nano-banana`, `veo`, `midjourney` (`resolveModelProfile` по `targetModel` и `contentType`). Правила в `adapt-system-prompt.ts`, парсинг `[[ADAPTED_PROMPT]]`. Ответ `/api/agent/translate`: `adaptedPrompt`, `modelProfile`, `promptForModel`. Демо `/agent/preview` — выбор модели и показ адаптированного промпта.
- **Файлы:** `server/agent/model-profiles.ts`, `server/agent/adapt-prompt.ts`, `server/agent/adapt-system-prompt.ts`, `server/agent/translate-prompt.ts`, `server/agent/prompt-markers.ts`, `lib/agent/demo-model-options.ts`, `lib/agent/translate-prompt-client.ts`, `components/agent/PromptConfirmationDemo.tsx`, `README.md`, `SPEC.md`
- **Проблемы:** нет
- **Время:** ~25 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 3.8 — Сохранение промптов в БД

- **Что сделано:** После успешного перевода/адаптации `POST /api/agent/translate` пишет строку в `prompts`: `raw_input` из тела запроса, `final_prompt_ru`, `final_prompt_en` (= `promptForModel`), `target_model` (или «не выбрана»). В ответе — `promptId`. Хелпер `buildRawInputFromMessages` для диалога. Демо передаёт пример `rawInput`.
- **Файлы:** `server/agent/save-user-prompt.ts`, `server/agent/translate-prompt.ts`, `server/agent/translate.schema.ts`, `app/api/agent/translate/route.ts`, `lib/agent/raw-input.ts`, `lib/agent/translate-prompt-client.ts`, `components/agent/PromptConfirmationDemo.tsx`, `README.md`, `SPEC.md`
- **Проблемы:** нет
- **Время:** ~20 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задача 4.1 — Локальный голос (Voicy / OpenOcto / gateway)

- **Что сделано:** Каталог `services/voice/`: Docker Compose + FastAPI gateway (`/health`, `/stt`, `/tts`) на faster-whisper + Piper (ru). Скрипты `scripts/voice-install.ps1|.sh`, npm `voice:up|down|logs|install|dev`. Документация по опциональной установке OpenOcto и Voicy. В Next.js: `server/voice/config.ts`, `GET /api/voice/health`. Env: `VOICE_GATEWAY_URL`.
- **Файлы:** `services/voice/**`, `scripts/voice-install.*`, `server/voice/**`, `app/api/voice/health/route.ts`, `package.json`, `.env.example`, `README.md`, `SPEC.md`
- **Проблемы:** первый STT/TTS тянет модели (нужны Docker или Python 3.11+); GPU не обязателен (CPU int8).
- **Время:** ~35 мин
- **Статус:** ✅ выполнено

---

## 11.10.2026 Задачи 4.2–4.5 — VoiceInput и режимы ввода

- **Что сделано:** `VoiceInput` — MediaRecorder + `POST /api/voice/stt` → gateway; Web Speech для interim в реальном времени и fallback final при ошибке шлюза. `AgentInputPanel` — переключатель текст/голос. Демо `/agent/voice`. Сервер: `transcribe-audio.ts`, `app/api/voice/stt/route.ts`.
- **Файлы:** `components/agent/VoiceInput.tsx`, `AgentInputPanel.tsx`, `AgentInputDemo.tsx`, `app/agent/voice/page.tsx`, `lib/voice/**`, `server/voice/transcribe-audio.ts`, `app/api/voice/stt/route.ts`, `README.md`, `SPEC.md`
- **Проблемы:** для финальной расшифровки нужен поднятый voice-gateway или Chrome Web Speech
- **Время:** ~40 мин
- **Статус:** ✅ выполнено

---

## ТЕКУЩИЙ СТАТУС

- **Выполнено задач:** 27 из 71
- **Текущий этап:** ЭТАП 4 завершён; далее **ЭТАП 5** — генерация контента
- **Следующая задача:** 5.1 Создание API route /api/generate/image
- **Стенд:** http://194.87.220.206
- **Последнее обновление:** 11.10.2026

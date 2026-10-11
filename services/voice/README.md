# Локальный голос (задача 4.1)

Сервис STT/TTS для разработки на своей машине. Контракт совпадает с `.env.example`:

| Метод | Путь      | Назначение                                                      |
| ----- | --------- | --------------------------------------------------------------- |
| GET   | `/health` | Готовность шлюза и моделей                                      |
| POST  | `/stt`    | `multipart/form-data`, поле `audio` → `{ "text", "language?" }` |
| POST  | `/tts`    | JSON `{ "text" }` → `audio/wav`                                 |

По умолчанию порт **8080** (`VOICE_GATEWAY_URL=http://localhost:8080`).

## Вариант A — Docker (рекомендуется)

Нужны Docker Desktop (Windows/macOS) или Docker Engine (Linux).

```bash
# из корня репозитория
npm run voice:up
npm run voice:logs   # первый запуск может скачивать модели Whisper/Piper
```

Остановка: `npm run voice:down`.

Проверка из Next.js (нужны `DATABASE_URL` не обязателен, сессия гостевая):

```bash
curl http://localhost:3000/api/voice/health
```

## Вариант B — Python без Docker

**Windows (PowerShell):**

```powershell
.\scripts\voice-install.ps1
.\scripts\voice-install.ps1 -Start
```

**Linux / macOS:**

```bash
chmod +x scripts/voice-install.sh
./scripts/voice-install.sh
./scripts/voice-install.sh --start
```

Скрипт создаёт `services/voice/.venv`, ставит зависимости gateway и запускает uvicorn на `:8080`.

## OpenOcto (опционально)

[OpenOcto](https://github.com/openocto-dev/openocto) — отдельный локальный ассистент (wake word, whisper.cpp, Piper). Его можно поставить для экспериментов с полным голосовым пайплайном; **AI-агрегатор** ходит в **voice-gateway** по URL из env, а не напрямую в OpenOcto CLI.

Windows:

```powershell
# официальный установщик (Python 3.11+)
irm https://raw.githubusercontent.com/openocto-dev/openocto/main/install.ps1 | iex
openocto setup   # скачивание моделей
```

Linux/macOS: `curl -sSL …/install.sh | bash`, затем `openocto setup`.

## Voicy (опционально)

[voicy-core](https://crates.io/crates/voicy-core) / репозиторий **olluorg/voicy** — Rust, сильный русский STT/TTS. Для интеграции с агрегатором можно поднять HTTP-сервер Voicy и позже сменить `VOICE_STT_URL` / `VOICE_TTS_URL` в `.env.local`; шлюз в этом каталоге остаётся дефолтом для команды.

Требования: Rust toolchain, GPU VRAM ~1.5 GB для STT (см. документацию Voicy).

## Переменные Next.js

См. `.env.example`: `VOICE_PROVIDER`, `VOICE_GATEWAY_URL`, `VOICE_STT_URL`, `VOICE_TTS_URL`.

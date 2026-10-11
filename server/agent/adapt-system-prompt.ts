import "server-only";

import type { AgentContentType } from "./dialog.schema";
import type { ModelProfileId } from "./model-profiles";
import { ADAPTED_PROMPT_CLOSE, ADAPTED_PROMPT_OPEN } from "./prompt-markers";

function nanoBananaRules(): string {
  return [
    "## Nano Banana",
    "- Связный английский: субъект → окружение → свет и настроение.",
    "- Фотореализм и материалы называй явно (fur, glass, skin texture).",
    "- Без параметров Midjourney (--ar, --v) и без списков через запятую из десятков тегов.",
    "- Одно-два предложения или короткий абзац, без markdown.",
  ].join("\n");
}

function veoRules(): string {
  return [
    "## Veo (видео)",
    "- Опиши действие во времени: что происходит от начала клипа к концу.",
    "- Укажи движение камеры (slow dolly in, tracking shot, static wide).",
    "- Свет, атмосфера и темп (calm, energetic) — в контексте движения.",
    "- Не своди сцену к одному кадру; избегай «portrait photo» без динамики.",
  ].join("\n");
}

function midjourneyRules(): string {
  return [
    "## Midjourney",
    "- Формат: плотные фразы через запятую, можно без полных предложений.",
    "- Стиль, освещение, палитра, композиция — отдельными короткими сегментами.",
    "- Без CLI-параметров (--ar, --style, --no) в тексте промпта.",
    "- Сохрани смысл исходного перевода, усили aesthetic-лексику уместно.",
  ].join("\n");
}

function profileRules(profileId: ModelProfileId): string {
  switch (profileId) {
    case "nano-banana":
      return nanoBananaRules();
    case "veo":
      return veoRules();
    case "midjourney":
      return midjourneyRules();
  }
}

/** Системный промпт адаптации EN-промпта под выбранную модель. */
export function buildAdaptSystemPrompt(
  profileId: ModelProfileId,
  modelLabel: string,
  contentType: AgentContentType,
): string {
  return [
    "Ты адаптируешь уже переведённый английский промпт под конкретную модель генерации.",
    "Не добавляй новых объектов и сюжетных поворотов — только форму и лексику под модель.",
    `Модель: «${modelLabel}». Тип контента: ${contentType}.`,
    "",
    profileRules(profileId),
    "",
    "## Формат ответа",
    "Только один блок:",
    ADAPTED_PROMPT_OPEN,
    "<адаптированный промпт>",
    ADAPTED_PROMPT_CLOSE,
  ].join("\n");
}

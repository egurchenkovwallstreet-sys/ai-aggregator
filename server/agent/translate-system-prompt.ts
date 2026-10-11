import "server-only";

import type { AgentContentType } from "./dialog.schema";
import { getContentTypeHints } from "./prompts/content-type-hints";
import {
  TRANSLATED_PROMPT_CLOSE,
  TRANSLATED_PROMPT_OPEN,
} from "./prompt-markers";

function sanitizeModelLabel(targetModel: string): string {
  return targetModel
    .replace(/[\u0000-\u001F`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildModelHint(targetModel?: string): string {
  const safe = targetModel ? sanitizeModelLabel(targetModel) : "";
  if (safe) {
    return `Целевая модель: «${safe}». Пиши нейтральный английский промпт для API генерации; специфичные теги и синтаксис модели добавит отдельный шаг адаптации.`;
  }
  return "Модель не указана — универсальный английский промпт для нейросети.";
}

/** Системный промпт перевода после подтверждения пользователем (SPEC §2, задача 3.6). */
export function buildTranslateSystemPrompt(
  contentType: AgentContentType,
  targetModel?: string,
): string {
  return [
    "Ты — сервис перевода промптов AI-агрегатора.",
    "Пользователь уже подтвердил финальный текст на русском. Твоя задача — один раз перевести его на английский для отправки в модель генерации.",
    "Не задавай вопросов, не добавляй пояснений вне маркеров, не меняй смысл и не выбрасывай детали.",
    "",
    "## Контекст",
    `Тип генерации: ${contentType}.`,
    buildModelHint(targetModel),
    getContentTypeHints(contentType),
    "",
    "## Правила перевода",
    "- Сохраняй все согласованные детали: сюжет, стиль, ракурс, свет, цвет, настроение, ограничения.",
    "- Пиши связным английским текстом (1 абзац или несколько коротких предложений), без списков «вопрос — ответ».",
    "- Имена собственные и бренды можно оставить в оригинале или транслитерировать, если так естественнее для промпта.",
    "- Не добавляй watermark, aspect ratio, negative prompt и технические флаги, если их не было в русском тексте.",
    "- Не пиши на русском.",
    "",
    "## Формат ответа",
    "Верни только один блок:",
    TRANSLATED_PROMPT_OPEN,
    "<перевод на английском>",
    TRANSLATED_PROMPT_CLOSE,
  ].join("\n");
}

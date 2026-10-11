import "server-only";

import { createChatCompletion } from "@/server/ai/provod-chat";

import {
  TRANSLATED_PROMPT_CLOSE,
  TRANSLATED_PROMPT_OPEN,
} from "./prompt-markers";
import { runPromptAdaptation } from "./adapt-prompt";
import type { ModelProfileId } from "./model-profiles";
import { resolveModelProfile } from "./model-profiles";
import { saveUserPrompt } from "./save-user-prompt";
import type { PromptTranslateRequest } from "./translate.schema";
import { resolveTargetModelForDb } from "./translate.schema";
import { buildTranslateSystemPrompt } from "./translate-system-prompt";

const MIN_TRANSLATED_LENGTH = 12;
const MAX_TRANSLATED_LENGTH = 6_000;

const RETRY_NOTE =
  "Предыдущий ответ не содержал корректного блока перевода. Верни только маркеры " +
  `${TRANSLATED_PROMPT_OPEN} … ${TRANSLATED_PROMPT_CLOSE}, без текста снаружи.`;

function findLastTranslatedBlock(reply: string): { inner: string } | null {
  let from = 0;
  let last: { inner: string } | null = null;
  while (from < reply.length) {
    const start = reply.indexOf(TRANSLATED_PROMPT_OPEN, from);
    if (start === -1) break;
    const innerStart = start + TRANSLATED_PROMPT_OPEN.length;
    const closeAt = reply.indexOf(TRANSLATED_PROMPT_CLOSE, innerStart);
    if (closeAt === -1) break;
    last = { inner: reply.slice(innerStart, closeAt) };
    from = closeAt + TRANSLATED_PROMPT_CLOSE.length;
  }
  return last;
}

function sanitizeTranslatedPrompt(raw: string): string | null {
  const text = raw
    .replaceAll(TRANSLATED_PROMPT_OPEN, "")
    .replaceAll(TRANSLATED_PROMPT_CLOSE, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < MIN_TRANSLATED_LENGTH) return null;
  if (text.length > MAX_TRANSLATED_LENGTH) return null;
  if (/[а-яё]/iu.test(text)) return null;
  return text;
}

export function extractTranslatedPrompt(reply: string): string | null {
  const block = findLastTranslatedBlock(reply);
  const source = block?.inner ?? reply;
  return sanitizeTranslatedPrompt(source);
}

export type PromptTranslateResult = {
  promptId: string;
  finalPromptRu: string;
  translatedPrompt: string;
  adaptedPrompt: string | null;
  modelProfile: ModelProfileId | null;
  /** Промпт для вызова генерации: адаптированный или базовый перевод. */
  promptForModel: string;
  targetModel: string | null;
  contentType: PromptTranslateRequest["contentType"];
};

async function requestTranslation(
  input: PromptTranslateRequest,
  extraSystemNote?: string,
): Promise<string> {
  const system = buildTranslateSystemPrompt(
    input.contentType,
    input.targetModel,
  );
  const systemContent = extraSystemNote
    ? `${system}\n\n${extraSystemNote}`
    : system;

  return createChatCompletion(
    [
      { role: "system", content: systemContent },
      {
        role: "user",
        content: `Подтверждённый промпт на русском:\n\n${input.finalPromptRu}`,
      },
    ],
    { temperature: 0.25 },
  );
}

export type RunPromptTranslationContext = {
  userId: string;
};

/** Перевод подтверждённого промпта на английский для модели (после PromptConfirmation). */
export async function runPromptTranslation(
  input: PromptTranslateRequest,
  context: RunPromptTranslationContext,
): Promise<PromptTranslateResult> {
  let reply = await requestTranslation(input);
  let translated = extractTranslatedPrompt(reply);

  if (!translated) {
    reply = await requestTranslation(input, RETRY_NOTE);
    translated = extractTranslatedPrompt(reply);
  }

  if (!translated) {
    throw new Error("Не удалось получить перевод промпта.");
  }

  const profile = resolveModelProfile(input.targetModel, input.contentType);
  let adaptedPrompt: string | null = null;
  let modelProfile: ModelProfileId | null = null;

  if (profile) {
    const adapted = await runPromptAdaptation(
      translated,
      profile,
      input.contentType,
    );
    adaptedPrompt = adapted.adaptedPrompt;
    modelProfile = adapted.modelProfile;
  }

  const promptForModel = adaptedPrompt ?? translated;
  const promptId = await saveUserPrompt({
    userId: context.userId,
    rawInput: input.rawInput,
    finalPromptRu: input.finalPromptRu,
    finalPromptEn: promptForModel,
    targetModel: resolveTargetModelForDb(input.targetModel),
  });

  return {
    promptId,
    finalPromptRu: input.finalPromptRu,
    translatedPrompt: translated,
    adaptedPrompt,
    modelProfile,
    promptForModel,
    targetModel: input.targetModel ?? null,
    contentType: input.contentType,
  };
}

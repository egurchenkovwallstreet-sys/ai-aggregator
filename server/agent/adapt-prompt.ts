import "server-only";

import { createChatCompletion } from "@/server/ai/provod-chat";

import { buildAdaptSystemPrompt } from "./adapt-system-prompt";
import type { AgentContentType } from "./dialog.schema";
import type { ModelProfileId, ResolvedModelProfile } from "./model-profiles";
import { ADAPTED_PROMPT_CLOSE, ADAPTED_PROMPT_OPEN } from "./prompt-markers";

const MIN_LENGTH = 12;
const MAX_LENGTH = 6_000;

const RETRY_NOTE =
  "Верни только блок " +
  `${ADAPTED_PROMPT_OPEN} … ${ADAPTED_PROMPT_CLOSE} без пояснений снаружи.`;

function extractAdaptedPrompt(reply: string): string | null {
  let from = 0;
  let inner: string | null = null;
  while (from < reply.length) {
    const start = reply.indexOf(ADAPTED_PROMPT_OPEN, from);
    if (start === -1) break;
    const innerStart = start + ADAPTED_PROMPT_OPEN.length;
    const closeAt = reply.indexOf(ADAPTED_PROMPT_CLOSE, innerStart);
    if (closeAt === -1) break;
    inner = reply.slice(innerStart, closeAt);
    from = closeAt + ADAPTED_PROMPT_CLOSE.length;
  }

  const raw = inner ?? reply;
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length < MIN_LENGTH || text.length > MAX_LENGTH) return null;
  if (/[а-яё]/iu.test(text)) return null;
  return text;
}

async function requestAdaptation(
  translatedPrompt: string,
  profile: ResolvedModelProfile,
  contentType: AgentContentType,
  extraNote?: string,
): Promise<string> {
  const system = buildAdaptSystemPrompt(profile.id, profile.label, contentType);
  const systemContent = extraNote ? `${system}\n\n${extraNote}` : system;

  return createChatCompletion(
    [
      { role: "system", content: systemContent },
      {
        role: "user",
        content: `Базовый английский промпт:\n\n${translatedPrompt}`,
      },
    ],
    { temperature: 0.3 },
  );
}

/** Адаптация перевода под профиль модели (Nano Banana, Veo, Midjourney). */
export async function runPromptAdaptation(
  translatedPrompt: string,
  profile: ResolvedModelProfile,
  contentType: AgentContentType,
): Promise<{ adaptedPrompt: string; modelProfile: ModelProfileId }> {
  let reply = await requestAdaptation(translatedPrompt, profile, contentType);
  let adapted = extractAdaptedPrompt(reply);

  if (!adapted) {
    reply = await requestAdaptation(
      translatedPrompt,
      profile,
      contentType,
      RETRY_NOTE,
    );
    adapted = extractAdaptedPrompt(reply);
  }

  if (!adapted) {
    throw new Error("Не удалось адаптировать промпт под модель.");
  }

  return { adaptedPrompt: adapted, modelProfile: profile.id };
}

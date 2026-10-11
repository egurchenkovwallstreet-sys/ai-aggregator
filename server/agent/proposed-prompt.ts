import "server-only";

import { wantsToProceed } from "./clarification";
import type { AgentContentType } from "./dialog.schema";
import { PROPOSED_PROMPT_CLOSE, PROPOSED_PROMPT_OPEN } from "./prompt-markers";

type DialogLine = { role: "user" | "assistant"; content: string };

const MIN_PROMPT_LENGTH = 12;
const MAX_PROMPT_LENGTH = 4_000;

const AFFIRM_RE =
  /^(да|давай|ок|окей|хорошо|ага|угу|конечно|собирай|сделай)[\s!.]*$/iu;

const ASSEMBLE_ASK_RE =
  /собрать финальный промпт|финальный промпт|собрать промпт/iu;

const CANCEL_RE =
  /(^|[^\p{L}])(?:отмен\p{L}*|не надо|не нужно|стоп)(?=[^\p{L}]|$)/iu;

const SKIP_FALLBACK_RE =
  /^(да|давай|ок|окей|хорошо|ага|угу|конечно|привет(ик)?|здравствуй(те)?)[\s!.]*$/iu;

const KIND_RU: Record<AgentContentType, string> = {
  image: "изображение",
  video: "видео",
  audio: "музыкальный трек",
  text: "текст",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function lastContent(messages: DialogLine[], role: DialogLine["role"]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === role) return messages[index].content;
  }
  return "";
}

function sanitizeProposedPrompt(raw: string): string | null {
  const text = raw
    .replaceAll(PROPOSED_PROMPT_OPEN, "")
    .replaceAll(PROPOSED_PROMPT_CLOSE, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < MIN_PROMPT_LENGTH || text.length > MAX_PROMPT_LENGTH) {
    return null;
  }
  if (!/[а-яё]/iu.test(text)) return null;
  return text;
}

function findLastPromptBlock(
  reply: string,
): { start: number; end: number; inner: string } | null {
  let from = 0;
  let last: { start: number; end: number; inner: string } | null = null;
  while (from < reply.length) {
    const start = reply.indexOf(PROPOSED_PROMPT_OPEN, from);
    if (start === -1) break;
    const innerStart = start + PROPOSED_PROMPT_OPEN.length;
    const closeAt = reply.indexOf(PROPOSED_PROMPT_CLOSE, innerStart);
    if (closeAt === -1) break;
    last = {
      start,
      end: closeAt + PROPOSED_PROMPT_CLOSE.length,
      inner: reply.slice(innerStart, closeAt),
    };
    from = last.end;
  }
  return last;
}

/** Достаёт последний финальный промпт на русском из ответа модели. */
export function extractProposedPrompt(reply: string): string | null {
  const block = findLastPromptBlock(reply);
  return block ? sanitizeProposedPrompt(block.inner) : null;
}

export function stripProposedBlock(reply: string): string {
  const open = escapeRegExp(PROPOSED_PROMPT_OPEN);
  const close = escapeRegExp(PROPOSED_PROMPT_CLOSE);
  return reply
    .replace(new RegExp(`${open}[\\s\\S]*?${close}`, "g"), "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isAssembleConsent(
  messages: DialogLine[],
  ready: boolean,
): boolean {
  const lastUser = lastContent(messages, "user").trim();
  if (!lastUser || CANCEL_RE.test(lastUser)) return false;
  const hadProposal = messages.some(
    (line) => line.role === "assistant" && extractProposedPrompt(line.content),
  );
  if (hadProposal) return true;
  if (!ready) return false;
  if (wantsToProceed(lastUser)) return true;
  if (!AFFIRM_RE.test(lastUser)) return false;
  return ASSEMBLE_ASK_RE.test(lastContent(messages, "assistant"));
}

export function buildAssembleBrief(): string {
  return [
    "## Сборка финального промпта",
    "Пользователь согласился собрать промпт. Новых уточняющих вопросов не задавай.",
    "Выведи ровно один блок с маркерами и связный промпт только на русском.",
    "Внутри — готовое описание результата со всеми деталями диалога, без перевода.",
    "Вне блока — одна короткая фраза: можно подтвердить, отредактировать или отменить.",
  ].join("\n");
}

export const ASSEMBLE_RETRY_NOTE = [
  "Предыдущий ответ без маркеров. Выведи сейчас ровно один блок",
  `${PROPOSED_PROMPT_OPEN} … ${PROPOSED_PROMPT_CLOSE}`,
  "с финальным промптом на русском. Вне блока — одна короткая фраза.",
].join(" ");

export const ASSEMBLE_VISIBLE_FALLBACK =
  "Финальный промпт на русском готов. Можно подтвердить, отредактировать или отменить.";

/** Запасной промпт из реплик пользователя, если модель не вернула маркеры. */
export function assembleFallbackPrompt(
  messages: DialogLine[],
  contentType: AgentContentType,
): string {
  const bits = messages
    .filter((line) => line.role === "user")
    .map((line) => line.content.trim())
    .filter((text) => text.length >= 8 && !SKIP_FALLBACK_RE.test(text))
    .filter((text) => !wantsToProceed(text));
  const body = bits.join(" ").replace(/\s+/g, " ").trim();
  const core = body || "по описанию из диалога";
  return `Сгенерировать ${KIND_RU[contentType]}: ${core}`.slice(
    0,
    MAX_PROMPT_LENGTH,
  );
}

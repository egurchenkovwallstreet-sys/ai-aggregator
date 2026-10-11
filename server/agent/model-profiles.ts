import "server-only";

import type { AgentContentType } from "./dialog.schema";

/** Профили адаптации промпта (задача 3.7). */
export type ModelProfileId = "nano-banana" | "veo" | "midjourney";

export type ResolvedModelProfile = {
  id: ModelProfileId;
  label: string;
};

function normalizeModelLabel(targetModel: string): string {
  return targetModel
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchNanoBanana(normalized: string): boolean {
  return /nano\s*banana|nanobanana/.test(normalized);
}

function matchVeo(normalized: string): boolean {
  return /\bveo\b/.test(normalized);
}

function matchMidjourney(normalized: string): boolean {
  return /midjourney|\bmj\b|мидджорни/.test(normalized);
}

/** Сопоставляет имя модели из UI/API с профилем адаптации. */
export function resolveModelProfile(
  targetModel: string | undefined,
  contentType: AgentContentType,
): ResolvedModelProfile | null {
  if (!targetModel?.trim()) return null;

  const normalized = normalizeModelLabel(targetModel);
  const label = targetModel.trim();

  if (matchNanoBanana(normalized)) {
    return contentType === "image" ? { id: "nano-banana", label } : null;
  }
  if (matchVeo(normalized)) {
    return contentType === "video" ? { id: "veo", label } : null;
  }
  if (matchMidjourney(normalized)) {
    return contentType === "image" ? { id: "midjourney", label } : null;
  }

  return null;
}

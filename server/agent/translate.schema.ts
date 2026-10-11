import { z } from "zod";

import { contentTypeSchema } from "./dialog.schema";

const TARGET_MODEL_FALLBACK = "не выбрана";

export const promptTranslateRequestSchema = z.object({
  contentType: contentTypeSchema,
  /** Исходные реплики пользователя до финального промпта (голос/текст). */
  rawInput: z.string().trim().min(1).max(16_000),
  finalPromptRu: z.string().trim().min(12).max(4_000),
  targetModel: z.string().trim().min(1).max(120).optional(),
});

export function resolveTargetModelForDb(targetModel?: string): string {
  return targetModel?.trim() || TARGET_MODEL_FALLBACK;
}

export type PromptTranslateRequest = z.infer<
  typeof promptTranslateRequestSchema
>;

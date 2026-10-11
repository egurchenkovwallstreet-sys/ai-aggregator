import "server-only";

import { query } from "@/server/db";

export type SaveUserPromptInput = {
  userId: string;
  rawInput: string;
  finalPromptRu: string;
  finalPromptEn: string;
  targetModel: string;
};

/** Запись подтверждённого промпта в таблицу prompts (SPEC §5, задача 3.8). */
export async function saveUserPrompt(
  input: SaveUserPromptInput,
): Promise<string> {
  const result = await query<{ id: string }>(
    `INSERT INTO prompts (
       user_id,
       raw_input,
       final_prompt_ru,
       final_prompt_en,
       target_model
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      input.userId,
      input.rawInput,
      input.finalPromptRu,
      input.finalPromptEn,
      input.targetModel,
    ],
  );

  const id = result.rows[0]?.id;
  if (!id) {
    throw new Error("Не удалось сохранить промпт.");
  }

  return id;
}

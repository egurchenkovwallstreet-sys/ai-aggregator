import "server-only";

/** Маркеры финального промпта на русском (парсинг в задачах 3.4–3.5). */
export const PROPOSED_PROMPT_OPEN = "[[PROPOSED_PROMPT]]";
export const PROPOSED_PROMPT_CLOSE = "[[/PROPOSED_PROMPT]]";

/** Маркеры перевода под модель (задача 3.6). */
export const TRANSLATED_PROMPT_OPEN = "[[TRANSLATED_PROMPT]]";
export const TRANSLATED_PROMPT_CLOSE = "[[/TRANSLATED_PROMPT]]";

/** Маркеры адаптации под конкретную модель (задача 3.7). */
export const ADAPTED_PROMPT_OPEN = "[[ADAPTED_PROMPT]]";
export const ADAPTED_PROMPT_CLOSE = "[[/ADAPTED_PROMPT]]";

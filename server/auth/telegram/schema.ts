import { z } from "zod";

/** Поля, которые может прислать Telegram Login Widget. */
export const telegramLoginSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    auth_date: z.coerce.number().int().positive(),
    hash: z.string().min(1),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    username: z.string().optional(),
    photo_url: z.string().url().optional(),
  })
  .passthrough();

export type TelegramLoginInput = z.infer<typeof telegramLoginSchema>;

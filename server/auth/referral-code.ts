import "server-only";

import { randomBytes } from "node:crypto";

import { query } from "@/server/db";

/** Уникальный реферальный код для нового пользователя. */
export async function generateReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomBytes(5).toString("hex");
    const existing = await query(
      "SELECT 1 FROM users WHERE referral_code = $1",
      [code],
    );
    if ((existing.rowCount ?? 0) === 0) {
      return code;
    }
  }
  throw new Error("Не удалось сгенерировать уникальный referral_code.");
}

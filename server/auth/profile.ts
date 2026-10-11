import "server-only";

import { getDefaultFreeGenerations } from "./config";
import { query } from "@/server/db";

export type ProfileData = {
  id: string;
  email: string | null;
  telegramId: number | null;
  deviceId: string | null;
  credits: number;
  freeGenerationsLeft: number;
  freeGenerationsTotal: number;
  referralCode: string;
};

export async function getProfileByUserId(
  userId: string,
): Promise<ProfileData | null> {
  const result = await query<{
    id: string;
    email: string | null;
    telegram_id: number | null;
    device_id: string | null;
    credits: number;
    free_generations_left: number;
    referral_code: string;
  }>(
    `SELECT id, email, telegram_id, device_id, credits, free_generations_left, referral_code
     FROM users WHERE id = $1`,
    [userId],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    telegramId: row.telegram_id,
    deviceId: row.device_id,
    credits: row.credits,
    freeGenerationsLeft: row.free_generations_left,
    freeGenerationsTotal: getDefaultFreeGenerations(),
    referralCode: row.referral_code,
  };
}

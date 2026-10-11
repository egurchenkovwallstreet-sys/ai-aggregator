import "server-only";

import { getDefaultFreeGenerations } from "./config";
import { generateReferralCode } from "./referral-code";
import { query } from "@/server/db";

export type AuthUser = {
  id: string;
  email: string | null;
  telegramId: number | null;
  deviceId: string | null;
  credits: number;
  freeGenerationsLeft: number;
};

type UserRow = {
  id: string;
  email: string | null;
  telegram_id: number | null;
  device_id: string | null;
  credits: number;
  free_generations_left: number;
};

function mapUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    telegramId: row.telegram_id,
    deviceId: row.device_id,
    credits: row.credits,
    freeGenerationsLeft: row.free_generations_left,
  };
}

const USER_SELECT =
  "SELECT id, email, telegram_id, device_id, credits, free_generations_left FROM users";

/** Находит пользователя по email или создаёт нового. */
export async function findOrCreateUserByEmail(
  email: string,
): Promise<AuthUser> {
  const normalized = email.trim().toLowerCase();
  const existing = await query<UserRow>(`${USER_SELECT} WHERE email = $1`, [
    normalized,
  ]);

  if (existing.rows[0]) {
    return mapUser(existing.rows[0]);
  }

  const referralCode = await generateReferralCode();
  const freeLeft = getDefaultFreeGenerations();
  const inserted = await query<UserRow>(
    `INSERT INTO users (email, referral_code, free_generations_left)
     VALUES ($1, $2, $3)
     RETURNING id, email, telegram_id, device_id, credits, free_generations_left`,
    [normalized, referralCode, freeLeft],
  );

  const row = inserted.rows[0];
  if (!row) {
    throw new Error("Не удалось создать пользователя.");
  }
  return mapUser(row);
}

/** Находит пользователя по Telegram ID или создаёт нового. */
export async function findOrCreateUserByTelegramId(
  telegramId: number,
): Promise<AuthUser> {
  const existing = await query<UserRow>(
    `${USER_SELECT} WHERE telegram_id = $1`,
    [telegramId],
  );

  if (existing.rows[0]) {
    return mapUser(existing.rows[0]);
  }

  const referralCode = await generateReferralCode();
  const freeLeft = getDefaultFreeGenerations();
  const inserted = await query<UserRow>(
    `INSERT INTO users (telegram_id, referral_code, free_generations_left)
     VALUES ($1, $2, $3)
     RETURNING id, email, telegram_id, device_id, credits, free_generations_left`,
    [telegramId, referralCode, freeLeft],
  );

  const row = inserted.rows[0];
  if (!row) {
    throw new Error("Не удалось создать пользователя.");
  }
  return mapUser(row);
}

/** Анонимный пользователь по идентификатору устройства (cookie). */
export async function findOrCreateUserByDeviceId(
  deviceId: string,
): Promise<AuthUser> {
  const existing = await query<UserRow>(`${USER_SELECT} WHERE device_id = $1`, [
    deviceId,
  ]);

  if (existing.rows[0]) {
    return mapUser(existing.rows[0]);
  }

  const referralCode = await generateReferralCode();
  const freeLeft = getDefaultFreeGenerations();
  const inserted = await query<UserRow>(
    `INSERT INTO users (device_id, referral_code, free_generations_left)
     VALUES ($1, $2, $3)
     RETURNING id, email, telegram_id, device_id, credits, free_generations_left`,
    [deviceId, referralCode, freeLeft],
  );

  const row = inserted.rows[0];
  if (!row) {
    throw new Error("Не удалось создать анонимного пользователя.");
  }
  return mapUser(row);
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const result = await query<UserRow>(`${USER_SELECT} WHERE id = $1`, [userId]);
  const row = result.rows[0];
  return row ? mapUser(row) : null;
}

import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Максимальный возраст данных от Telegram Login Widget (сек). */
const MAX_AUTH_AGE_SEC = 86_400;

export type TelegramLoginPayload = Record<string, string | number> & {
  id: number;
  auth_date: number;
  hash: string;
};

function buildDataCheckString(data: Record<string, string | number>): string {
  return Object.keys(data)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");
}

/** Проверка подписи Telegram (https://core.telegram.org/widgets/login). */
export function verifyTelegramLogin(
  payload: TelegramLoginPayload,
  botToken: string,
): boolean {
  const nowSec = Math.floor(Date.now() / 1000);
  if (nowSec - payload.auth_date > MAX_AUTH_AGE_SEC) {
    return false;
  }

  const { hash, ...fields } = payload;
  const dataCheckString = buildDataCheckString(fields);
  const secretKey = createHash("sha256").update(botToken).digest();
  const expectedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  try {
    const a = Buffer.from(expectedHash, "hex");
    const b = Buffer.from(hash, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

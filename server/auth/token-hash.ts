import "server-only";

import { createHash, randomBytes } from "node:crypto";

/** Сырой одноразовый токен для ссылки (не хранить в БД). */
export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 для поиска токена в БД без хранения plaintext. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

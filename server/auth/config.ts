import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} не задан (см. .env.example).`);
  }
  return value;
}

export function getAuthSecret(): string {
  return requireEnv("AUTH_SECRET");
}

export function getMagicLinkTtlSec(): number {
  const raw = process.env.AUTH_MAGIC_LINK_TTL_SEC?.trim() ?? "900";
  const ttl = Number.parseInt(raw, 10);
  if (!Number.isFinite(ttl) || ttl < 60 || ttl > 86_400) {
    return 900;
  }
  return ttl;
}

export function getAppBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function getTelegramBotToken(): string {
  return requireEnv("TELEGRAM_BOT_TOKEN");
}

export function getDefaultFreeGenerations(): number {
  const raw = process.env.FREE_GENERATIONS_DEFAULT?.trim() ?? "3";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 3;
}

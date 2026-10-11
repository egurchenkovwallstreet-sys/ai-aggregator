import "server-only";

/** URL подключения к PostgreSQL из окружения (см. .env.example). */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL не задан. Скопируйте .env.example в .env.local и укажите строку подключения.",
    );
  }
  return url;
}

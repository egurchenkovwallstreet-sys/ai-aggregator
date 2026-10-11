import { ensureVisitorUser } from "@/server/auth/ensure-visitor";

/** Серверный bootstrap анонимного пользователя (без UI). */
export async function VisitorBootstrap() {
  try {
    await ensureVisitorUser();
  } catch {
    // БД недоступна — страница всё равно откроется, генерации потребуют auth позже.
  }
  return null;
}

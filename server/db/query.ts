import "server-only";

import type { QueryResult, QueryResultRow } from "pg";

import { getPool } from "./pool";

/** Параметризованный запрос к PostgreSQL ($1, $2, …). */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}

/** Проверка доступности БД (SELECT 1). */
export async function pingDatabase(): Promise<boolean> {
  const result = await query<{ ok: number }>("SELECT 1 AS ok");
  return result.rows[0]?.ok === 1;
}

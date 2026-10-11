import "server-only";

import { Pool } from "pg";

import { getDatabaseUrl } from "./config";

declare global {
  var __pgPool: Pool | undefined;
}

/** Singleton-пул для Next.js (переиспользование в dev при hot reload). */
export function getPool(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return global.__pgPool;
}

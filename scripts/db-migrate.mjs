import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import pg from "pg";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

dotenv.config({ path: path.join(projectRoot, ".env.production.local") });
dotenv.config({ path: path.join(projectRoot, ".env.local") });
dotenv.config({ path: path.join(projectRoot, ".env") });

const { Pool } = pg;

const MIGRATIONS_DIR = path.join(projectRoot, "migrations");

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedFilenames(client) {
  const result = await client.query(
    "SELECT filename FROM schema_migrations ORDER BY filename",
  );
  return new Set(result.rows.map((row) => row.filename));
}

async function listMigrationFiles() {
  const entries = await readdir(MIGRATIONS_DIR);
  return entries.filter((name) => name.endsWith(".sql")).sort();
}

async function run() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    console.error(
      "DATABASE_URL не задан. Укажите его в .env.local (см. .env.example).",
    );
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedFilenames(client);
    const files = await listMigrationFiles();

    if (files.length === 0) {
      console.log("Миграций не найдено в migrations/.");
      return;
    }

    let count = 0;
    for (const filename of files) {
      if (applied.has(filename)) {
        continue;
      }

      const sql = await readFile(path.join(MIGRATIONS_DIR, filename), "utf8");
      console.log(`Применяю ${filename}…`);

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [filename],
        );
        await client.query("COMMIT");
        count += 1;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    if (count === 0) {
      console.log("База актуальна, новых миграций нет.");
    } else {
      console.log(`Готово: применено миграций — ${count}.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error("Ошибка миграции:", error);
  process.exit(1);
});

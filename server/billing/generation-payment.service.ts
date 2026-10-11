import "server-only";

import type { PoolClient } from "pg";

import { withTransaction } from "@/server/db/transaction";

import type {
  GenerationQuotaPreview,
  GenerationSpendRecord,
  GenerationSpendResult,
} from "./generation-payment.types";

type UserBalanceRow = {
  credits: number;
  free_generations_left: number;
};

async function lockUserBalance(
  client: PoolClient,
  userId: string,
): Promise<UserBalanceRow | null> {
  const result = await client.query<UserBalanceRow>(
    `SELECT credits, free_generations_left
     FROM users
     WHERE id = $1
     FOR UPDATE`,
    [userId],
  );
  return result.rows[0] ?? null;
}

/** Предпросмотр: бесплатная генерация или списание кредитов. */
export async function previewGenerationPayment(
  userId: string,
  costCredits: number,
): Promise<GenerationQuotaPreview | null> {
  if (costCredits < 0) {
    throw new Error("costCredits не может быть отрицательным.");
  }

  return withTransaction(async (client) => {
    const row = await lockUserBalance(client, userId);
    if (!row) {
      return null;
    }

    if (row.free_generations_left > 0) {
      return {
        freeGenerationsLeft: row.free_generations_left,
        credits: row.credits,
        costCredits,
        willUse: "free",
        canProceed: true,
      };
    }

    return {
      freeGenerationsLeft: 0,
      credits: row.credits,
      costCredits,
      willUse: "credits",
      canProceed: row.credits >= costCredits,
    };
  });
}

/**
 * Списание за генерацию: сначала бесплатные попытки, затем кредиты.
 * Вызывать только после успешной постановки задачи генерации (или в одной TX с ней позже).
 */
export async function spendForGeneration(
  userId: string,
  costCredits: number,
): Promise<GenerationSpendResult> {
  if (costCredits < 0) {
    throw new Error("costCredits не может быть отрицательным.");
  }

  return withTransaction(async (client) => {
    const row = await lockUserBalance(client, userId);
    if (!row) {
      return {
        ok: false,
        reason: "insufficient",
        freeGenerationsLeft: 0,
        credits: 0,
        costCredits,
      };
    }

    if (row.free_generations_left > 0) {
      const updated = await client.query<{ free_generations_left: number }>(
        `UPDATE users
         SET free_generations_left = free_generations_left - 1
         WHERE id = $1
         RETURNING free_generations_left`,
        [userId],
      );
      const freeLeft = updated.rows[0]?.free_generations_left ?? 0;
      return {
        ok: true,
        source: "free",
        freeGenerationsLeft: freeLeft,
        costCredits: 0,
      };
    }

    if (row.credits < costCredits) {
      return {
        ok: false,
        reason: "insufficient",
        freeGenerationsLeft: row.free_generations_left,
        credits: row.credits,
        costCredits,
      };
    }

    const updated = await client.query<{
      credits: number;
      free_generations_left: number;
    }>(
      `UPDATE users
       SET credits = credits - $2
       WHERE id = $1
       RETURNING credits, free_generations_left`,
      [userId, costCredits],
    );
    const balance = updated.rows[0];
    if (!balance) {
      throw new Error("Не удалось списать кредиты.");
    }

    return {
      ok: true,
      source: "credits",
      freeGenerationsLeft: balance.free_generations_left,
      costCredits,
      creditsLeft: balance.credits,
    };
  });
}

/** Возврат при технической ошибке генерации (SPEC: авто-возврат). */
export async function refundGenerationSpend(
  userId: string,
  record: GenerationSpendRecord,
): Promise<void> {
  await withTransaction(async (client) => {
    const locked = await lockUserBalance(client, userId);
    if (!locked) {
      throw new Error("Пользователь не найден.");
    }

    if (record.source === "free") {
      await client.query(
        `UPDATE users SET free_generations_left = free_generations_left + 1 WHERE id = $1`,
        [userId],
      );
      return;
    }

    await client.query(
      `UPDATE users SET credits = credits + $2 WHERE id = $1`,
      [userId, record.amount],
    );
  });
}

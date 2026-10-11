"use client";

import { useEffect, useState } from "react";

export type QuotaPreview = {
  displayPrice: number;
  willUse: "free" | "credits";
  freeGenerationsLeft: number;
  canProceed: boolean;
};

export function useGenerationQuota(costCredits: number) {
  const [quota, setQuota] = useState<QuotaPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/user/generation-quota?cost=${costCredits}`)
      .then(async (response) => {
        const data = (await response.json()) as QuotaPreview & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Не удалось получить квоту.");
        }
        if (!cancelled) setQuota(data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setQuota(null);
          setError(cause instanceof Error ? cause.message : "Ошибка квоты.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [costCredits]);

  return { quota, error };
}

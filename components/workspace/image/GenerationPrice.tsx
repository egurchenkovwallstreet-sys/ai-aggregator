"use client";

import { formatPriceRub } from "@/lib/catalog/format-price";
import { useGenerationQuota } from "@/lib/workspace/use-generation-quota";

type GenerationPriceProps = {
  priceRub: number;
  costCredits: number;
};

/** Цена до генерации + бесплатные попытки (этап 7.2). */
export function GenerationPrice({
  priceRub,
  costCredits,
}: GenerationPriceProps) {
  const { quota, error } = useGenerationQuota(costCredits);

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-sm font-medium text-zinc-900">
        Стоимость: {formatPriceRub(priceRub)}
      </p>
      {quota ? (
        <p className="mt-1 text-sm text-zinc-600">
          {quota.willUse === "free"
            ? `Списание: бесплатная генерация (осталось ${quota.freeGenerationsLeft})`
            : `Списание: ${quota.displayPrice} кред.`}
          {!quota.canProceed && quota.willUse === "credits" ? (
            <span className="block text-amber-800">Недостаточно кредитов.</span>
          ) : null}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs text-zinc-500">
          Квота: {error} (обновите страницу или войдите).
        </p>
      ) : null}
    </div>
  );
}

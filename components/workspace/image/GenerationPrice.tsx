"use client";

import Link from "next/link";

import { formatPriceRub } from "@/lib/catalog/format-price";
import { useGenerationQuota } from "@/lib/workspace/use-generation-quota";

type GenerationPriceProps = {
  priceRub: number;
  costCredits: number;
};

/** Цена до генерации + бесплатные попытки. */
export function GenerationPrice({
  priceRub,
  costCredits,
}: GenerationPriceProps) {
  const { quota, error } = useGenerationQuota(costCredits);

  return (
    <div className="rounded-2xl bg-apple-bg px-4 py-3 sm:text-right">
      <p className="text-sm text-apple-text-secondary">Стоимость</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-apple-text">
        {formatPriceRub(priceRub)}
      </p>
      {quota ? (
        <p className="mt-2 text-sm leading-relaxed text-apple-text-body">
          {quota.willUse === "free"
            ? `Бесплатная генерация · осталось ${quota.freeGenerationsLeft}`
            : `Списание ${quota.displayPrice} кред.`}
          {!quota.canProceed && quota.willUse === "credits" ? (
            <span className="mt-1 block text-[#ff9500]">
              Недостаточно кредитов
            </span>
          ) : null}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs leading-relaxed text-apple-text-tertiary">
          {error}. Обновите страницу или{" "}
          <Link href="/login" className="text-apple-accent hover:underline">
            войдите
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}

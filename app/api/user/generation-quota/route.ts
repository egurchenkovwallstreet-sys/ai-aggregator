import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth/get-current-user";
import { previewGenerationPayment } from "@/server/billing/generation-payment.service";

function parseCostCredits(raw: string | null): number | null {
  if (raw == null || raw.trim() === "") {
    return 0;
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Требуется авторизация." },
      { status: 401 },
    );
  }

  const costCredits = parseCostCredits(
    request.nextUrl.searchParams.get("cost"),
  );
  if (costCredits === null) {
    return NextResponse.json(
      { error: "Некорректный параметр cost." },
      { status: 400 },
    );
  }

  const preview = await previewGenerationPayment(user.id, costCredits);
  if (!preview) {
    return NextResponse.json(
      { error: "Пользователь не найден." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    freeGenerationsLeft: preview.freeGenerationsLeft,
    credits: preview.credits,
    costCredits: preview.costCredits,
    willUse: preview.willUse,
    canProceed: preview.canProceed,
    displayPrice: preview.willUse === "free" ? 0 : preview.costCredits,
  });
}

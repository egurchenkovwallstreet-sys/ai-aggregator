import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth/get-current-user";
import { getVoiceConfig } from "@/server/voice/config";
import { fetchVoiceGatewayHealth } from "@/server/voice/gateway-health";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Требуется сессия. Обновите страницу или войдите." },
      { status: 401 },
    );
  }

  const config = getVoiceConfig();
  const gateway = await fetchVoiceGatewayHealth();

  return NextResponse.json({
    config: {
      provider: config.provider,
      gatewayUrl: config.gatewayUrl,
      sttUrl: config.sttUrl,
      ttsUrl: config.ttsUrl,
    },
    gateway,
  });
}

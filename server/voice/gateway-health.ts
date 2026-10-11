import "server-only";

import { getVoiceConfig } from "./config";

export type VoiceGatewayHealth = {
  reachable: boolean;
  ok: boolean;
  provider: string;
  stt: { ready?: boolean; model?: string; error?: string | null };
  tts: { ready?: boolean; voice?: string; error?: string | null };
  error?: string;
};

type GatewayHealthJson = {
  ok?: boolean;
  provider?: string;
  stt?: VoiceGatewayHealth["stt"];
  tts?: VoiceGatewayHealth["tts"];
};

/** Проверка GET /health локального voice-gateway. */
export async function fetchVoiceGatewayHealth(): Promise<VoiceGatewayHealth> {
  const { healthUrl, provider } = getVoiceConfig();

  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      return {
        reachable: true,
        ok: false,
        provider,
        stt: {},
        tts: {},
        error: `Шлюз ответил ${response.status}.`,
      };
    }

    const data = (await response.json()) as GatewayHealthJson;
    return {
      reachable: true,
      ok: Boolean(data.ok),
      provider: data.provider ?? provider,
      stt: data.stt ?? {},
      tts: data.tts ?? {},
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось связаться с шлюзом.";
    return {
      reachable: false,
      ok: false,
      provider,
      stt: {},
      tts: {},
      error: message,
    };
  }
}

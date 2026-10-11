import "server-only";

export type VoiceProvider = "voicy" | "openocto" | "gateway";

export type VoiceConfig = {
  provider: VoiceProvider;
  gatewayUrl: string;
  sttUrl: string;
  ttsUrl: string;
  healthUrl: string;
};

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function deriveGatewayUrl(sttUrl: string): string {
  if (sttUrl.endsWith("/stt")) {
    return trimSlash(sttUrl.slice(0, -"/stt".length));
  }
  return trimSlash(sttUrl);
}

function parseProvider(raw: string | undefined): VoiceProvider {
  if (raw === "openocto" || raw === "gateway" || raw === "voicy") {
    return raw;
  }
  return "voicy";
}

/** Конфиг локального STT/TTS из env (задача 4.1). */
export function getVoiceConfig(): VoiceConfig {
  const sttUrl =
    process.env.VOICE_STT_URL?.trim() || "http://localhost:8080/stt";
  const ttsUrl =
    process.env.VOICE_TTS_URL?.trim() || "http://localhost:8080/tts";
  const gatewayUrl = trimSlash(
    process.env.VOICE_GATEWAY_URL?.trim() || deriveGatewayUrl(sttUrl),
  );

  return {
    provider: parseProvider(process.env.VOICE_PROVIDER),
    gatewayUrl,
    sttUrl,
    ttsUrl,
    healthUrl: `${gatewayUrl}/health`,
  };
}

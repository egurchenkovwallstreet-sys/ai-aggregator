import "server-only";

export type ProvodConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export function getProvodConfig(): ProvodConfig {
  const apiKey = process.env.PROVOD_AI_API_KEY?.trim();
  const baseUrl =
    process.env.PROVOD_AI_BASE_URL?.trim() ?? "https://api.provod.ai/v1";
  const model = process.env.AGENT_MODEL?.trim();

  if (!apiKey) {
    throw new Error("PROVOD_AI_API_KEY не задан.");
  }
  if (!model) {
    throw new Error("AGENT_MODEL не задан.");
  }

  return { apiKey, baseUrl: baseUrl.replace(/\/$/, ""), model };
}

import "server-only";

export type GenerationSpendResult =
  | {
      ok: true;
      source: "free";
      freeGenerationsLeft: number;
      costCredits: 0;
    }
  | {
      ok: true;
      source: "credits";
      freeGenerationsLeft: number;
      costCredits: number;
      creditsLeft: number;
    }
  | {
      ok: false;
      reason: "insufficient";
      freeGenerationsLeft: number;
      credits: number;
      costCredits: number;
    };

export type GenerationSpendRecord =
  { source: "free" } | { source: "credits"; amount: number };

export type GenerationQuotaPreview = {
  freeGenerationsLeft: number;
  credits: number;
  costCredits: number;
  willUse: "free" | "credits";
  canProceed: boolean;
};

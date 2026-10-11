/** Модели для демо `/agent/preview` (задача 3.7). */
export const DEMO_MODEL_OPTIONS = [
  {
    id: "nano-banana-2",
    label: "Nano Banana 2 (1K)",
    contentType: "image" as const,
    targetModel: "Nano Banana 2 (1K)",
  },
  {
    id: "midjourney",
    label: "Midjourney",
    contentType: "image" as const,
    targetModel: "Midjourney",
  },
  {
    id: "veo-lite",
    label: "Veo 3.1 Lite",
    contentType: "video" as const,
    targetModel: "Veo 3.1 Lite",
  },
] as const;

export type DemoModelOption = (typeof DEMO_MODEL_OPTIONS)[number];

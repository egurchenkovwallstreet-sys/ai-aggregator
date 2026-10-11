/** Модели изображений и цены для UI (SPEC §3, задача 7.2). */
export type ImageModelOption = {
  id: string;
  label: string;
  priceRub: number;
  targetModel: string;
};

export const IMAGE_MODELS: ImageModelOption[] = [
  {
    id: "recraft-flash",
    label: "Recraft V4.1 Flash",
    priceRub: 4.6,
    targetModel: "Recraft V4.1 Flash",
  },
  {
    id: "flux-klein",
    label: "FLUX.2 [klein]",
    priceRub: 6.0,
    targetModel: "FLUX.2 klein",
  },
  {
    id: "ideogram-turbo",
    label: "Ideogram 4.0 Turbo",
    priceRub: 8.5,
    targetModel: "Ideogram 4.0 Turbo",
  },
  {
    id: "nano-lite",
    label: "Nano Banana 2 Lite",
    priceRub: 9.8,
    targetModel: "Nano Banana 2 Lite",
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    priceRub: 11.2,
    targetModel: "GPT Image 2",
  },
  {
    id: "nano-2-1k",
    label: "Nano Banana 2 (1K)",
    priceRub: 15.6,
    targetModel: "Nano Banana 2 (1K)",
  },
  {
    id: "nano-pro-4k",
    label: "Nano Banana Pro (4K)",
    priceRub: 32.9,
    targetModel: "Nano Banana Pro (4K)",
  },
];

export function getImageModelById(id: string): ImageModelOption | undefined {
  return IMAGE_MODELS.find((model) => model.id === id);
}

/** Кредиты для API квоты (1 кредит ≈ 1 ₽, округление вверх). */
export function creditsForModelPrice(priceRub: number): number {
  return Math.max(1, Math.ceil(priceRub));
}

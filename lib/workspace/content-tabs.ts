/** Вкладки главного экрана (SPEC §1, задача 7.1). */
export type ContentTabId = "image" | "video" | "audio" | "text";

export type ContentTabDefinition = {
  id: ContentTabId;
  label: string;
  headline: string;
  description: string;
};

export const CONTENT_TABS: ContentTabDefinition[] = [
  {
    id: "image",
    label: "Изображения",
    headline: "Генерация изображений",
    description:
      "Выбор модели, диалог с агентом, голос или текст, цена до генерации и результат в галерее.",
  },
  {
    id: "video",
    label: "Видео",
    headline: "Генерация видео",
    description:
      "Короткие ролики: Veo, Kling, Runway и другие модели из прайса SPEC.",
  },
  {
    id: "audio",
    label: "Музыка",
    headline: "Генерация музыки",
    description:
      "Треки и звук по описанию: жанр, темп, настроение — через того же AI-агента.",
  },
  {
    id: "text",
    label: "Текст",
    headline: "Генерация текста",
    description:
      "Чат с моделями для статей, писем и сценариев — отдельный режим вкладки «Текст».",
  },
];

export function isContentTabId(value: string): value is ContentTabId {
  return CONTENT_TABS.some((tab) => tab.id === value);
}

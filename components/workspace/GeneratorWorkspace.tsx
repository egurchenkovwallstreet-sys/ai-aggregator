"use client";

import { useCallback, useState, type KeyboardEvent } from "react";

import { ContentTabBar } from "@/components/workspace/ContentTabBar";
import { ImageGenerationPanel } from "@/components/workspace/image/ImageGenerationPanel";
import { TabPanelStub } from "@/components/workspace/TabPanelStub";
import {
  CONTENT_TABS,
  type ContentTabId,
  isContentTabId,
} from "@/lib/workspace/content-tabs";

function useTabKeyboard(
  activeId: ContentTabId,
  setActiveId: (id: ContentTabId) => void,
) {
  return useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const index = CONTENT_TABS.findIndex((tab) => tab.id === activeId);
      if (index === -1) return;

      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % CONTENT_TABS.length;
      if (event.key === "ArrowLeft") {
        next = (index - 1 + CONTENT_TABS.length) % CONTENT_TABS.length;
      }
      if (next !== index) {
        event.preventDefault();
        setActiveId(CONTENT_TABS[next].id);
      }
    },
    [activeId, setActiveId],
  );
}

/** Главный экран с четырьмя вкладками (задача 7.1, заглушки контента). */
export function GeneratorWorkspace() {
  const [activeId, setActiveId] = useState<ContentTabId>("image");
  const onKeyDown = useTabKeyboard(activeId, setActiveId);

  const activeTab =
    CONTENT_TABS.find((tab) => tab.id === activeId) ?? CONTENT_TABS[0];

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
        Четыре режима генерации в одном сервисе. Сейчас — макет вкладок;
        подключение нейросетей и оплаты добавим на этапах 5–6.
      </p>
      <div className="mt-6" onKeyDown={onKeyDown}>
        <ContentTabBar
          tabs={CONTENT_TABS}
          activeId={activeId}
          onChange={(id) => {
            if (isContentTabId(id)) setActiveId(id);
          }}
        />
        <div className="mt-4">
          {activeId === "image" ? (
            <ImageGenerationPanel key="image-panel" />
          ) : (
            <TabPanelStub tab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}

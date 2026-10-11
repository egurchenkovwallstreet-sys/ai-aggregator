"use client";

import type {
  ContentTabDefinition,
  ContentTabId,
} from "@/lib/workspace/content-tabs";

type ContentTabBarProps = {
  tabs: ContentTabDefinition[];
  activeId: ContentTabId;
  onChange: (id: ContentTabId) => void;
};

/** Сегментированный переключатель вкладок (Apple pill). */
export function ContentTabBar({
  tabs,
  activeId,
  onChange,
}: ContentTabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Тип контента"
      className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-full bg-apple-track p-1"
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-[background-color,box-shadow,color] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-accent sm:px-5 ${
              selected
                ? "bg-apple-surface text-apple-text shadow-[var(--apple-shadow-card)]"
                : "text-apple-text-secondary hover:text-apple-text"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

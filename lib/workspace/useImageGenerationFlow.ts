"use client";

import { useCallback, useState } from "react";

import { postAgentDialog, type DialogMessage } from "@/lib/agent/dialog-client";
import { buildRawInputFromMessages } from "@/lib/agent/raw-input";
import { translateConfirmedPrompt } from "@/lib/agent/translate-prompt-client";
import type { ImageModelOption } from "@/lib/catalog/image-models";

export function useImageGenerationFlow(model: ImageModelOption) {
  const [messages, setMessages] = useState<DialogMessage[]>([]);
  const [agentBusy, setAgentBusy] = useState(false);
  const [proposedPrompt, setProposedPrompt] = useState<string | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [promptForApi, setPromptForApi] = useState<string | null>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendUserMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || agentBusy) return;

      const nextMessages: DialogMessage[] = [
        ...messages,
        { role: "user", content: trimmed },
      ];
      setMessages(nextMessages);
      setAgentBusy(true);
      setError(null);
      setProposedPrompt(null);
      setPromptForApi(null);
      setResultVisible(false);

      try {
        const response = await postAgentDialog({
          contentType: "image",
          messages: nextMessages,
          targetModel: model.targetModel,
        });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.reply },
        ]);
        if (response.proposedPrompt) {
          setProposedPrompt(response.proposedPrompt);
        }
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Не удалось отправить.",
        );
      } finally {
        setAgentBusy(false);
      }
    },
    [agentBusy, messages, model.targetModel],
  );

  const confirmPrompt = useCallback(
    async (finalRu: string) => {
      setConfirmBusy(true);
      setError(null);
      try {
        const rawInput = buildRawInputFromMessages(messages);
        const translated = await translateConfirmedPrompt({
          contentType: "image",
          rawInput: rawInput || finalRu,
          finalPromptRu: finalRu,
          targetModel: model.targetModel,
        });
        setPromptForApi(translated.promptForModel);
        setProposedPrompt(null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Ошибка перевода.");
      } finally {
        setConfirmBusy(false);
      }
    },
    [messages, model.targetModel],
  );

  const runGenerateStub = useCallback(() => {
    if (!promptForApi) return;
    setResultVisible(true);
  }, [promptForApi]);

  const resetFlow = useCallback(() => {
    setMessages([]);
    setProposedPrompt(null);
    setPromptForApi(null);
    setResultVisible(false);
    setError(null);
  }, []);

  return {
    messages,
    agentBusy,
    proposedPrompt,
    confirmBusy,
    promptForApi,
    resultVisible,
    error,
    sendUserMessage,
    confirmPrompt,
    runGenerateStub,
    resetFlow,
    cancelProposed: () => setProposedPrompt(null),
  };
}

import "server-only";

import { createChatCompletion } from "@/server/ai/provod-chat";
import type { ChatMessage } from "@/server/ai/chat-types";

import {
  analyzeClarification,
  buildClarificationBrief,
  type ClarificationSlot,
} from "./clarification";
import type { AgentDialogRequest } from "./dialog.schema";
import {
  ASSEMBLE_RETRY_NOTE,
  ASSEMBLE_VISIBLE_FALLBACK,
  assembleFallbackPrompt,
  buildAssembleBrief,
  extractProposedPrompt,
  isAssembleConsent,
  stripProposedBlock,
} from "./proposed-prompt";
import { buildAgentSystemPrompt } from "./system-prompt";

export type AgentDialogPhase = "clarifying" | "ready" | "proposed";

export type AgentDialogResult = {
  reply: string;
  phase: AgentDialogPhase;
  clarification: {
    filled: ClarificationSlot[];
    missing: ClarificationSlot[];
    nextQuestions: string[];
  };
  proposedPrompt: string | null;
};

function toChatMessages(
  systemPrompt: string,
  input: AgentDialogRequest,
): ChatMessage[] {
  return [
    { role: "system", content: systemPrompt },
    ...input.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];
}

function acceptProposed(
  reply: string,
  consent: boolean,
  ready: boolean,
): string | null {
  const extracted = extractProposedPrompt(reply);
  if (!extracted) return null;
  return consent || ready ? extracted : null;
}

async function resolveProposedReply(
  input: AgentDialogRequest,
  systemPrompt: string,
  firstReply: string,
  consent: boolean,
  ready: boolean,
): Promise<{ reply: string; proposedPrompt: string | null }> {
  let reply = firstReply;
  let proposed = acceptProposed(reply, consent, ready);

  if (consent && !proposed) {
    reply = await createChatCompletion([
      { role: "system", content: `${systemPrompt}\n\n${ASSEMBLE_RETRY_NOTE}` },
      ...input.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ]);
    proposed = acceptProposed(reply, true, true);
  }

  if (consent && !proposed) {
    proposed = assembleFallbackPrompt(input.messages, input.contentType);
    reply = ASSEMBLE_VISIBLE_FALLBACK;
  }

  if (!proposed) {
    return { reply: stripProposedBlock(reply) || reply, proposedPrompt: null };
  }

  return {
    reply: stripProposedBlock(reply) || ASSEMBLE_VISIBLE_FALLBACK,
    proposedPrompt: proposed,
  };
}

export async function runAgentDialog(
  input: AgentDialogRequest,
): Promise<AgentDialogResult> {
  const clarification = analyzeClarification(input.messages, input.contentType);
  const consent = isAssembleConsent(input.messages, clarification.ready);
  const brief = consent
    ? buildAssembleBrief()
    : buildClarificationBrief(clarification);
  const systemPrompt = buildAgentSystemPrompt(
    input.contentType,
    input.targetModel,
    brief,
  );

  const firstReply = await createChatCompletion(
    toChatMessages(systemPrompt, input),
  );
  const resolved = await resolveProposedReply(
    input,
    systemPrompt,
    firstReply,
    consent,
    clarification.ready,
  );

  return {
    reply: resolved.reply,
    phase: resolved.proposedPrompt
      ? "proposed"
      : clarification.ready
        ? "ready"
        : "clarifying",
    clarification: {
      filled: clarification.filled,
      missing: clarification.missing,
      nextQuestions: clarification.nextQuestions,
    },
    proposedPrompt: resolved.proposedPrompt,
  };
}

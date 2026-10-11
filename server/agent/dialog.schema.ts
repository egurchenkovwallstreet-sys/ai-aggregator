import { z } from "zod";

export const contentTypeSchema = z.enum(["image", "video", "audio", "text"]);

export const dialogMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(8_000),
});

export const agentDialogRequestSchema = z.object({
  contentType: contentTypeSchema,
  targetModel: z.string().trim().min(1).max(120).optional(),
  messages: z.array(dialogMessageSchema).min(1).max(40),
});

export type AgentDialogRequest = z.infer<typeof agentDialogRequestSchema>;
export type AgentContentType = z.infer<typeof contentTypeSchema>;

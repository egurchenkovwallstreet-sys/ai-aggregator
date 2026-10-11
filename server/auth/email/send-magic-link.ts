import "server-only";

import { createMailTransport } from "./transport";

export async function sendMagicLinkEmail(
  to: string,
  linkUrl: string,
): Promise<void> {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new Error("EMAIL_FROM не задан.");
  }

  const transport = createMailTransport();
  const ttlMin = Math.round(
    Number.parseInt(process.env.AUTH_MAGIC_LINK_TTL_SEC?.trim() ?? "900", 10) /
      60,
  );

  await transport.sendMail({
    from,
    to,
    subject: "Вход в AI-агрегатор",
    text: [
      "Здравствуйте!",
      "",
      "Перейдите по ссылке, чтобы войти:",
      linkUrl,
      "",
      `Ссылка действует около ${ttlMin} мин. Если вы не запрашивали вход, проигнорируйте письмо.`,
    ].join("\n"),
  });
}

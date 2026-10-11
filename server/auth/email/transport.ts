import "server-only";

import nodemailer from "nodemailer";

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim());
}

export function assertSmtpConfigured(): void {
  if (!smtpConfigured()) {
    throw new Error("SMTP не настроен. Заполните SMTP_* в .env.local.");
  }
}

export function createMailTransport() {
  assertSmtpConfigured();
  const port = Number.parseInt(process.env.SMTP_PORT?.trim() ?? "587", 10);
  const secure = process.env.SMTP_SECURE?.trim() === "true";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.isFinite(port) ? port : 587,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

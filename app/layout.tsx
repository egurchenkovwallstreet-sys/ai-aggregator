import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";

import { VisitorBootstrap } from "@/components/auth/VisitorBootstrap";

import "./globals.css";

/** Inter + кириллица — ровная типографика на Windows (Geist без cyrillic). */
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI-агрегатор",
    template: "%s · AI-агрегатор",
  },
  description:
    "Генерация изображений, видео, музыки и текста через нейросети. Оплата в рублях.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-apple-bg font-sans text-apple-text">
        <Suspense fallback={null}>
          <VisitorBootstrap />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

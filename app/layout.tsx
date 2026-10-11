import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { VisitorBootstrap } from "@/components/auth/VisitorBootstrap";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <VisitorBootstrap />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

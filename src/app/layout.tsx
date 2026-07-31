import { Manrope, Source_Serif_4 } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "AI-тренажёр собеседований",
  description:
    "Тренировка ответов на собеседовании для школьников с строгой оценкой через OpenAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${sourceSerif.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}

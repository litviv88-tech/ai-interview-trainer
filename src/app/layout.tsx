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
  title: "Тренажёр для школьника",
  description:
    "AI-тренажёр собеседований для школьников 5–11 классов со строгой оценкой ответов",
};

const themeBootScript = `
(function () {
  try {
    var key = "ai-interview-trainer-theme-v1";
    var saved = localStorage.getItem(key);
    var theme = saved === "light" || saved === "dark"
      ? saved
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${sourceSerif.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}

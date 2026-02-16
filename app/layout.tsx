import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "聖書表示アプリ",
  description: "礼拝用・聖書箇所の全画面表示",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`antialiased ${notoSansJP.variable}`}>
        {children}
      </body>
    </html>
  );
}

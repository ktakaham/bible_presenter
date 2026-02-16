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
  title: "聖書表示アプリ | Bible Presenter",
  description:
    "礼拝・集会で御言葉を大きく表示。登録した聖書箇所を全画面で映し、前後切り替えも簡単。ブラウザだけで使える聖書表示アプリです。",
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

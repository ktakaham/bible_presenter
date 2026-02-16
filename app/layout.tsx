import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  openGraph: {
    title: "聖書表示アプリ | Bible Presenter",
    description:
      "説教用PPTの準備、大変じゃないですか？聖書アプリからコピペするだけで御言葉をきれいに映せます。データはブラウザ内のみ。",
    type: "website",
    images: [{ url: "/ogp.jpeg", width: 1200, height: 630, alt: "Bible Presenter - 御言葉を大きく読みやすく" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "聖書表示アプリ | Bible Presenter",
    description:
      "説教用PPTの準備が大変な方へ。コピペで御言葉を全画面表示。ブラウザだけで使える。",
    images: ["/ogp.jpeg"],
  },
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
        <Analytics />
      </body>
    </html>
  );
}

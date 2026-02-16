import { NextResponse } from "next/server";
import path from "path";
import { katakanaToHiragana } from "@/lib/kana";

type Tokenizer = import("kuromoji").Tokenizer;

let tokenizerCache: Tokenizer | null = null;

async function getTokenizer(): Promise<Tokenizer> {
  if (tokenizerCache) return tokenizerCache;
  const kuromoji = await import("kuromoji");
  const dicPath = path.join(process.cwd(), "node_modules", "kuromoji", "dict");
  const tokenizer = await new Promise<Tokenizer>((resolve, reject) => {
    kuromoji.builder({ dicPath }).build((err: Error | null, t: Tokenizer) => {
      if (err) reject(err);
      else resolve(t);
    });
  });
  tokenizerCache = tokenizer;
  return tokenizer;
}

/**
 * 日本語テキストにルビ記法「漢字《かんじ》」を自動付与
 * kuromoji でトークン化し、読みを取得して《》で挿入
 */
export async function POST(request: Request) {
  try {
    const { text } = (await request.json()) as { text?: string };
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "text を送信してください" },
        { status: 400 }
      );
    }

    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text);
    const result: string[] = [];

    for (const t of tokens) {
      const surface = t.surface_form;
      const reading = t.reading ?? t.pronunciation ?? "";
      const hasKanji = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(surface);
      if (hasKanji && reading) {
        const hiragana = katakanaToHiragana(reading);
        result.push(`${surface}《${hiragana}》`);
      } else {
        result.push(surface);
      }
    }

    const output = result.join("");
    return NextResponse.json({ text: output });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "ルビの付与に失敗しました" },
      { status: 500 }
    );
  }
}

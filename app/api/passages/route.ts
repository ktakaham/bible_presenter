import { NextResponse } from "next/server";
import { readPassages, addPassage } from "@/lib/file-store";
import { createPassagePayload } from "@/lib/data";
import { parseBibleInput } from "@/lib/parser";

export async function GET() {
  try {
    const passages = await readPassages();
    return NextResponse.json(passages);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { book, chapterInput, versesText } = body as {
      book: string;
      chapterInput: string;
      versesText: string;
    };
    const parsed = parseBibleInput(book, chapterInput ?? "", versesText ?? "");
    const passage = createPassagePayload(
      parsed.book,
      parsed.chapter,
      parsed.verses
    );
    await addPassage(passage);
    return NextResponse.json(passage);
  } catch (e) {
    const message = e instanceof Error ? e.message : "登録に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

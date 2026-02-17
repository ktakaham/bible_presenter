import { NextResponse } from "next/server";
import { saveShareData } from "@/lib/share-storage";
import type { BiblePassage } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const passages = body.passages as BiblePassage[] | undefined;

    if (!Array.isArray(passages) || passages.length === 0) {
      return NextResponse.json(
        { error: "御言葉データが必要です" },
        { status: 400 }
      );
    }

    const shareId = await saveShareData(passages);

    return NextResponse.json({ id: shareId });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "共有リンクの生成に失敗しました" },
      { status: 500 }
    );
  }
}

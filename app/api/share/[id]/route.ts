import { NextResponse } from "next/server";
import { getShareData } from "@/lib/share-storage";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    }

    const data = await getShareData(id);
    if (!data) {
      return NextResponse.json(
        { error: "共有データが見つかりません" },
        { status: 404 }
      );
    }

    // デバッグ用: データ構造を確認
    if (!data.passages || !Array.isArray(data.passages)) {
      console.error("Invalid share data structure:", data);
      return NextResponse.json(
        { error: "データ形式が不正です" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

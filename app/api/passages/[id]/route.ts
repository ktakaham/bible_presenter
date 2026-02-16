import { NextResponse } from "next/server";
import { readPassages, deletePassage } from "@/lib/file-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const passages = await readPassages();
    const passage = passages.find((p) => p.id === id) ?? null;
    if (!passage) {
      return NextResponse.json(
        { error: "指定された聖書箇所が見つかりません" },
        { status: 404 }
      );
    }
    return NextResponse.json(passage);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePassage(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}

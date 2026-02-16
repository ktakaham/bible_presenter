import type { BiblePassage } from "@/types";

/**
 * 新規IDを生成（UUID風で衝突しにくく）
 */
function generateId(): string {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 新規聖書箇所の payload を作成
 * API Route や将来の SQLite 層の両方で利用可能
 */
export function createPassagePayload(
  book: string,
  chapter: number,
  verses: { number: number; text: string }[]
): BiblePassage {
  return {
    id: generateId(),
    book,
    chapter,
    verses,
    createdAt: new Date().toISOString(),
  };
}

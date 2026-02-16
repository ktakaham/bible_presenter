/**
 * 登録した御言葉を localStorage で完全にクライアント保存するためのユーティリティ。
 * 「use client」コンポーネント内でのみ使用すること。
 */
import type { BiblePassage, BiblePassageStore } from "@/types";

const STORAGE_KEY = "bible-passages";

function readRaw(): BiblePassage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: BiblePassageStore = JSON.parse(raw);
    return data.passages ?? [];
  } catch {
    return [];
  }
}

/** 登録済みの全御言葉を取得 */
export function getPassages(): BiblePassage[] {
  return readRaw();
}

/** 全御言葉を上書き保存 */
export function setPassages(passages: BiblePassage[]): void {
  if (typeof window === "undefined") return;
  const data: BiblePassageStore = { passages };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** ID で御言葉を1件取得 */
export function getPassageById(id: string): BiblePassage | null {
  const passages = readRaw();
  return passages.find((p) => p.id === id) ?? null;
}

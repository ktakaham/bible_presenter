import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { BiblePassage, BiblePassageStore } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bible-passages.json");

/**
 * 登録データはサーバーの data/bible-passages.json に保存
 * 将来: SQLite や DB クライアントに差し替え可能
 */
export async function readPassages(): Promise<BiblePassage[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    const data: BiblePassageStore = JSON.parse(raw);
    return data.passages ?? [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

export async function writePassages(passages: BiblePassage[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const data: BiblePassageStore = { passages };
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getPassageById(
  id: string
): Promise<BiblePassage | null> {
  const passages = await readPassages();
  return passages.find((p) => p.id === id) ?? null;
}

export async function addPassage(passage: BiblePassage): Promise<BiblePassage[]> {
  const passages = await readPassages();
  passages.push(passage);
  await writePassages(passages);
  return passages;
}

export async function deletePassage(id: string): Promise<BiblePassage[]> {
  const passages = await readPassages();
  const next = passages.filter((p) => p.id !== id);
  await writePassages(next);
  return next;
}

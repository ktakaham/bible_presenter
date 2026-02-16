import type { BibleVerse } from "@/types";

/**
 * 管理画面の入力テキストをパースする
 *
 * 入力例：
 * 歴代誌 第一
 * 4章
 * 1,ユダの子は、ペレツ、ヘツロン、カルミ、フル、ショバル。
 * 2,ショバルの子レアヤはヤハテを生み、ヤハテはアフマイとラハデを生んだ。これらはツォルア人の諸氏族である。
 */
export function parseBibleInput(
  book: string,
  chapterInput: string,
  versesText: string
): { book: string; chapter: number; verses: BibleVerse[] } {
  const trimmedBook = book.trim();
  if (!trimmedBook) {
    throw new Error("書名を入力してください");
  }

  // 「4章」や「4」から章番号を抽出
  const chapterMatch = chapterInput.trim().match(/^(\d+)/);
  const chapter = chapterMatch ? parseInt(chapterMatch[1], 10) : 0;
  if (isNaN(chapter) || chapter < 1) {
    throw new Error("有効な章番号を入力してください（例: 4章）");
  }

  const verses: BibleVerse[] = [];
  const lines = versesText
    .trim()
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    // 「1,テキスト」形式：カンマは最初の1つのみで区切る
    const commaIndex = line.indexOf(",");
    if (commaIndex === -1) {
      throw new Error(`節の形式が不正です（番号,テキスト）：${line}`);
    }
    const numStr = line.slice(0, commaIndex).trim();
    const text = line.slice(commaIndex + 1).trim();
    const number = parseInt(numStr, 10);
    if (isNaN(number) || number < 1) {
      throw new Error(`節番号が不正です：${numStr}`);
    }
    verses.push({ number, text });
  }

  if (verses.length === 0) {
    throw new Error("少なくとも1節を入力してください");
  }

  return { book: trimmedBook, chapter, verses };
}

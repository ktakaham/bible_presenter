/**
 * 聖書の1節
 */
export interface BibleVerse {
  number: number;
  text: string;
}

/**
 * 1章分の聖書箇所（将来の複数章対応を見据えた単位）
 */
export interface BiblePassage {
  id: string;
  book: string;
  chapter: number;
  verses: BibleVerse[];
  /** 登録日時（将来SQLite用） */
  createdAt?: string;
}

/**
 * ストレージ全体の型（JSON / 将来SQLiteのスキーマに合わせる）
 */
export interface BiblePassageStore {
  passages: BiblePassage[];
}

/**
 * 管理画面の入力フォーム用（パース前）
 */
export interface BiblePassageFormInput {
  book: string;
  chapterInput: string;
  versesText: string;
}

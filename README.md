# 聖書表示アプリ（礼拝用）

事前に登録した聖書箇所をクリックするだけで、サブディスプレイ（プロジェクター）に全画面表示できる Web アプリです。

## 技術構成

- Next.js 14（App Router）
- TypeScript
- Tailwind CSS
- データ: ローカル JSON（`data/bible-passages.json`）

## 使い方

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開き、**管理画面へ** から `/admin` に進みます。

### 管理画面（/admin）

1. **書名** … 例: `歴代誌 第一`
2. **章** … 例: `4章`
3. **節** … 1行に「節番号,テキスト」で複数行入力  
   例:
   ```
   1,ユダの子は、ペレツ、ヘツロン、カルミ、フル、ショバル。
   2,ショバルの子レアヤはヤハテを生み、
   ```
4. **登録** で保存し、一覧に表示されます。
5. カードをクリックすると **表示画面**（`/display/[id]`）に遷移します。

### 表示画面（/display/[id]）

- 黒背景・白文字・大きなフォントで1節ずつ表示
- **← / →** … 前の節 / 次の節
- **F** … フルスクリーン切替
- **Esc** … フルスクリーン解除、または管理画面に戻る

プロジェクター用には、表示画面をサブディスプレイに移し、F でフルスクリーンにして使用してください。

## ディレクトリ構成

```
app/
  page.tsx           # トップ（管理画面へのリンク）
  admin/page.tsx     # 管理画面（登録・一覧・カードクリックで表示へ）
  display/[id]/      # 表示画面（全画面・節送り・フルスクリーン）
  api/passages/      # GET 一覧, POST 追加
  api/passages/[id]/ # GET 1件
data/
  bible-passages.json # 登録データ（API から読み書き）
lib/
  file-store.ts      # JSON 読み書き（将来 SQLite に差し替え可能）
  data.ts            # createPassagePayload 等
  parser.ts          # 入力テキストのパース
types/
  index.ts           # BiblePassage, BibleVerse 等
```

## 将来の拡張

- **複数章**: `BiblePassage` の配列や `chapters: { number, verses }[]` で拡張しやすい型になっています。
- **SQLite**: `lib/file-store.ts` の `readPassages` / `writePassages` / `addPassage` / `getPassageById` を DB クライアントに差し替えるだけで対応できます。
# bible_presenter

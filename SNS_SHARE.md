# SNS共有用の説明文

アプリをSNSでシェアするときに使えるテキストです。用途に合わせてコピーしてご利用ください。

**課題の切り口**: 説教用のPPT準備が大変 → コピペだけで御言葉をきれいに映せる

---

## 短め（Twitter・X・LINE など）

```
説教用のPPT、準備大変じゃないですか？
聖書表示アプリ Bible Presenter なら、聖書アプリから章をコピーして貼り付けるだけ。データはブラウザ内のみ。プロジェクター表示に。
```

---

## 標準（Facebook・ブログ・紹介文）

```
説教用のPPT、御言葉のスライドを1節ずつ作るの、大変じゃないですか？

【聖書表示アプリ Bible Presenter】は、その課題に応えるウェブアプリです。

・聖書 新改訳アプリなどから章をコピー＆貼り付けで登録
・表示用ウィンドウをプロジェクターやモニターに映して使用
・前後ボタンや矢印キーでスムーズに切り替え
・データはサーバーに送らず、お使いのブラウザ内だけに保存

PPTの代わりに、ブラウザだけで御言葉をきれいに映せます。
```

---

## ひとこと（ハッシュタグ付き）

```
説教用PPTの準備、大変な方へ。コピペで御言葉を全画面表示できるアプリ #聖書 #礼拝 #教会 #説教
```

---

## 英語用（短め）

```
Preparing sermon slides is a lot of work. Bible Presenter lets you copy & paste from your Bible app and display verses on screen—no PPT, no install. Data stays in your browser only.
```

---

## リンクプレビューについて

`app/layout.tsx` に Open Graph と Twitter Card のメタデータを設定済みです。アプリのURLをシェアすると、タイトルと説明文がプレビューに表示されます。

OG画像（`og:image`）を設定すると、SNSでより目立つカードになります。画像を用意した場合は、`layout.tsx` の `openGraph` に `images: [{ url: '/ogp.jpeg' }]` などを追加してください。

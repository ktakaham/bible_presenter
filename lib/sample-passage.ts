import type { BiblePassage } from "@/types";

/** 初回表示用サンプル（詩篇 23篇） */
export const SAMPLE_PASSAGE: BiblePassage = {
  id: "sample-psalm-23",
  book: "詩篇",
  chapter: 23,
  createdAt: "2020-01-01T00:00:00.000Z",
  verses: [
    { number: 1, text: "主は私の羊飼い。私は乏しいことがありません。" },
    { number: 2, text: "主は私を緑の牧場に伏させいこいのみぎわに伴われます。" },
    { number: 3, text: "主は私のたましいを生き返らせ御名のゆえに私を義の道に導かれます。" },
    { number: 4, text: "たとえ死の陰の谷を歩むとしても私はわざわいを恐れません。あなたがともにおられますから。あなたのむちとあなたの杖それが私の慰めです。" },
    { number: 5, text: "私の敵をよそにあなたは私の前に食卓を整え頭に香油を注いでくださいます。私の杯はあふれています。" },
    { number: 6, text: "まことに私のいのちの日の限りいつくしみと恵みが私を追って来るでしょう。私はいつまでも主の家に住まいます。" },
  ],
};

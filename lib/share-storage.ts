/**
 * 共有リンク用の一時保存（Upstash Redis使用）
 * 環境変数: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */

import type { BiblePassage } from "@/types";

declare global {
  // eslint-disable-next-line no-var
  var shareCache: Map<string, ShareData> | undefined;
}

const TTL_SECONDS = 30 * 24 * 60 * 60; // 30日間（1ヶ月）

export interface ShareData {
  passages: BiblePassage[];
  createdAt: string;
}

/**
 * 共有データを保存してIDを返す
 */
export async function saveShareData(
  passages: BiblePassage[]
): Promise<string> {
  const id = generateShareId();
  const data: ShareData = {
    passages,
    createdAt: new Date().toISOString(),
  };

  // Upstash Redisが設定されている場合
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    // Upstash Redis REST API: POSTでコマンド配列を送信
    const value = JSON.stringify(data);
    const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "SET",
        id,
        value,
        "EX",
        TTL_SECONDS.toString(),
      ]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upstash Redis SET error:", errorText);
      throw new Error("共有データの保存に失敗しました");
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
  } else {
    // 開発環境: メモリに保存（サーバー再起動で消える）
    if (typeof globalThis.shareCache === "undefined") {
      globalThis.shareCache = new Map<string, ShareData>();
    }
    (globalThis.shareCache as Map<string, ShareData>).set(id, data);
  }

  return id;
}

/**
 * 共有データを取得
 */
export async function getShareData(id: string): Promise<ShareData | null> {
  // Upstash Redisが設定されている場合
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    // Upstash Redis REST API: POSTでコマンド配列を送信
    const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["GET", id]),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    if (result.error || !result.result) {
      return null;
    }

    // result.result は文字列なので、JSON.parse でパース
    try {
      return JSON.parse(result.result) as ShareData;
    } catch {
      return null;
    }
  } else {
    // 開発環境: メモリから取得
    if (typeof globalThis.shareCache === "undefined") {
      return null;
    }
    return (
      (globalThis.shareCache as Map<string, ShareData>).get(id) ?? null
    );
  }
}

/**
 * 共有IDを生成（ランダム文字列）
 */
function generateShareId(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

"use client";

import { getPassages, setPassages } from "@/lib/passage-storage-client";
import type { BiblePassage } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SharePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShareData = async () => {
      try {
        const res = await fetch(`/api/share/${params.id}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "共有データが見つかりません");
        }

        const shareData = await res.json();
        const passages = shareData.passages as BiblePassage[];

        if (!Array.isArray(passages) || passages.length === 0) {
          throw new Error("有効なデータがありません");
        }

        // localStorageに保存
        setPassages(passages);

        // 管理画面にリダイレクト
        router.push("/admin");
      } catch (e) {
        setError(e instanceof Error ? e.message : "読み込みに失敗しました");
        setLoading(false);
      }
    };

    loadShareData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800 mx-auto mb-4"></div>
          <p className="text-stone-600">共有データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-stone-800 mb-2">
            エラー
          </h1>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700"
          >
            管理画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return null;
}

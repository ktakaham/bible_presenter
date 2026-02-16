"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPassages, getPassageById } from "@/lib/passage-storage-client";
import type { BiblePassage } from "@/types";
import DisplayClient from "./DisplayClient";

export default function DisplayPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string | undefined;
  const v = searchParams?.get("v") ?? undefined;

  const [passage, setPassage] = useState<BiblePassage | null | undefined>(
    undefined
  );
  const [prevId, setPrevId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setPassage(null);
      return;
    }
    const all = getPassages();
    const p = getPassageById(id);
    setPassage(p ?? null);
    if (p) {
      const ids = all.map((x) => x.id);
      const idx = ids.indexOf(id);
      setPrevId(idx > 0 ? ids[idx - 1]! : null);
      setNextId(
        idx >= 0 && idx < ids.length - 1 ? ids[idx + 1]! : null
      );
    }
  }, [id]);

  if (passage === undefined) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/60">読み込み中…</p>
      </div>
    );
  }

  if (passage === null) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white/80">指定された御言葉が見つかりません</p>
        <Link
          href="/display"
          className="text-white/60 hover:text-white underline"
        >
          表示トップへ
        </Link>
      </div>
    );
  }

  const initialVerseIndex =
    v != null ? Math.max(0, parseInt(v, 10) - 1) : undefined;

  return (
    <DisplayClient
      passage={passage}
      passageId={id}
      initialVerseIndex={initialVerseIndex}
      prevId={prevId}
      nextId={nextId}
    />
  );
}

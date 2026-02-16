"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getBroadcastChannel,
  type BroadcastMessage,
} from "@/lib/broadcast";

export default function DisplayPlaceholder() {
  const router = useRouter();

  useEffect(() => {
    const ch = getBroadcastChannel();
    if (!ch) return;

    const handler = (e: MessageEvent<BroadcastMessage>) => {
      const msg = e.data;
      if (msg?.type === "SHOW_VERSE" || msg?.type === "GO_TO_PASSAGE") {
        const v = msg.verseIndex ?? 0;
        const path =
          v > 0
            ? `/display/${msg.passageId}?v=${v + 1}`
            : `/display/${msg.passageId}`;
        router.push(path);
      }
    };

    ch.addEventListener("message", handler);
    return () => ch.removeEventListener("message", handler);
  }, [router]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      <p className="text-white/60 text-lg">
        管理画面で聖書箇所・節を選んでください
      </p>
    </div>
  );
}

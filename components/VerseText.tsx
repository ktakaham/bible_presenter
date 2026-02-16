"use client";

import { parseRuby } from "@/lib/ruby";

interface VerseTextProps {
  text: string;
  className?: string;
}

/**
 * 節テキストを表示。ルビ記法「漢字《かんじ》」を <ruby> で描画
 */
export function VerseText({ text, className }: VerseTextProps) {
  const parts = parseRuby(text);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.type === "ruby" ? (
          <ruby key={i} className="ruby">
            {p.base}
            <rt className="text-[0.4em]">{p.rt}</rt>
          </ruby>
        ) : (
          <span key={i}>{p.value}</span>
        )
      )}
    </span>
  );
}

/**
 * ルビ記法「漢字《かんじ》」をパースする
 * 例: 彼《かれ》は言《い》った → 「彼」にルビ「かれ」、「言」にルビ「い」
 */

export type RubyPart =
  | { type: "ruby"; base: string; rt: string }
  | { type: "text"; value: string };

/**
 * テキストをルビ付き部分と通常テキストに分割
 * パターン: 文字列《読み》→ 直後の《》の直前の連続文字を base、括弧内を rt とする
 */
export function parseRuby(text: string): RubyPart[] {
  const result: RubyPart[] = [];
  const re = /([^\s《]+)《([^》]*)》/g;
  let lastEnd = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastEnd) {
      result.push({ type: "text", value: text.slice(lastEnd, m.index) });
    }
    result.push({ type: "ruby", base: m[1]!, rt: m[2]! });
    lastEnd = m.index + m[0].length;
  }
  if (lastEnd < text.length) {
    result.push({ type: "text", value: text.slice(lastEnd) });
  }
  return result.length ? result : [{ type: "text", value: text }];
}

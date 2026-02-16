/** カタカナ → ひらがな */
export function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30a0-\u30ff]/g, (ch) => {
    const code = ch.charCodeAt(0);
    return String.fromCharCode(code - 0x60);
  });
}

/** 表示画面の設定を localStorage で永続化 */

const KEY_FONT_SCALE = "bible-display-font-scale";
const KEY_THEME = "bible-display-theme";
const KEY_ASPECT_RATIO = "bible-display-aspect-ratio";
const KEY_FONT_FAMILY = "bible-display-font-family";
const KEY_LINE_HEIGHT = "bible-display-line-height";
const KEY_TEXT_ALIGN = "bible-display-text-align";
const KEY_VERTICAL_ALIGN = "bible-display-vertical-align";

export type DisplayTheme =
  | "dark"
  | "light"
  | "navy"
  | "forest"
  | "wine"
  | "sepia";

const DISPLAY_THEMES: DisplayTheme[] = [
  "dark",
  "light",
  "navy",
  "forest",
  "wine",
  "sepia",
];

/** 表示比率 */
export type AspectRatioId = "19:6" | "4:3" | "16:9";

/** フォント倍率 0.5 ～ 2.0（基準は 6vw） */
const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const DEFAULT_SCALE = 1;

/** 行間 1.0 ～ 2.5 */
const MIN_LINE_HEIGHT = 1;
const MAX_LINE_HEIGHT = 2.5;
const DEFAULT_LINE_HEIGHT = 1.6;

const ASPECT_RATIOS: AspectRatioId[] = ["19:6", "4:3", "16:9"];
const DEFAULT_ASPECT_RATIO: AspectRatioId = "16:9";

export type FontFamilyId =
  | "sans"
  | "serif"
  | "mincho"
  | "gothic"
  | "notoSans";

/** 御言葉の配置（横） */
export type TextAlignId = "left" | "center";
const TEXT_ALIGN_IDS: TextAlignId[] = ["left", "center"];
const DEFAULT_TEXT_ALIGN: TextAlignId = "left";

/** 御言葉の配置（縦） */
export type VerticalAlignId = "top" | "middle" | "bottom";
const VERTICAL_ALIGN_IDS: VerticalAlignId[] = ["top", "middle", "bottom"];
const DEFAULT_VERTICAL_ALIGN: VerticalAlignId = "middle";

const FONT_FAMILIES: FontFamilyId[] = ["sans", "serif", "mincho", "gothic", "notoSans"];
const DEFAULT_FONT_FAMILY: FontFamilyId = "sans";

export function getStoredFontScale(): number {
  if (typeof window === "undefined") return DEFAULT_SCALE;
  const v = parseFloat(localStorage.getItem(KEY_FONT_SCALE) ?? "");
  if (Number.isFinite(v)) return Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));
  return DEFAULT_SCALE;
}

export function setStoredFontScale(scale: number): void {
  const v = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
  localStorage.setItem(KEY_FONT_SCALE, String(v));
}

export function getStoredTheme(): DisplayTheme {
  if (typeof window === "undefined") return "dark";
  const v = localStorage.getItem(KEY_THEME);
  if (DISPLAY_THEMES.includes(v as DisplayTheme)) return v as DisplayTheme;
  return "dark";
}

export function setStoredTheme(theme: DisplayTheme): void {
  localStorage.setItem(KEY_THEME, theme);
}

export function getStoredAspectRatio(): AspectRatioId {
  if (typeof window === "undefined") return DEFAULT_ASPECT_RATIO;
  const v = localStorage.getItem(KEY_ASPECT_RATIO);
  if (v === "19:6" || v === "4:3" || v === "16:9") return v;
  return DEFAULT_ASPECT_RATIO;
}

export function setStoredAspectRatio(ratio: AspectRatioId): void {
  localStorage.setItem(KEY_ASPECT_RATIO, ratio);
}

export function getStoredFontFamily(): FontFamilyId {
  if (typeof window === "undefined") return DEFAULT_FONT_FAMILY;
  const v = localStorage.getItem(KEY_FONT_FAMILY);
  if (FONT_FAMILIES.includes(v as FontFamilyId)) return v as FontFamilyId;
  return DEFAULT_FONT_FAMILY;
}

export function setStoredFontFamily(font: FontFamilyId): void {
  localStorage.setItem(KEY_FONT_FAMILY, font);
}

export function getStoredLineHeight(): number {
  if (typeof window === "undefined") return DEFAULT_LINE_HEIGHT;
  const v = parseFloat(localStorage.getItem(KEY_LINE_HEIGHT) ?? "");
  if (Number.isFinite(v))
    return Math.min(MAX_LINE_HEIGHT, Math.max(MIN_LINE_HEIGHT, v));
  return DEFAULT_LINE_HEIGHT;
}

export function setStoredLineHeight(value: number): void {
  const v = Math.min(MAX_LINE_HEIGHT, Math.max(MIN_LINE_HEIGHT, value));
  localStorage.setItem(KEY_LINE_HEIGHT, String(v));
}

export function getStoredTextAlign(): TextAlignId {
  if (typeof window === "undefined") return DEFAULT_TEXT_ALIGN;
  const v = localStorage.getItem(KEY_TEXT_ALIGN);
  if (v === "left" || v === "center") return v;
  return DEFAULT_TEXT_ALIGN;
}

export function setStoredTextAlign(align: TextAlignId): void {
  localStorage.setItem(KEY_TEXT_ALIGN, align);
}

export function getStoredVerticalAlign(): VerticalAlignId {
  if (typeof window === "undefined") return DEFAULT_VERTICAL_ALIGN;
  const v = localStorage.getItem(KEY_VERTICAL_ALIGN);
  if (v === "top" || v === "middle" || v === "bottom") return v;
  return DEFAULT_VERTICAL_ALIGN;
}

export function setStoredVerticalAlign(align: VerticalAlignId): void {
  localStorage.setItem(KEY_VERTICAL_ALIGN, align);
}

/** CSS用: 比率を aspect-ratio の分数に */
export function aspectRatioToCss(ratio: AspectRatioId): string {
  const map: Record<AspectRatioId, string> = {
    "19:6": "19 / 6",
    "4:3": "4 / 3",
    "16:9": "16 / 9",
  };
  return map[ratio];
}

/** CSS用: フォントファミリー */
export function fontFamilyToCss(font: FontFamilyId): string {
  const map: Record<FontFamilyId, string> = {
    sans: "sans-serif",
    serif: "serif",
    mincho: '"Hiragino Mincho ProN", "Yu Mincho", serif',
    gothic: '"Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    notoSans: 'var(--font-noto-sans-jp), "Noto Sans JP", sans-serif',
  };
  return map[font];
}

export {
  MIN_SCALE,
  MAX_SCALE,
  DEFAULT_SCALE,
  MIN_LINE_HEIGHT,
  MAX_LINE_HEIGHT,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_FONT_FAMILY,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_VERTICAL_ALIGN,
  ASPECT_RATIOS,
  FONT_FAMILIES,
  TEXT_ALIGN_IDS,
  VERTICAL_ALIGN_IDS,
  DISPLAY_THEMES,
};

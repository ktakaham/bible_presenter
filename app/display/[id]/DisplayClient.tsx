"use client";

import { VerseText } from "@/components/VerseText";
import {
  getBroadcastChannel,
  sendBlackoutState,
  sendCurrentState,
  type BroadcastMessage,
} from "@/lib/broadcast";
import {
  DEFAULT_ASPECT_RATIO,
  DEFAULT_FONT_FAMILY,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_SCALE,
  DEFAULT_TEXT_ALIGN,
  fontFamilyToCss,
  getStoredAspectRatio,
  getStoredFontFamily,
  getStoredFontScale,
  getStoredLineHeight,
  getStoredTheme,
  getStoredTextAlign,
  getStoredVerticalAlign,
  MAX_LINE_HEIGHT,
  MAX_SCALE,
  MIN_LINE_HEIGHT,
  MIN_SCALE,
  setStoredAspectRatio,
  setStoredFontFamily,
  setStoredFontScale,
  setStoredLineHeight,
  setStoredTheme,
  setStoredTextAlign,
  setStoredVerticalAlign,
  type AspectRatioId,
  type DisplayTheme,
  type FontFamilyId,
  type TextAlignId,
  type VerticalAlignId,
} from "@/lib/display-settings";
import type { BiblePassage } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/** テーマごとの背景・文字・フッター用クラス（Tailwind JIT用に完全な文字列で定義） */
const THEME_PALETTE: Record<
  DisplayTheme,
  { bg: string; text: string; muted: string; footer: string; isDark: boolean }
> = {
  dark: {
    bg: "bg-black",
    text: "text-white",
    muted: "text-white/80",
    footer: "text-white/40",
    isDark: true,
  },
  light: {
    bg: "bg-stone-100",
    text: "text-stone-900",
    muted: "text-stone-600",
    footer: "text-stone-400",
    isDark: false,
  },
  navy: {
    bg: "bg-[#0f172a]",
    text: "text-[#f1f5f9]",
    muted: "text-[#94a3b8]",
    footer: "text-[#64748b]",
    isDark: true,
  },
  forest: {
    bg: "bg-[#0f2e1a]",
    text: "text-[#ecfdf5]",
    muted: "text-[#a7f3d0]",
    footer: "text-[#059669]",
    isDark: true,
  },
  wine: {
    bg: "bg-[#451a1a]",
    text: "text-[#fff1f2]",
    muted: "text-[#fecdd3]",
    footer: "text-[#be123c]",
    isDark: true,
  },
  sepia: {
    bg: "bg-[#f5f0e6]",
    text: "text-[#292524]",
    muted: "text-[#78716c]",
    footer: "text-[#57534e]",
    isDark: false,
  },
};

interface DisplayClientProps {
  passage: BiblePassage;
  passageId: string;
  initialVerseIndex?: number;
  prevId: string | null;
  nextId: string | null;
}

export default function DisplayClient({
  passage,
  passageId,
  initialVerseIndex = 0,
  prevId,
  nextId,
}: DisplayClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(
      Math.max(0, initialVerseIndex),
      Math.max(0, passage.verses.length - 1)
    )
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBlackout, setIsBlackout] = useState(false);
  const [fontScale, setFontScaleState] = useState(DEFAULT_SCALE);
  const [theme, setThemeState] = useState<DisplayTheme>("dark");
  const [aspectRatio, setAspectRatioState] = useState<AspectRatioId>(DEFAULT_ASPECT_RATIO);
  const [fontFamily, setFontFamilyState] = useState<FontFamilyId>(DEFAULT_FONT_FAMILY);
  const [lineHeight, setLineHeightState] = useState(DEFAULT_LINE_HEIGHT);
  const [textAlign, setTextAlignState] = useState<TextAlignId>(DEFAULT_TEXT_ALIGN);
  const [verticalAlign, setVerticalAlignState] = useState<VerticalAlignId>("middle");

  useEffect(() => {
    setFontScaleState(getStoredFontScale());
    setThemeState(getStoredTheme());
    setAspectRatioState(getStoredAspectRatio());
    setFontFamilyState(getStoredFontFamily());
    setLineHeightState(getStoredLineHeight());
    setTextAlignState(getStoredTextAlign());
    setVerticalAlignState(getStoredVerticalAlign());
  }, []);

  const verse = passage.verses[currentIndex];
  const total = passage.verses.length;

  useEffect(() => {
    const ch = getBroadcastChannel();
    if (!ch) return;
    const handler = (e: MessageEvent<BroadcastMessage>) => {
      const msg = e.data;
      if (msg?.type !== "DISPLAY_SETTINGS" || !msg.payload) return;
      const p = msg.payload;
      if (p.fontScale != null) {
        const v = Math.min(MAX_SCALE, Math.max(MIN_SCALE, p.fontScale));
        setFontScaleState(v);
        setStoredFontScale(v);
      }
      if (p.aspectRatio != null) {
        setAspectRatioState(p.aspectRatio);
        setStoredAspectRatio(p.aspectRatio);
      }
      if (p.fontFamily != null) {
        setFontFamilyState(p.fontFamily);
        setStoredFontFamily(p.fontFamily);
      }
      if (p.lineHeight != null) {
        const v = Math.min(
          MAX_LINE_HEIGHT,
          Math.max(MIN_LINE_HEIGHT, p.lineHeight)
        );
        setLineHeightState(v);
        setStoredLineHeight(v);
      }
      if (
        p.theme === "dark" ||
        p.theme === "light" ||
        p.theme === "navy" ||
        p.theme === "forest" ||
        p.theme === "wine" ||
        p.theme === "sepia"
      ) {
        setThemeState(p.theme);
        setStoredTheme(p.theme);
      }
      if (p.textAlign === "left" || p.textAlign === "center") {
        setTextAlignState(p.textAlign);
        setStoredTextAlign(p.textAlign);
      }
      if (p.verticalAlign === "top" || p.verticalAlign === "middle" || p.verticalAlign === "bottom") {
        setVerticalAlignState(p.verticalAlign);
        setStoredVerticalAlign(p.verticalAlign);
      }
    };
    ch.addEventListener("message", handler);
    return () => ch.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    const ch = getBroadcastChannel();
    if (!ch) return;
    const handler = (e: MessageEvent<BroadcastMessage>) => {
      const msg = e.data;
      if (msg?.type === "BLACKOUT") setIsBlackout(msg.on);
    };
    ch.addEventListener("message", handler);
    return () => ch.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    sendBlackoutState(isBlackout);
  }, [isBlackout]);

  const setFontScale = useCallback((v: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));
    setFontScaleState(next);
    setStoredFontScale(next);
  }, []);

  const setTheme = useCallback((t: DisplayTheme) => {
    setThemeState(t);
    setStoredTheme(t);
  }, []);

  useEffect(() => {
    sendCurrentState(passageId, currentIndex);
  }, [passageId, currentIndex]);

  useEffect(() => {
    const ch = getBroadcastChannel();
    if (!ch) return;
    const handler = (e: MessageEvent<BroadcastMessage>) => {
      const msg = e.data;
      if (msg?.type !== "SHOW_VERSE" && msg?.type !== "GO_TO_PASSAGE") return;
      if (msg.passageId === passageId) {
        const idx = msg.verseIndex ?? 0;
        const i = Math.max(
          0,
          Math.min(idx, passage.verses.length - 1)
        );
        setCurrentIndex(i);
      } else {
        const v = (msg.verseIndex ?? 0) + 1;
        router.push(
          v > 1 ? `/display/${msg.passageId}?v=${v}` : `/display/${msg.passageId}`
        );
      }
    };
    ch.addEventListener("message", handler);
    return () => ch.removeEventListener("message", handler);
  }, [passageId, passage.verses.length, router]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < total - 1 ? i + 1 : i));
  }, [total]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          document.exitFullscreen?.();
          setIsFullscreen(false);
        } else {
          router.push("/display");
        }
        return;
      }
      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
          setIsFullscreen(true);
        } else {
          document.exitFullscreen?.();
          setIsFullscreen(false);
        }
        return;
      }
      if (e.key === "ArrowLeft") {
        if (prevId) {
          router.push(`/display/${prevId}`);
        } else {
          goPrev();
        }
        return;
      }
      if (e.key === "ArrowRight") {
        if (nextId) {
          router.push(`/display/${nextId}`);
        } else {
          goNext();
        }
        return;
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setFontScale(fontScale + 0.1);
        return;
      }
      if (e.key === "-") {
        e.preventDefault();
        setFontScale(fontScale - 0.1);
        return;
      }
      if (e.key === "t" || e.key === "T") {
        setTheme(theme === "dark" ? "light" : "dark");
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, prevId, nextId, router, goPrev, goNext, fontScale, setFontScale, theme, setTheme]);

  const palette = THEME_PALETTE[theme];
  const isDark = palette.isDark;
  const bgClass = palette.bg;
  const textClass = palette.text;
  const mutedClass = palette.muted;
  const footerClass = palette.footer;

  const baseFontSize = "clamp(2.5rem, 6vw, 10rem)";
  const scaledFontSize = `calc(${baseFontSize} * ${fontScale})`;
  const fontCss = fontFamilyToCss(fontFamily);
  const ratioNums =
    aspectRatio === "19:6"
      ? [19, 6]
      : aspectRatio === "4:3"
        ? [4, 3]
        : [16, 9];
  const [arW, arH] = ratioNums;
  const aspectBoxStyle: React.CSSProperties = {
    width: `min(100vw, 100vh * ${arW}/${arH})`,
    height: `min(100vh, 100vw * ${arH}/${arW})`,
  };

  return (
    <div
      className={`fixed inset-0 ${bgClass} flex flex-col items-center justify-center overflow-hidden select-none`}
    >
      {isBlackout && (
        <div className="fixed inset-0 bg-black z-20" aria-hidden="true" />
      )}

      <div
        className={`flex flex-col items-center w-full flex-1 ${
          verticalAlign === "top"
            ? "justify-start pt-[6vh]"
            : verticalAlign === "bottom"
              ? "justify-end"
              : "justify-center"
        }`}
        style={aspectBoxStyle}
      >
        <div
          className={`${textClass} px-[5vw] max-w-[90vw] flex flex-col ${
            textAlign === "center"
              ? "text-center items-center"
              : "text-left items-start"
          }`}
          style={{
            fontSize: scaledFontSize,
            fontFamily: fontCss,
            lineHeight: lineHeight,
          }}
        >
          <p className={`${mutedClass} text-[0.5em] mb-[0.5em] tracking-wide`}>
            {passage.book} {passage.chapter}章
          </p>
          <p className="font-light">
            {verse.number}. <VerseText text={verse.text} />
          </p>
        </div>
      </div>

      <p
        className={`absolute bottom-[3vh] left-1/2 -translate-x-1/2 text-[0.2em] ${footerClass}`}
      >
        {currentIndex + 1} / {total}
      </p>

      <p
        className={`absolute bottom-[2vh] right-[2vw] text-[2em] color-white ${footerClass}`}
      >
        聖書 新改訳2017©2017新日本聖書刊行会
      </p>

      <div
        className={`absolute bottom-[3vh] left-[2vw] right-[2vw] flex items-center justify-between pointer-events-none sm:pointer-events-auto`}
      >
        <div className="flex items-center gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity z-30">
          <button
            type="button"
            onClick={() => setIsBlackout((prev) => !prev)}
            className={`flex items-center justify-center w-8 h-8 rounded ${isBlackout ? "bg-white/15 text-white border border-white/40 hover:bg-white/25" : isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-stone-200 text-stone-700 hover:bg-stone-300"}`}
            title={isBlackout ? "表示に戻す" : "ブラックアウト"}
            aria-label={isBlackout ? "表示に戻す" : "ブラックアウト"}
          >
            {isBlackout ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><line x1="2" y1="3" x2="22" y2="17" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><line x1="4" y1="7" x2="20" y2="7" /></svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen?.();
                setIsFullscreen(false);
              } else {
                document.documentElement.requestFullscreen?.();
                setIsFullscreen(true);
              }
            }}
            className={`flex items-center justify-center w-8 h-8 rounded ${isBlackout ? "bg-white/15 text-white border border-white/40 hover:bg-white/25" : isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-stone-200 text-stone-700 hover:bg-stone-300"}`}
            title={isFullscreen ? "全画面解除" : "全画面表示"}
            aria-label={isFullscreen ? "全画面解除" : "全画面表示"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
            )}
          </button>
          {prevId ? (
            <button
              type="button"
              onClick={() => router.push(`/display/${prevId}`)}
              className={`text-[0.15em] px-2 py-1 rounded ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-stone-200 text-stone-700 hover:bg-stone-300"}`}
            >
              ← 前の箇所
            </button>
          ) : (
            <span />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setFontScale(fontScale - 0.15)}
            className={`text-[0.2em] w-8 h-8 rounded flex items-center justify-center ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-stone-200 text-stone-700 hover:bg-stone-300"}`}
            title="文字を小さく (-)"
          >
            A−
          </button>
          <button
            type="button"
            onClick={() => setFontScale(fontScale + 0.15)}
            className={`text-[0.2em] w-8 h-8 rounded flex items-center justify-center ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-stone-200 text-stone-700 hover:bg-stone-300"}`}
            title="文字を大きく (+)"
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`text-[0.2em] w-8 h-8 rounded flex items-center justify-center ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-stone-200 text-stone-700 hover:bg-stone-300"}`}
            title="ダーク/ライト切替 (T)"
          >
            {isDark ? "☀" : "🌙"}
          </button>
        </div>
        <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {nextId ? (
            <button
              type="button"
              onClick={() => router.push(`/display/${nextId}`)}
              className={`text-[0.15em] px-2 py-1 rounded ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-stone-200 text-stone-700 hover:bg-stone-300"}`}
            >
              次の箇所 →
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { VerseText } from "@/components/VerseText";
import {
  getBroadcastChannel,
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
      if (p.theme === "dark" || p.theme === "light") {
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

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-black" : "bg-stone-100";
  const textClass = isDark ? "text-white" : "text-stone-900";
  const mutedClass = isDark ? "text-white/80" : "text-stone-600";
  const footerClass = isDark ? "text-white/40" : "text-stone-400";

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
        <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
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

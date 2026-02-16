"use client";

import {
  getBroadcastChannel,
  sendDisplaySettings,
  sendShowVerse,
  type BroadcastMessage,
} from "@/lib/broadcast";
import { createPassagePayload } from "@/lib/data";
import {
  ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_FONT_FAMILY,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_SCALE,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_VERTICAL_ALIGN,
  getStoredAspectRatio,
  getStoredFontFamily,
  getStoredFontScale,
  getStoredLineHeight,
  getStoredTextAlign,
  getStoredTheme,
  getStoredVerticalAlign,
  MAX_LINE_HEIGHT,
  MAX_SCALE,
  MIN_LINE_HEIGHT,
  MIN_SCALE,
  setStoredAspectRatio,
  setStoredFontFamily,
  setStoredFontScale,
  setStoredLineHeight,
  setStoredTextAlign,
  setStoredTheme,
  setStoredVerticalAlign,
  type AspectRatioId,
  type DisplayTheme,
  type FontFamilyId,
  type TextAlignId,
  type VerticalAlignId,
} from "@/lib/display-settings";
import { parseBibleInput } from "@/lib/parser";
import { getPassages, setPassages as savePassages } from "@/lib/passage-storage-client";
import { SAMPLE_PASSAGE } from "@/lib/sample-passage";
import type { BiblePassage } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const VERSE_PLACEHOLDER = `1,ユダの子は、ペレツ、ヘツロン、カルミ、フル、ショバル。
2,ショバルの子レアヤはヤハテを生み、ヤハテはアフマイとラハデを生んだ。`;

type DisplayState = { passageId: string; verseIndex: number } | null;

export default function AdminPage() {
  const [passages, setPassages] = useState<BiblePassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState("");
  const [chapterInput, setChapterInput] = useState("");
  const [versesText, setVersesText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [displayState, setDisplayState] = useState<DisplayState>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>(DEFAULT_ASPECT_RATIO);
  const [fontScale, setFontScale] = useState(DEFAULT_SCALE);
  const [fontFamily, setFontFamily] = useState<FontFamilyId>(DEFAULT_FONT_FAMILY);
  const [lineHeight, setLineHeight] = useState(DEFAULT_LINE_HEIGHT);
  const [theme, setTheme] = useState<DisplayTheme>("dark");
  const [textAlign, setTextAlign] = useState<TextAlignId>(DEFAULT_TEXT_ALIGN);
  const [verticalAlign, setVerticalAlign] = useState<VerticalAlignId>(DEFAULT_VERTICAL_ALIGN);
  const [activeTab, setActiveTab] = useState<"switch" | "register" | "settings">("switch");
  const [pptxDownloading, setPptxDownloading] = useState(false);
  const [pptxSelectOpen, setPptxSelectOpen] = useState(false);
  /** 箇所ID -> 選択した節のインデックス（0始まり） */
  const [pptxSelectedVerses, setPptxSelectedVerses] = useState<Map<string, Set<number>>>(new Map());
  /** モーダル内のPPT用表示設定（モーダルを開いた時点の表示設定で初期化） */
  const [pptxDisplay, setPptxDisplay] = useState<{
    theme: DisplayTheme;
    fontScale: number;
    fontFamily: FontFamilyId;
    textAlign: TextAlignId;
    verticalAlign: VerticalAlignId;
  }>({
    theme: "light",
    fontScale: DEFAULT_SCALE,
    fontFamily: DEFAULT_FONT_FAMILY,
    textAlign: DEFAULT_TEXT_ALIGN,
    verticalAlign: DEFAULT_VERTICAL_ALIGN,
  });

  useEffect(() => {
    setAspectRatio(getStoredAspectRatio());
    setFontScale(getStoredFontScale());
    setFontFamily(getStoredFontFamily());
    setLineHeight(getStoredLineHeight());
    setTheme(getStoredTheme());
    setTextAlign(getStoredTextAlign());
    setVerticalAlign(getStoredVerticalAlign());
  }, []);

  useEffect(() => {
    const stored = getPassages();
    if (stored.length === 0) {
      savePassages([SAMPLE_PASSAGE]);
      setPassages([SAMPLE_PASSAGE]);
    } else {
      setPassages(stored);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const ch = getBroadcastChannel();
    if (!ch) return;
    const handler = (e: MessageEvent<BroadcastMessage>) => {
      const msg = e.data;
      if (msg?.type === "CURRENT_STATE") {
        setDisplayState({
          passageId: msg.passageId,
          verseIndex: msg.verseIndex,
        });
      }
    };
    ch.addEventListener("message", handler);
    return () => ch.removeEventListener("message", handler);
  }, []);

  const openDisplayWindow = (path: string = "/display") => {
    window.open(path, "bible-display", "noopener");
  };

  const handleAspectRatio = (v: AspectRatioId) => {
    setAspectRatio(v);
    setStoredAspectRatio(v);
    sendDisplaySettings({ aspectRatio: v });
  };
  const handleFontScale = (v: number) => {
    const n = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));
    setFontScale(n);
    setStoredFontScale(n);
    sendDisplaySettings({ fontScale: n });
  };
  const handleFontFamily = (v: FontFamilyId) => {
    setFontFamily(v);
    setStoredFontFamily(v);
    sendDisplaySettings({ fontFamily: v });
  };
  const handleLineHeight = (v: number) => {
    const n = Math.min(MAX_LINE_HEIGHT, Math.max(MIN_LINE_HEIGHT, v));
    setLineHeight(n);
    setStoredLineHeight(n);
    sendDisplaySettings({ lineHeight: n });
  };
  const handleTheme = (t: DisplayTheme) => {
    setTheme(t);
    setStoredTheme(t);
    sendDisplaySettings({ theme: t });
  };
  const handleTextAlign = (a: TextAlignId) => {
    setTextAlign(a);
    setStoredTextAlign(a);
    sendDisplaySettings({ textAlign: a });
  };
  const handleVerticalAlign = (a: VerticalAlignId) => {
    setVerticalAlign(a);
    setStoredVerticalAlign(a);
    sendDisplaySettings({ verticalAlign: a });
  };

  const handleShowVerse = (passageId: string, verseIndex: number) => {
    sendShowVerse(passageId, verseIndex);
  };

  const handlePrev = () => {
    if (!displayState || passages.length === 0) return;
    const current = passages.find((p) => p.id === displayState.passageId);
    if (!current) return;
    if (displayState.verseIndex > 0) {
      sendShowVerse(displayState.passageId, displayState.verseIndex - 1);
      return;
    }
    const idx = passages.indexOf(current);
    if (idx > 0) {
      const prevPassage = passages[idx - 1]!;
      sendShowVerse(prevPassage.id, prevPassage.verses.length - 1);
    }
  };

  const handleNext = () => {
    if (!displayState || passages.length === 0) return;
    const current = passages.find((p) => p.id === displayState.passageId);
    if (!current) return;
    if (displayState.verseIndex < current.verses.length - 1) {
      sendShowVerse(displayState.passageId, displayState.verseIndex + 1);
      return;
    }
    const idx = passages.indexOf(current);
    if (idx < passages.length - 1 && idx >= 0) {
      const nextPassage = passages[idx + 1]!;
      sendShowVerse(nextPassage.id, 0);
    }
  };

  const handleCopyReference = async (p: BiblePassage) => {
    const ref = `${p.book} ${p.chapter}章`;
    try {
      await navigator.clipboard.writeText(ref);
      setCopyFeedback(ref);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch {
      setCopyFeedback("コピーできませんでした");
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`「${title}」を削除してもよろしいですか？`)) return;
    const next = getPassages().filter((p) => p.id !== id);
    savePassages(next);
    setPassages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const parsed = parseBibleInput(
        book.trim(),
        chapterInput.trim(),
        versesText.trim()
      );
      const passage = createPassagePayload(
        parsed.book,
        parsed.chapter,
        parsed.verses
      );
      const next = [...getPassages(), passage];
      savePassages(next);
      setPassages(next);
      setBook("");
      setChapterInput("");
      setVersesText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const currentPassage = displayState
    ? passages.find((p) => p.id === displayState.passageId)
    : null;

  return (
    <main className="min-h-screen bg-stone-50 overflow-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-4xl lg:max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-light text-stone-800">
            管理画面
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => openDisplayWindow("/display")}
              className="min-h-[44px] text-base px-4 py-2.5 sm:px-5 sm:py-3 border border-stone-300 rounded-lg hover:bg-stone-100 text-stone-700 font-medium transition"
            >
              表示用ウィンドウを別で開く
            </button>
            <Link
              href="/"
              className="min-h-[44px] inline-flex items-center text-base text-stone-500 hover:text-stone-700 px-2 py-2"
            >
              トップへ
            </Link>
          </div>
        </div>

        <div className="flex border-b border-stone-200 mb-6 sm:mb-8 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("switch")}
            className={`min-h-[48px] flex-1 min-w-0 px-4 py-3 sm:px-6 sm:py-3.5 text-base font-medium border-b-2 -mb-px transition whitespace-nowrap ${activeTab === "switch"
                ? "border-stone-800 text-stone-800"
                : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
          >
            表示切替
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`min-h-[48px] flex-1 min-w-0 px-4 py-3 sm:px-6 sm:py-3.5 text-base font-medium border-b-2 -mb-px transition whitespace-nowrap ${activeTab === "register"
                ? "border-stone-800 text-stone-800"
                : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
          >
            登録
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`min-h-[48px] flex-1 min-w-0 px-4 py-3 sm:px-6 sm:py-3.5 text-base font-medium border-b-2 -mb-px transition whitespace-nowrap ${activeTab === "settings"
                ? "border-stone-800 text-stone-800"
                : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
          >
            表示設定
          </button>
        </div>

        {activeTab === "switch" && (
          <>
            {currentPassage && displayState && (
              <div className="mb-5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-base">
                <span className="font-medium">表示中: </span>
                {currentPassage.book} {currentPassage.chapter}章{" "}
                {currentPassage.verses[displayState.verseIndex]?.number ??
                  displayState.verseIndex + 1}
                節
              </div>
            )}
            <div className="mb-5 sm:mb-6">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!displayState || passages.length === 0}
                  className="min-h-[48px] px-5 py-2.5 sm:px-6 sm:py-3 border border-stone-300 rounded-lg bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 font-medium text-base transition"
                >
                  前
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!displayState || passages.length === 0}
                  className="min-h-[48px] px-5 py-2.5 sm:px-6 sm:py-3 border border-stone-300 rounded-lg bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 font-medium text-base transition"
                >
                  後
                </button>
              </div>
              <p className="text-sm text-stone-500 mt-2 sm:mt-2.5">
                表示用ウィンドウで、前の御言葉／次の御言葉に切り替えます。同じ箇所内では前の節・次の節に、先頭・末尾では隣の箇所に移動します。
              </p>
            </div>
            {copyFeedback === "コピーできませんでした" && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-base">
                クリップボードにコピーできませんでした
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-medium text-stone-600">
                登録済み聖書箇所
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (passages.length === 0) return;
                  setPptxDisplay({
                    theme,
                    fontScale,
                    fontFamily,
                    textAlign,
                    verticalAlign,
                  });
                  setPptxSelectOpen(true);
                  setPptxSelectedVerses(
                    new Map(
                      passages.map((p) => [
                        p.id,
                        new Set(p.verses.map((_, i) => i)),
                      ])
                    )
                  );
                }}
                disabled={passages.length === 0}
                className="min-h-[44px] text-sm sm:text-base px-4 py-2.5 border border-stone-300 rounded-lg bg-white hover:bg-stone-50 text-stone-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                PPTでダウンロード
              </button>
            </div>

            {/* PPT 節選択モーダル */}
            {pptxSelectOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
                  <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-stone-800">
                      PPTに含める節を選択
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPptxSelectOpen(false)}
                      className="p-2 text-stone-500 hover:text-stone-700 rounded"
                      aria-label="閉じる"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4 flex gap-2 border-b border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setPptxSelectedVerses(
                          new Map(
                            passages.map((p) => [
                              p.id,
                              new Set(p.verses.map((_, i) => i)),
                            ])
                          )
                        );
                      }}
                      className="text-sm px-3 py-1.5 border border-stone-300 rounded-lg hover:bg-stone-50"
                    >
                      全選択
                    </button>
                    <button
                      type="button"
                      onClick={() => setPptxSelectedVerses(new Map())}
                      className="text-sm px-3 py-1.5 border border-stone-300 rounded-lg hover:bg-stone-50"
                    >
                      解除
                    </button>
                  </div>

                  {/* PPT用表示設定 */}
                  <div className="p-4 border-b border-stone-200 bg-stone-50/80 space-y-3">
                    <p className="text-sm font-medium text-stone-700">PPTの表示設定</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">テーマ</label>
                        <select
                          value={pptxDisplay.theme}
                          onChange={(e) =>
                            setPptxDisplay((d) => ({
                              ...d,
                              theme: e.target.value as DisplayTheme,
                            }))
                          }
                          className="w-full min-h-[40px] border border-stone-300 rounded-lg px-2 py-1.5 text-sm text-stone-800 bg-white"
                        >
                          <option value="dark">ダーク</option>
                          <option value="light">ライト</option>
                          <option value="navy">ネイビー</option>
                          <option value="forest">フォレスト</option>
                          <option value="wine">ワイン</option>
                          <option value="sepia">セピア</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">
                          文字サイズ（{(pptxDisplay.fontScale * 100).toFixed(0)}%）
                        </label>
                        <input
                          type="range"
                          min={MIN_SCALE}
                          max={MAX_SCALE}
                          step={0.1}
                          value={pptxDisplay.fontScale}
                          onChange={(e) =>
                            setPptxDisplay((d) => ({
                              ...d,
                              fontScale: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full h-9 accent-stone-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">フォント</label>
                        <select
                          value={pptxDisplay.fontFamily}
                          onChange={(e) =>
                            setPptxDisplay((d) => ({
                              ...d,
                              fontFamily: e.target.value as FontFamilyId,
                            }))
                          }
                          className="w-full min-h-[40px] border border-stone-300 rounded-lg px-2 py-1.5 text-sm text-stone-800 bg-white"
                        >
                          <option value="sans">ゴシック（標準）</option>
                          <option value="gothic">ゴシック（角ゴ）</option>
                          <option value="mincho">明朝</option>
                          <option value="serif">セリフ</option>
                          <option value="notoSans">Noto Sans JP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">配置（横）</label>
                        <select
                          value={pptxDisplay.textAlign}
                          onChange={(e) =>
                            setPptxDisplay((d) => ({
                              ...d,
                              textAlign: e.target.value as TextAlignId,
                            }))
                          }
                          className="w-full min-h-[40px] border border-stone-300 rounded-lg px-2 py-1.5 text-sm text-stone-800 bg-white"
                        >
                          <option value="left">左寄せ</option>
                          <option value="center">中央寄せ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">配置（縦）</label>
                        <select
                          value={pptxDisplay.verticalAlign}
                          onChange={(e) =>
                            setPptxDisplay((d) => ({
                              ...d,
                              verticalAlign: e.target.value as VerticalAlignId,
                            }))
                          }
                          className="w-full min-h-[40px] border border-stone-300 rounded-lg px-2 py-1.5 text-sm text-stone-800 bg-white"
                        >
                          <option value="top">上寄せ</option>
                          <option value="middle">中央寄せ</option>
                          <option value="bottom">下寄せ</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-y-auto p-4 space-y-4 flex-1">
                    {passages.map((p) => {
                      const indices = pptxSelectedVerses.get(p.id) ?? new Set<number>();
                      const allSelected = p.verses.length > 0 && indices.size === p.verses.length;
                      const someSelected = indices.size > 0;
                      return (
                        <div
                          key={p.id}
                          className="rounded-lg border border-stone-200 overflow-hidden"
                        >
                          <label className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-stone-100 cursor-pointer border-b border-stone-200">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={(e) => {
                                setPptxSelectedVerses((prev) => {
                                  const next = new Map(prev);
                                  if (e.target.checked) {
                                    next.set(p.id, new Set(p.verses.map((_, i) => i)));
                                  } else {
                                    next.delete(p.id);
                                  }
                                  return next;
                                });
                              }}
                              className="w-5 h-5 rounded border-stone-300"
                            />
                            <span className="font-medium text-stone-800">
                              {p.book} {p.chapter}章
                            </span>
                            <span className="text-stone-500 text-sm">
                              （この箇所全体・{p.verses.length}節）
                            </span>
                          </label>
                          <div className="p-3 pt-2 flex flex-wrap gap-2">
                            {p.verses.map((v, i) => (
                              <label
                                key={`${p.id}-${i}`}
                                className="inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={indices.has(i)}
                                  onChange={(e) => {
                                    setPptxSelectedVerses((prev) => {
                                      const next = new Map(prev);
                                      const set = new Set(next.get(p.id) ?? []);
                                      if (e.target.checked) set.add(i);
                                      else set.delete(i);
                                      if (set.size > 0) next.set(p.id, set);
                                      else next.delete(p.id);
                                      return next;
                                    });
                                  }}
                                  className="w-4 h-4 rounded border-stone-300"
                                />
                                <span className="text-sm text-stone-700">{v.number}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 border-t border-stone-200 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setPptxSelectOpen(false)}
                      className="min-h-[44px] px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50"
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const selected: BiblePassage[] = [];
                        for (const p of passages) {
                          const indices = pptxSelectedVerses.get(p.id);
                          if (!indices || indices.size === 0) continue;
                          const verses = p.verses.filter((_, i) => indices.has(i));
                          selected.push({ ...p, verses });
                        }
                        const totalVerses = selected.reduce((s, p) => s + p.verses.length, 0);
                        if (totalVerses === 0) {
                          setError("1つ以上節を選択してください");
                          return;
                        }
                        setPptxDownloading(true);
                        setError(null);
                        try {
                          const res = await fetch("/api/export-pptx", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              passages: selected,
                              display: {
                                theme: pptxDisplay.theme,
                                fontScale: pptxDisplay.fontScale,
                                fontFamily: pptxDisplay.fontFamily,
                                textAlign: pptxDisplay.textAlign,
                                verticalAlign: pptxDisplay.verticalAlign,
                              },
                            }),
                          });
                          if (!res.ok) {
                            const data = await res.json().catch(() => ({}));
                            throw new Error(data.error ?? "ダウンロードに失敗しました");
                          }
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `御言葉_${new Date().toISOString().slice(0, 10)}.pptx`;
                          a.click();
                          URL.revokeObjectURL(url);
                          setPptxSelectOpen(false);
                        } catch (e) {
                          setError(e instanceof Error ? e.message : "PPTのダウンロードに失敗しました");
                        } finally {
                          setPptxDownloading(false);
                        }
                      }}
                      disabled={
                        (Array.from(pptxSelectedVerses.values()).reduce(
                          (s, set) => s + set.size,
                          0
                        ) === 0) || pptxDownloading
                      }
                      className="min-h-[44px] px-5 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {pptxDownloading ? "作成中…" : "選択した節でPPTを生成"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {loading ? (
              <p className="text-stone-500 text-base">読み込み中…</p>
            ) : passages.length === 0 ? (
              <p className="text-stone-500 text-base">まだ登録がありません</p>
            ) : (
              <ul className="space-y-4 sm:space-y-5">
                {passages.map((p) => {
                  const isActive = displayState?.passageId === p.id;
                  const activeVerseIndex = isActive ? displayState.verseIndex : -1;
                  return (
                    <li
                      key={p.id}
                      className={`p-5 sm:p-6 border rounded-xl text-left transition ${isActive
                          ? "border-amber-400 bg-amber-50/80 shadow-sm"
                          : "border-stone-200 bg-white"
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
                        <span className="font-medium text-stone-800 text-lg">
                          {p.book} {p.chapter}章
                        </span>
                        <span className="text-stone-500 text-base">
                          {p.verses.length}節
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <button
                          type="button"
                          onClick={() => openDisplayWindow(`/display/${p.id}`)}
                          className="min-h-[44px] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5 border border-stone-300 rounded-lg hover:bg-stone-100 text-stone-600 transition"
                        >
                          この箇所を表示ウィンドウで開く
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyReference(p)}
                          className="min-h-[44px] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5 border border-stone-300 rounded-lg hover:bg-stone-100 text-stone-600 transition"
                        >
                          箇所をコピー
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, `${p.book} ${p.chapter}章`)}
                          className="min-h-[44px] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition"
                        >
                          削除
                        </button>
                        {copyFeedback && copyFeedback === `${p.book} ${p.chapter}章` && (
                          <span className="text-sm text-green-600">コピーしました</span>
                        )}
                      </div>
                      <p className="text-stone-400 text-sm mb-2 sm:mb-2.5">
                        節をクリック → 表示画面に即反映
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {p.verses.map((v, i) => (
                          <button
                            key={v.number}
                            type="button"
                            onClick={() => handleShowVerse(p.id, i)}
                            className={`min-h-[40px] min-w-[40px] text-sm sm:text-base px-3 py-2 rounded-lg transition ${isActive && activeVerseIndex === i
                                ? "bg-amber-500 text-white font-medium"
                                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                              }`}
                          >
                            {v.number}
                          </button>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {activeTab === "register" && (
          <>
            <div className="mb-6 p-4 sm:p-5 rounded-xl bg-stone-100 border border-stone-200/80">
              <p className="text-sm text-stone-700 leading-relaxed mb-2">
                <strong>章のコピー＆貼り付けで登録できます。</strong> 聖書 新改訳アプリ（
                <a href="https://www.wlpm.or.jp/bible/sk_lineup/digital/" target="_blank" rel="noopener noreferrer" className="underline text-stone-600 hover:text-stone-800">
                  いのちのことば社
                </a>
                ）の章コピー機能を使って、表示したい章をコピーして、下の「節」欄にそのまま貼り付けてください。1行を「節番号,本文」の形にしておくと登録できます。
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                登録したデータは<strong>サーバーやデータベースには保存されません</strong>。お使いのブラウザ内（この端末）にのみ保存されます。
              </p>
            </div>
            <form onSubmit={handleSubmit} className="mb-10 sm:mb-12 space-y-5 sm:space-y-6">
              <div>
                <label className="block text-base font-medium text-stone-600 mb-2">書名</label>
                <input
                  type="text"
                  value={book}
                  onChange={(e) => setBook(e.target.value)}
                  placeholder="歴代誌 第一"
                  className="w-full border border-stone-300 rounded-lg px-4 py-3 sm:py-3.5 text-base sm:text-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-medium text-stone-600 mb-2">章</label>
                <input
                  type="text"
                  value={chapterInput}
                  onChange={(e) => setChapterInput(e.target.value)}
                  placeholder="4章"
                  className="w-full border border-stone-300 rounded-lg px-4 py-3 sm:py-3.5 text-base sm:text-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-medium text-stone-600 mb-2">
                  節（1行に「番号,テキスト」）
                </label>
            <p className="text-sm text-stone-500 mb-2">
              ルビ: 漢字《かんじ》と書くと表示でルビになります。
            </p>
            <textarea
              value={versesText}
              onChange={(e) => setVersesText(e.target.value)}
              placeholder={VERSE_PLACEHOLDER}
              rows={8}
              className="w-full border border-stone-300 rounded-lg px-4 py-3 sm:py-3.5 text-base font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 min-h-[200px]"
              required
            />
          </div>
              {error && (
                <p className="text-red-600 text-base">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[52px] py-3.5 sm:py-4 bg-stone-800 text-white text-base sm:text-lg font-medium rounded-lg hover:bg-stone-700 disabled:opacity-50 transition"
              >
                {submitting ? "登録中…" : "登録"}
              </button>
            </form>
          </>
        )}

        {activeTab === "settings" && (
          <section className="p-5 sm:p-6 lg:p-8 rounded-xl border border-stone-200 bg-white">
            <h2 className="text-base sm:text-lg font-medium text-stone-700 mb-5 sm:mb-6">
              表示設定（表示画面に即時反映）
            </h2>
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">ダーク / ライト</label>
                <select
                  value={theme}
                  onChange={(e) =>
                    handleTheme(e.target.value as DisplayTheme)
                  }
                  className="w-full min-h-[48px] border border-stone-300 rounded-lg px-4 py-2.5 text-base text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                >
                  <option value="dark">ダーク</option>
                  <option value="light">ライト</option>
                  <option value="navy">ネイビー</option>
                  <option value="forest">フォレスト</option>
                  <option value="wine">ワイン</option>
                  <option value="sepia">セピア</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">比率</label>
                <select
                  value={aspectRatio}
                  onChange={(e) =>
                    handleAspectRatio(e.target.value as AspectRatioId)
                  }
                  className="w-full min-h-[48px] border border-stone-300 rounded-lg px-4 py-2.5 text-base text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                >
                  {ASPECT_RATIOS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">フォント</label>
                <select
                  value={fontFamily}
                  onChange={(e) =>
                    handleFontFamily(e.target.value as FontFamilyId)
                  }
                  className="w-full min-h-[48px] border border-stone-300 rounded-lg px-4 py-2.5 text-base text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                >
                  <option value="sans">ゴシック（標準）</option>
                  <option value="gothic">ゴシック（角ゴ）</option>
                  <option value="mincho">明朝</option>
                  <option value="serif">セリフ</option>
                  <option value="notoSans">Noto Sans JP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">御言葉の配置（横）</label>
                <select
                  value={textAlign}
                  onChange={(e) =>
                    handleTextAlign(e.target.value as TextAlignId)
                  }
                  className="w-full min-h-[48px] border border-stone-300 rounded-lg px-4 py-2.5 text-base text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                >
                  <option value="left">左寄せ</option>
                  <option value="center">中央寄せ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">御言葉の配置（縦）</label>
                <select
                  value={verticalAlign}
                  onChange={(e) =>
                    handleVerticalAlign(e.target.value as VerticalAlignId)
                  }
                  className="w-full min-h-[48px] border border-stone-300 rounded-lg px-4 py-2.5 text-base text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                >
                  <option value="top">上寄せ</option>
                  <option value="middle">中央寄せ</option>
                  <option value="bottom">下寄せ</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  文字サイズ（{(fontScale * 100).toFixed(0)}%）
                </label>
                <input
                  type="range"
                  min={MIN_SCALE}
                  max={MAX_SCALE}
                  step={0.05}
                  value={fontScale}
                  onChange={(e) =>
                    handleFontScale(parseFloat(e.target.value))
                  }
                  className="w-full h-3 accent-stone-600"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  行間（{lineHeight.toFixed(1)}）
                </label>
                <input
                  type="range"
                  min={MIN_LINE_HEIGHT}
                  max={MAX_LINE_HEIGHT}
                  step={0.1}
                  value={lineHeight}
                  onChange={(e) =>
                    handleLineHeight(parseFloat(e.target.value))
                  }
                  className="w-full h-3 accent-stone-600"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BiblePassage } from "@/types";
import {
  sendShowVerse,
  sendDisplaySettings,
  getBroadcastChannel,
  type BroadcastMessage,
} from "@/lib/broadcast";
import {
  getStoredAspectRatio,
  setStoredAspectRatio,
  getStoredFontScale,
  setStoredFontScale,
  getStoredFontFamily,
  setStoredFontFamily,
  getStoredLineHeight,
  setStoredLineHeight,
  getStoredTheme,
  setStoredTheme,
  ASPECT_RATIOS,
  MIN_SCALE,
  MAX_SCALE,
  MIN_LINE_HEIGHT,
  MAX_LINE_HEIGHT,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_SCALE,
  DEFAULT_FONT_FAMILY,
  DEFAULT_LINE_HEIGHT,
  type AspectRatioId,
  type FontFamilyId,
  type DisplayTheme,
} from "@/lib/display-settings";

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
  const [activeTab, setActiveTab] = useState<"switch" | "register" | "settings">("switch");
  const [rubyLoading, setRubyLoading] = useState(false);

  useEffect(() => {
    setAspectRatio(getStoredAspectRatio());
    setFontScale(getStoredFontScale());
    setFontFamily(getStoredFontFamily());
    setLineHeight(getStoredLineHeight());
    setTheme(getStoredTheme());
  }, []);

  const fetchPassages = async () => {
    try {
      const res = await fetch("/api/passages");
      if (res.ok) {
        const data = await res.json();
        setPassages(data);
      }
    } catch {
      setError("一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassages();
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

  const handleShowVerse = (passageId: string, verseIndex: number) => {
    sendShowVerse(passageId, verseIndex);
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除してもよろしいですか？`)) return;
    try {
      const res = await fetch(`/api/passages/${id}`, { method: "DELETE" });
      if (res.ok) setPassages((prev) => prev.filter((p) => p.id !== id));
      else setError("削除に失敗しました");
    } catch {
      setError("削除に失敗しました");
    }
  };

  const handleAutoRuby = async () => {
    const raw = versesText.trim();
    if (!raw) return;
    setRubyLoading(true);
    try {
      const lines = raw.split(/\n/).map((line) => line.trim()).filter(Boolean);
      const out: string[] = [];
      for (const line of lines) {
        const commaIdx = line.indexOf(",");
        if (commaIdx === -1) {
          out.push(line);
          continue;
        }
        const numPart = line.slice(0, commaIdx).trim();
        const textPart = line.slice(commaIdx + 1).trim();
        const res = await fetch("/api/ruby", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textPart }),
        });
        const data = await res.json();
        const newText = res.ok && data.text != null ? data.text : textPart;
        out.push(`${numPart},${newText}`);
      }
      setVersesText(out.join("\n"));
    } catch {
      setError("ルビの自動付与に失敗しました");
    } finally {
      setRubyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/passages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: book.trim(),
          chapterInput: chapterInput.trim(),
          versesText: versesText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "登録に失敗しました");
        return;
      }
      setPassages((prev) => [...prev, data]);
      setBook("");
      setChapterInput("");
      setVersesText("");
    } catch {
      setError("登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const currentPassage = displayState
    ? passages.find((p) => p.id === displayState.passageId)
    : null;

  return (
    <main className="min-h-screen bg-stone-50 p-6 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h1 className="text-xl font-light text-stone-800">管理画面</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => openDisplayWindow("/display")}
              className="text-sm px-3 py-1.5 border border-stone-300 rounded hover:bg-stone-100 text-stone-700"
            >
              表示用ウィンドウを別で開く
            </button>
            <Link
              href="/"
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              トップへ
            </Link>
          </div>
        </div>

        <div className="flex border-b border-stone-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("switch")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === "switch"
                ? "border-stone-800 text-stone-800"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            表示切替
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === "register"
                ? "border-stone-800 text-stone-800"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            登録
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === "settings"
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
          <div className="mb-4 px-3 py-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            <span className="font-medium">表示中: </span>
            {currentPassage.book} {currentPassage.chapter}章{" "}
            {currentPassage.verses[displayState.verseIndex]?.number ??
              displayState.verseIndex + 1}
            節
          </div>
        )}
        {copyFeedback === "コピーできませんでした" && (
          <div className="mb-4 px-3 py-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            クリップボードにコピーできませんでした
          </div>
        )}
        <h2 className="text-sm font-medium text-stone-600 mb-3">
          登録済み聖書箇所
        </h2>
        {loading ? (
          <p className="text-stone-500 text-sm">読み込み中…</p>
        ) : passages.length === 0 ? (
          <p className="text-stone-500 text-sm">まだ登録がありません</p>
        ) : (
          <ul className="space-y-3">
            {passages.map((p) => {
              const isActive = displayState?.passageId === p.id;
              const activeVerseIndex = isActive ? displayState.verseIndex : -1;
              return (
                <li
                  key={p.id}
                  className={`p-4 border rounded text-left transition ${
                    isActive
                      ? "border-amber-400 bg-amber-50/80 shadow-sm"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="font-medium text-stone-800">
                      {p.book} {p.chapter}章
                    </span>
                    <span className="text-stone-500 text-sm">
                      {p.verses.length}節
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => openDisplayWindow(`/display/${p.id}`)}
                      className="text-xs px-2 py-1 border border-stone-300 rounded hover:bg-stone-100 text-stone-600"
                    >
                      この箇所を表示ウィンドウで開く
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyReference(p)}
                      className="text-xs px-2 py-1 border border-stone-300 rounded hover:bg-stone-100 text-stone-600"
                    >
                      箇所をコピー
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, `${p.book} ${p.chapter}章`)}
                      className="text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50 text-red-600"
                    >
                      削除
                    </button>
                    {copyFeedback && copyFeedback === `${p.book} ${p.chapter}章` && (
                      <span className="text-xs text-green-600">コピーしました</span>
                    )}
                  </div>
                  <p className="text-stone-400 text-xs mb-1.5">
                    節をクリック → 表示画面に即反映
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.verses.map((v, i) => (
                      <button
                        key={v.number}
                        type="button"
                        onClick={() => handleShowVerse(p.id, i)}
                        className={`text-sm px-2 py-1 rounded transition ${
                          isActive && activeVerseIndex === i
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
        <form onSubmit={handleSubmit} className="mb-10 space-y-4">
          <div>
            <label className="block text-sm text-stone-600 mb-1">書名</label>
            <input
              type="text"
              value={book}
              onChange={(e) => setBook(e.target.value)}
              placeholder="歴代誌 第一"
              className="w-full border border-stone-300 rounded px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-1">章</label>
            <input
              type="text"
              value={chapterInput}
              onChange={(e) => setChapterInput(e.target.value)}
              placeholder="4章"
              className="w-full border border-stone-300 rounded px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-1">
              節（1行に「番号,テキスト」）
            </label>
            <p className="text-xs text-stone-500 mb-1">
              ルビ: 漢字《かんじ》と書くと表示でルビになります。下の「ルビを自動付与」で読みを自動挿入できます。
            </p>
            <textarea
              value={versesText}
              onChange={(e) => setVersesText(e.target.value)}
              placeholder={VERSE_PLACEHOLDER}
              rows={6}
              className="w-full border border-stone-300 rounded px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 font-mono text-sm"
              required
            />
            <button
              type="button"
              onClick={handleAutoRuby}
              disabled={rubyLoading || !versesText.trim()}
              className="mt-2 text-xs px-2 py-1 border border-stone-300 rounded hover:bg-stone-100 text-stone-600 disabled:opacity-50"
            >
              {rubyLoading ? "処理中…" : "ルビを自動付与"}
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-stone-800 text-white rounded hover:bg-stone-700 disabled:opacity-50 transition"
          >
            {submitting ? "登録中…" : "登録"}
          </button>
        </form>
        )}

        {activeTab === "settings" && (
        <section className="p-4 rounded-lg border border-stone-200 bg-white">
          <h2 className="text-sm font-medium text-stone-700 mb-3">
            表示設定（表示画面に即時反映）
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-stone-500 mb-1">ダーク / ライト</label>
              <select
                value={theme}
                onChange={(e) =>
                  handleTheme(e.target.value as DisplayTheme)
                }
                className="w-full border border-stone-300 rounded px-2 py-1.5 text-stone-800 text-sm"
              >
                <option value="dark">ダークモード</option>
                <option value="light">ライトモード</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">比率</label>
              <select
                value={aspectRatio}
                onChange={(e) =>
                  handleAspectRatio(e.target.value as AspectRatioId)
                }
                className="w-full border border-stone-300 rounded px-2 py-1.5 text-stone-800 text-sm"
              >
                {ASPECT_RATIOS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">フォント</label>
              <select
                value={fontFamily}
                onChange={(e) =>
                  handleFontFamily(e.target.value as FontFamilyId)
                }
                className="w-full border border-stone-300 rounded px-2 py-1.5 text-stone-800 text-sm"
              >
                <option value="sans">ゴシック（標準）</option>
                <option value="gothic">ゴシック（角ゴ）</option>
                <option value="mincho">明朝</option>
                <option value="serif">セリフ</option>
                <option value="notoSans">Noto Sans JP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">
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
                className="w-full h-2 accent-stone-600"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">
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
                className="w-full h-2 accent-stone-600"
              />
            </div>
          </div>
        </section>
        )}
      </div>
    </main>
  );
}

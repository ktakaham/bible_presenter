/** 表示画面とのリアルタイム同期用チャンネル名 */
export const BIBLE_PRESENTER_CHANNEL = "bible-presenter";

/** 管理画面 → 表示画面: 表示設定の一括更新 */
export type DisplaySettingsPayload = {
  aspectRatio?: "19:6" | "4:3" | "16:9";
  fontScale?: number;
  fontFamily?: "sans" | "serif" | "mincho" | "gothic" | "notoSans";
  lineHeight?: number;
  theme?: "dark" | "light" | "navy" | "forest" | "wine" | "sepia";
  textAlign?: "left" | "center";
  verticalAlign?: "top" | "middle" | "bottom";
};

export type BroadcastMessage =
  | { type: "SHOW_VERSE"; passageId: string; verseIndex: number }
  | { type: "GO_TO_PASSAGE"; passageId: string; verseIndex?: number }
  /** 表示画面 → 管理画面: 現在表示中の箇所・節 */
  | { type: "CURRENT_STATE"; passageId: string; verseIndex: number }
  /** 管理画面 → 表示画面: 表示設定 */
  | { type: "DISPLAY_SETTINGS"; payload: DisplaySettingsPayload }
  /** 管理画面 → 表示画面: ブラックアウト on/off */
  | { type: "BLACKOUT"; on: boolean }
  /** 表示画面 → 管理画面: ブラックアウト状態（トグル同期用） */
  | { type: "BLACKOUT_STATE"; on: boolean }
  /** 管理画面 → 表示画面: 全画面表示を要求 */
  | { type: "REQUEST_FULLSCREEN" };

export function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  try {
    return new BroadcastChannel(BIBLE_PRESENTER_CHANNEL);
  } catch {
    return null;
  }
}

export function sendShowVerse(passageId: string, verseIndex: number): void {
  const ch = getBroadcastChannel();
  ch?.postMessage({
    type: "SHOW_VERSE",
    passageId,
    verseIndex,
  } satisfies BroadcastMessage);
}

export function sendGoToPassage(
  passageId: string,
  verseIndex: number = 0
): void {
  const ch = getBroadcastChannel();
  ch?.postMessage({
    type: "GO_TO_PASSAGE",
    passageId,
    verseIndex,
  } satisfies BroadcastMessage);
}

/** 表示画面が現在の passageId / verseIndex を管理画面に通知 */
export function sendCurrentState(
  passageId: string,
  verseIndex: number
): void {
  const ch = getBroadcastChannel();
  ch?.postMessage({
    type: "CURRENT_STATE",
    passageId,
    verseIndex,
  } satisfies BroadcastMessage);
}

/** 管理画面から表示設定を表示画面に送信（即時反映） */
export function sendDisplaySettings(payload: DisplaySettingsPayload): void {
  const ch = getBroadcastChannel();
  ch?.postMessage({
    type: "DISPLAY_SETTINGS",
    payload,
  } satisfies BroadcastMessage);
}

/** 管理画面 → 表示画面: ブラックアウト（true=黒画面、false=表示に戻す） */
export function sendBlackout(on: boolean): void {
  const ch = getBroadcastChannel();
  ch?.postMessage({ type: "BLACKOUT", on } satisfies BroadcastMessage);
}

/** 表示画面 → 管理画面: ブラックアウト状態を通知（管理画面のトグル表示同期用） */
export function sendBlackoutState(on: boolean): void {
  const ch = getBroadcastChannel();
  ch?.postMessage({ type: "BLACKOUT_STATE", on } satisfies BroadcastMessage);
}

/** 管理画面 → 表示画面: 全画面表示を要求 */
export function sendRequestFullscreen(): void {
  const ch = getBroadcastChannel();
  ch?.postMessage({ type: "REQUEST_FULLSCREEN" } satisfies BroadcastMessage);
}

import { NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import type { BiblePassage } from "@/types";

/** 表示設定（管理画面の表示設定をPPTに反映） */
export type PptxDisplayOptions = {
  theme: "dark" | "light";
  fontScale: number;
  fontFamily: "sans" | "serif" | "mincho" | "gothic" | "notoSans";
  textAlign: "left" | "center";
  verticalAlign: "top" | "middle" | "bottom";
};

const DEFAULT_PPTX_DISPLAY: PptxDisplayOptions = {
  theme: "light",
  fontScale: 1,
  fontFamily: "sans",
  textAlign: "center",
  verticalAlign: "middle",
};

const FONT_FACE_MAP: Record<PptxDisplayOptions["fontFamily"], string> = {
  sans: "Yu Gothic UI",
  serif: "Yu Mincho",
  mincho: "Yu Mincho",
  gothic: "Yu Gothic UI",
  notoSans: "Noto Sans JP",
};

function buildPptx(
  passages: BiblePassage[],
  display: PptxDisplayOptions = DEFAULT_PPTX_DISPLAY
): PptxGenJS {
  const pptx = new PptxGenJS();

  pptx.author = "Bible Presenter";
  pptx.title = "御言葉";

  const isDark = display.theme === "dark";
  const bgColor = isDark ? "000000" : "f5f5f4";
  const headerColor = isDark ? "b3b3b3" : "57534e";
  const bodyColor = isDark ? "ffffff" : "1c1917";

  const headerFontSize = Math.round(18 * display.fontScale);
  const bodyFontSize = Math.round(28 * display.fontScale);
  const fontFace = FONT_FACE_MAP[display.fontFamily];
  const align = display.textAlign === "center" ? "center" : "left";
  const valign = display.verticalAlign === "top" ? "top" : display.verticalAlign === "bottom" ? "bottom" : "middle";

  for (const passage of passages) {
    const header = `${passage.book} ${passage.chapter}章`;

    for (const verse of passage.verses) {
      const slide = pptx.addSlide();
      slide.background = { color: bgColor };

      slide.addText(header, {
        x: 0.5,
        y: 0.4,
        w: 9,
        h: 0.6,
        fontSize: headerFontSize,
        color: headerColor,
        fontFace,
        align: "center",
      });

      const body = `${verse.number}. ${verse.text}`;
      slide.addText(body, {
        x: 0.5,
        y: 1.4,
        w: 9,
        h: 5,
        fontSize: bodyFontSize,
        color: bodyColor,
        fontFace,
        align,
        valign,
      });
    }
  }

  return pptx;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const passages = body.passages as BiblePassage[] | undefined;
    const rawDisplay = body.display;

    if (!Array.isArray(passages) || passages.length === 0) {
      return NextResponse.json(
        { error: "御言葉データが必要です" },
        { status: 400 }
      );
    }

    let display: PptxDisplayOptions = { ...DEFAULT_PPTX_DISPLAY };
    if (rawDisplay && typeof rawDisplay === "object") {
      if (rawDisplay.theme === "dark" || rawDisplay.theme === "light") display.theme = rawDisplay.theme;
      if (typeof rawDisplay.fontScale === "number" && rawDisplay.fontScale >= 0.5 && rawDisplay.fontScale <= 2) {
        display.fontScale = rawDisplay.fontScale;
      }
      const ff = rawDisplay.fontFamily;
      if (["sans", "serif", "mincho", "gothic", "notoSans"].includes(ff)) {
        display.fontFamily = ff;
      }
      if (rawDisplay.textAlign === "left" || rawDisplay.textAlign === "center") display.textAlign = rawDisplay.textAlign;
      if (["top", "middle", "bottom"].includes(rawDisplay.verticalAlign)) {
        display.verticalAlign = rawDisplay.verticalAlign;
      }
    }

    const pptx = buildPptx(passages, display);
    const buffer = await pptx.write({
      outputType: "nodebuffer",
      compression: true,
    });

    const fileName = `御言葉_${new Date().toISOString().slice(0, 10)}.pptx`;
    const encoded = encodeURIComponent(fileName);

    const responseBody =
      buffer instanceof Buffer ? new Uint8Array(buffer) : buffer;

    return new NextResponse(responseBody as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename*=UTF-8''${encoded}`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "PPTの生成に失敗しました" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import type { BiblePassage } from "@/types";

function buildPptx(passages: BiblePassage[]): PptxGenJS {
  const pptx = new PptxGenJS();

  pptx.author = "Bible Presenter";
  pptx.title = "御言葉";

  for (const passage of passages) {
    const header = `${passage.book} ${passage.chapter}章`;

    for (const verse of passage.verses) {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };

      slide.addText(header, {
        x: 0.5,
        y: 0.4,
        w: 9,
        h: 0.6,
        fontSize: 18,
        color: "5C5C5C",
        align: "center",
      });

      const body = `${verse.number}. ${verse.text}`;
      slide.addText(body, {
        x: 0.5,
        y: 1.4,
        w: 9,
        h: 5,
        fontSize: 28,
        color: "1F1F1F",
        align: "center",
        valign: "middle",
      });
    }
  }

  return pptx;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const passages = body.passages as BiblePassage[] | undefined;

    if (!Array.isArray(passages) || passages.length === 0) {
      return NextResponse.json(
        { error: "御言葉データが必要です" },
        { status: 400 }
      );
    }

    const pptx = buildPptx(passages);
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

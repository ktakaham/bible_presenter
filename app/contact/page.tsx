import Link from "next/link";

/** お問い合わせフォーム（Google フォーム） */
const INQUIRY_FORM_URL = "https://forms.gle/2LMgPecEcXYnfVfVA";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-2xl sm:text-3xl font-light text-stone-800 mb-4">
          お問い合わせ
        </h1>
        <p className="text-stone-600 mb-8 leading-relaxed">
          ご質問・ご要望・不具合の報告は、下のボタンからお問い合わせフォームへお進みください。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={INQUIRY_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center px-8 py-4 bg-stone-800 text-white text-base font-medium rounded-xl hover:bg-stone-700 transition"
          >
            お問い合わせフォームを開く
          </a>
          <Link
            href="/"
            className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center px-8 py-4 border border-stone-300 text-stone-700 text-base font-medium rounded-xl hover:bg-stone-100 transition"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

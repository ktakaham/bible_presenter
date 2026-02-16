import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-page">
      {/* 一番上: 利用ページへ */}
      <div className="bg-stone-800 text-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <span className="text-base font-medium text-stone-200">利用を始める</span>
          <Link
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-white text-stone-900 text-base font-semibold rounded-lg hover:bg-stone-100 transition"
          >
            管理画面へ
          </Link>
          <Link
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 border-2 border-stone-400 text-white text-base font-semibold rounded-lg hover:bg-stone-600 transition"
          >
            表示用ウィンドウ
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-page border-b border-stone-200/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.08),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 py-4 sm:py-6 text-center">
          <Link href="/" className="inline-block">
            <img
              src="/logo.jpeg"
              alt="Bible Presenter - 御言葉を大きく読みやすく"
              className="h-40 sm:h-52 md:h-64 lg:h-80 xl:h-96 w-auto mx-auto"
            />
          </Link>
          <h1 className="sr-only">聖書表示アプリ</h1>
          <div className="mt-6 sm:mt-8 max-w-2xl mx-auto">
            <p className="text-xl sm:text-2xl text-stone-900 font-semibold mb-3">
              説教用のPPT、準備大変じゃないですか？
            </p>
            <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
              御言葉のスライドを1節ずつ作ったり、フォントやレイアウトを揃えたり。Bible Presenter なら、聖書アプリからコピーして貼り付けるだけで、すぐにきれいに映せます。
            </p>
          </div>
        </div>
      </section>

      {/* サービス紹介 */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 py-14 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 mb-10 text-center">
          サービス紹介
        </h2>
        <div className="grid sm:grid-cols-2 gap-8 sm:gap-10">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-stone-300 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-2xl mb-4">
              📖
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              御言葉の登録
            </h3>
            <p className="text-stone-700 leading-relaxed text-base">
              管理画面で聖書の書名・章・節を登録。テキストはブラウザ内に保存されるため、サーバーにデータを預けずに利用できます。
            </p>
          </div>
          <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-stone-300 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-2xl mb-4">
              🖥️
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              全画面表示
            </h3>
            <p className="text-stone-700 leading-relaxed text-base">
              表示用ウィンドウを別画面やプロジェクターに映し、御言葉を大きく表示。フォント・文字サイズ・配色も調整できます。
            </p>
          </div>
          <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-stone-300 shadow-sm sm:col-span-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-2xl mb-4">
              ⚡
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              スムーズな切り替え
            </h3>
            <p className="text-stone-700 leading-relaxed text-base">
              管理画面で節をクリックするだけで、表示画面に即反映。前・後ボタンやキーボードの矢印キーで、前後の御言葉に素早く移動できます。
            </p>
          </div>
        </div>
      </section>

      {/* 利用の流れ */}
      <section className="bg-page border-y border-stone-200/80 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 mb-4 text-center">
            利用の流れ
          </h2>
          <p className="text-stone-700 text-center mb-10 max-w-2xl mx-auto text-base">
            聖書アプリや電子書籍から章をコピーして貼り付けるだけで、すぐに表示できます。
          </p>
          <ol className="space-y-6 max-w-2xl mx-auto">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 text-amber-800 text-sm font-medium flex items-center justify-center">
                1
              </span>
              <div>
                <span className="font-semibold text-stone-900">御言葉をコピー</span>
                <p className="text-stone-700 text-base mt-1 leading-relaxed">
                  聖書 新改訳アプリ（
                  <a
                    href="https://www.wlpm.or.jp/bible/sk_lineup/digital/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-stone-700 hover:text-stone-900 font-medium"
                  >
                    いのちのことば社
                  </a>
                  ）の章コピー機能を使って、表示したい章をコピーします。
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 text-amber-800 text-sm font-medium flex items-center justify-center">
                2
              </span>
              <div>
                <span className="font-semibold text-stone-900">管理画面で登録</span>
                <p className="text-stone-700 text-base mt-1 leading-relaxed">
                  「管理画面」の「登録」タブで、書名・章を入力し、コピーしたテキストを「節」欄に貼り付けます。1行が「節番号,本文」の形式になっていればそのまま使えます。
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 text-amber-800 text-sm font-medium flex items-center justify-center">
                3
              </span>
              <div>
                <span className="font-semibold text-stone-900">表示用ウィンドウで映す</span>
                <p className="text-stone-700 text-base mt-1 leading-relaxed">
                  「表示用ウィンドウを別で開く」で表示画面を開き、プロジェクターやモニターに映します。管理画面で節をクリックすると、表示が即切り替わります。
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* データの保存について */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <div className="p-5 sm:p-6 rounded-xl bg-white border-2 border-amber-300 shadow-sm">
          <h3 className="font-semibold text-stone-900 mb-2 text-base">データの保存について</h3>
          <p className="text-stone-800 text-base leading-relaxed">
            登録した御言葉は<strong>データベースやサーバーには保存されません</strong>。お使いのブラウザ内（この端末）にのみ保存されます。別のパソコンやブラウザでは表示されず、ブラウザのデータを削除すると登録内容も消えます。礼拝で使う端末でそのまま登録・表示してください。
          </p>
        </div>
      </section>

      {/* こんな方に */}
      <section className="bg-page border-y border-stone-200/80 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 mb-10 text-center">
            こんな方に
          </h2>
          <ul className="space-y-4 max-w-2xl mx-auto">
            {[
              "礼拝や集会で聖書箇所をスクリーンに映したい",
              "説教やメッセージの際に御言葉を大きく見せたい",
              "教会のプロジェクターやモニターで表示したい",
            ].map((text, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-stone-800 text-base font-medium"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-medium flex items-center justify-center">
                  {i + 1}
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 mb-3">
            はじめる
          </h2>
          <p className="text-stone-700 text-base">
            管理画面で御言葉を登録し、表示用ウィンドウで映し出しましょう。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center px-8 py-4 bg-stone-800 text-white text-base font-semibold rounded-xl hover:bg-stone-700 transition shadow-md"
          >
            管理画面を開く
          </Link>
          <Link
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center px-8 py-4 bg-stone-700 text-white border-2 border-stone-700 text-base font-semibold rounded-xl hover:bg-stone-600 hover:border-stone-600 transition shadow-md ring-2 ring-stone-400/50 ring-offset-2 ring-offset-page"
          >
            表示用ウィンドウを開く
          </Link>
        </div>
        <p className="text-center text-base text-stone-600 mt-6">
          初めての方は、管理画面から「表示用ウィンドウを別で開く」で表示画面を開いてください。
        </p>
      </section>

      {/* お問い合わせ誘導 */}
      <section className="border-t border-stone-200/80 bg-page py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 mb-3">
            お問い合わせ
          </h2>
          <p className="text-stone-700 mb-8 max-w-xl mx-auto text-base">
            ご質問・ご要望・不具合の報告は、お問い合わせフォームからお送りください。
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center min-h-[52px] px-8 py-4 bg-stone-800 text-white text-base font-semibold rounded-xl hover:bg-stone-700 transition shadow-md"
          >
            お問い合わせフォームへ
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 py-8">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-base text-stone-600">
          <span>Bible Presenter — 礼拝用・聖書箇所の全画面表示</span>
          <Link href="/contact" className="underline font-medium hover:text-stone-800">
            お問い合わせ
          </Link>
        </div>
      </footer>
    </main>
  );
}

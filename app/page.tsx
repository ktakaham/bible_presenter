import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-stone-100 p-6">
      <h1 className="text-2xl font-light text-stone-800 mb-8">
        聖書表示アプリ
      </h1>
      <Link
        href="/admin"
        className="px-6 py-3 bg-stone-800 text-white rounded hover:bg-stone-700 transition"
      >
        管理画面へ
      </Link>
    </main>
  );
}

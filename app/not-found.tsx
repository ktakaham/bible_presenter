import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-stone-100 p-6">
      <p className="text-stone-600 mb-4">ページが見つかりません</p>
      <Link
        href="/admin"
        className="text-stone-800 underline hover:no-underline"
      >
        管理画面へ
      </Link>
    </main>
  );
}

import { notFound } from "next/navigation";
import { getPassageById, readPassages } from "@/lib/file-store";
import DisplayClient from "./DisplayClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ v?: string }>;
}

export default async function DisplayPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { v } = await searchParams;
  const [passage, allPassages] = await Promise.all([
    getPassageById(id),
    readPassages(),
  ]);
  if (!passage) notFound();
  const ids = allPassages.map((p) => p.id);
  const currentIndex = ids.indexOf(id);
  const prevId = currentIndex > 0 ? ids[currentIndex - 1]! : null;
  const nextId =
    currentIndex >= 0 && currentIndex < ids.length - 1
      ? ids[currentIndex + 1]!
      : null;
  const initialVerseIndex =
    v != null ? Math.max(0, parseInt(v, 10) - 1) : undefined;
  return (
    <DisplayClient
      passage={passage}
      passageId={id}
      initialVerseIndex={initialVerseIndex}
      prevId={prevId}
      nextId={nextId}
    />
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function createSlug(date: string, title: string) {
  const suffix = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${date}-note${suffix ? `-${suffix}` : ""}.md`;
}

export default function NewNoteForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(formatToday);
  const [slug, setSlug] = useState(`${formatToday()}-note.md`);
  const [creating, setCreating] = useState(false);

  const suggestedSlug = useMemo(() => createSlug(date, title), [date, title]);

  function useSuggestedSlug() {
    setSlug(suggestedSlug);
  }

  async function createNote() {
    try {
      setCreating(true);

      const res = await fetch("/api/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          date,
          slug,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || "create failed");
      }

      router.push(`/posts/${encodeURIComponent(slug)}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "作成に失敗した");
    } finally {
      setCreating(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-800"
      >
        New note
      </button>
    );
  }

  return (
    <div className="grid w-full gap-4 rounded-lg border border-cyan-200 bg-cyan-50 p-4 md:w-[34rem]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-cyan-950">
            手書き記事を作成
          </h3>
          <p className="mt-1 text-sm text-cyan-800">
            source: manual / type: note の下書きを posts に作ります。
          </p>
        </div>

        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border border-cyan-200 bg-white px-3 py-1.5 text-sm text-cyan-900 transition hover:bg-cyan-100"
        >
          Close
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_12rem]">
        <div>
          <label className="mb-2 block text-sm font-medium text-cyan-950">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="新しい考察メモ"
            className="w-full rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-cyan-950">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label className="block text-sm font-medium text-cyan-950">
            Slug
          </label>
          <button
            onClick={useSuggestedSlug}
            className="text-sm font-medium text-cyan-800 hover:text-cyan-950"
          >
            候補を使う
          </button>
        </div>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-lg border border-cyan-200 bg-white px-4 py-3 font-mono text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={createNote}
          disabled={creating}
          className="rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {creating ? "作成中..." : "作成して編集"}
        </button>
      </div>
    </div>
  );
}

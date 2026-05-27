"use client";

import Link from "next/link";
import { useState } from "react";

type Range = "today" | "week";

export default function GeneratePage() {
  const [loadingRange, setLoadingRange] = useState<Range | null>(null);

  async function generate(range: Range) {
    try {
      setLoadingRange(range);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ range }),
      });

      if (!res.ok) {
        throw new Error("generate failed");
      }

      alert(`${range} の生成を開始した`);
    } catch (error) {
      console.error(error);
      alert("生成開始に失敗した");
    } finally {
      setLoadingRange(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 sm:px-8">
      <Link href="/" className="text-sm font-medium text-cyan-700 hover:text-cyan-900">
        下書き一覧へ
      </Link>

      <header className="mt-5 border-b border-zinc-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
          ACTIONS
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          Generate drafts
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          GitHub Actionsを起動して、Discordログの収集と下書き生成を実行します。
        </p>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <button
          onClick={() => generate("today")}
          disabled={loadingRange !== null}
          className="rounded-lg border border-zinc-200 bg-white p-5 text-left transition hover:border-cyan-300 hover:shadow-sm disabled:opacity-50"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            TODAY
          </div>
          <div className="mt-3 text-lg font-semibold text-zinc-950">
            今日の下書きを生成
          </div>
          <div className="mt-2 text-sm leading-6 text-zinc-500">
            今日のDiscordログを収集して posts に下書きを作成します。
          </div>
        </button>

        <button
          onClick={() => generate("week")}
          disabled={loadingRange !== null}
          className="rounded-lg border border-zinc-200 bg-white p-5 text-left transition hover:border-amber-300 hover:shadow-sm disabled:opacity-50"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            WEEK
          </div>
          <div className="mt-3 text-lg font-semibold text-zinc-950">
            今週の下書きを生成
          </div>
          <div className="mt-2 text-sm leading-6 text-zinc-500">
            今週分のDiscordログを収集して posts に週次下書きを作成します。
          </div>
        </button>
      </div>

      {loadingRange && (
        <p className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
          {loadingRange} の生成を開始しています...
        </p>
      )}
    </main>
  );
}

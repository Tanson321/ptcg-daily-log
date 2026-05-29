"use client";

import Link from "next/link";
import { useState } from "react";

type Range = "today" | "date" | "week" | "period";

function formatToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function GeneratePage() {
  const [loadingRange, setLoadingRange] = useState<Range | null>(null);
  const [date, setDate] = useState(formatToday);
  const [startDate, setStartDate] = useState(formatToday);
  const [endDate, setEndDate] = useState(formatToday);

  async function generate(range: Range, options: Record<string, string> = {}) {
    try {
      setLoadingRange(range);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ range, ...options }),
      });

      if (!res.ok) {
        throw new Error("generate failed");
      }

      alert("生成を開始した");
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
        <section className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-cyan-300 hover:shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            TODAY
          </div>
          <div className="mt-3 text-lg font-semibold text-zinc-950">
            今日の下書きを生成
          </div>
          <div className="mt-2 text-sm leading-6 text-zinc-500">
            今日のDiscordログを収集して posts に下書きを作成します。
          </div>
          <button
            onClick={() => generate("today")}
            disabled={loadingRange !== null}
            className="mt-4 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-50"
          >
            生成する
          </button>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            WEEK
          </div>
          <div className="mt-3 text-lg font-semibold text-zinc-950">
            指定週の下書きを生成
          </div>
          <div className="mt-2 text-sm leading-6 text-zinc-500">
            選んだ日を含む月曜〜日曜のログを収集します。
          </div>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Week date
          </label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-amber-400"
          />
          <button
            onClick={() => generate("week", { date })}
            disabled={loadingRange !== null}
            className="mt-4 rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-50"
          >
            生成する
          </button>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            DATE
          </div>
          <div className="mt-3 text-lg font-semibold text-zinc-950">
            指定日の下書きを生成
          </div>
          <div className="mt-2 text-sm leading-6 text-zinc-500">
            選んだ1日分のDiscordログを収集して下書きを作成します。
          </div>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-emerald-400"
          />
          <button
            onClick={() => generate("date", { date })}
            disabled={loadingRange !== null}
            className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
          >
            生成する
          </button>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-violet-300 hover:shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
            PERIOD
          </div>
          <div className="mt-3 text-lg font-semibold text-zinc-950">
            指定期間の下書きを生成
          </div>
          <div className="mt-2 text-sm leading-6 text-zinc-500">
            開始日から終了日までのログをまとめて収集します。
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Start
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm font-normal text-zinc-950 outline-none transition focus:border-violet-400"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              End
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm font-normal text-zinc-950 outline-none transition focus:border-violet-400"
              />
            </label>
          </div>
          <button
            onClick={() => generate("period", { startDate, endDate })}
            disabled={loadingRange !== null}
            className="mt-4 rounded-md bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:opacity-50"
          >
            生成する
          </button>
        </section>
      </div>

      {loadingRange && (
        <p className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
          {loadingRange} の生成を開始しています...
        </p>
      )}
    </main>
  );
}

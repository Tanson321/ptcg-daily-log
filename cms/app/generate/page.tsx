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
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← 下書き一覧へ
      </Link>

      <h1 className="mt-4 text-3xl font-bold">生成</h1>

      <p className="mt-3 text-gray-600">
        GitHub Actionsを起動して、Discordログの収集と下書き生成を行います。
      </p>

      <div className="mt-8 grid gap-4">
        <button
          onClick={() => generate("today")}
          disabled={loadingRange !== null}
          className="rounded-2xl border p-5 text-left hover:bg-gray-50 disabled:opacity-50"
        >
          <div className="text-lg font-semibold">今日の下書きを生成</div>
          <div className="mt-1 text-sm text-gray-500">
            今日のDiscordログを収集して posts に下書きを作成します。
          </div>
        </button>

        <button
          onClick={() => generate("week")}
          disabled={loadingRange !== null}
          className="rounded-2xl border p-5 text-left hover:bg-gray-50 disabled:opacity-50"
        >
          <div className="text-lg font-semibold">今週の下書きを生成</div>
          <div className="mt-1 text-sm text-gray-500">
            今週分のDiscordログを収集して posts に週次下書きを作成します。
          </div>
        </button>
      </div>

      {loadingRange && (
        <p className="mt-6 text-sm text-gray-500">
          {loadingRange} の生成を開始しています...
        </p>
      )}
    </main>
  );
}

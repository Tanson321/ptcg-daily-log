"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { postHref, type PublishedPost } from "@/lib/posts";

function matches(post: PublishedPost, query: string) {
  if (!query) return true;

  const normalized = query.toLowerCase();

  return [
    post.title,
    post.summary,
    post.tags.join(" "),
    post.searchText,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

export default function PostSearch({ posts }: { posts: PublishedPost[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => posts.filter((post) => matches(post, query)).slice(0, 12),
    [posts, query],
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Search
      </label>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="カード名・タグ・本文で検索"
        className="mt-3 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
      />

      {query ? (
        <div className="mt-3 grid gap-2">
          {results.length > 0 ? (
            results.map((post) => (
              <Link
                key={post.slug}
                href={postHref(post.slug)}
                className="rounded-md px-2 py-2 text-sm transition hover:bg-zinc-50"
              >
                <div className="font-medium text-zinc-950">{post.title}</div>
                <div className="mt-1 font-mono text-xs text-zinc-500">
                  {post.date}
                </div>
              </Link>
            ))
          ) : (
            <p className="px-2 py-3 text-sm text-zinc-500">
              該当する記事はありません。
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}

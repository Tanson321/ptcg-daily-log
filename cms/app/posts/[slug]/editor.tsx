"use client";

import { useMemo, useState } from "react";
import { parseMarkdownPost, serializeMarkdownPost } from "@/lib/markdown";

type Props = {
  slug: string;
  initialContent: string;
};

export default function Editor({ slug, initialContent }: Props) {
  const initialPost = useMemo(
    () => parseMarkdownPost(initialContent),
    [initialContent],
  );

  const [title, setTitle] = useState(initialPost.title);
  const [date, setDate] = useState(initialPost.date);
  const [type, setType] = useState(initialPost.type);
  const [source, setSource] = useState(initialPost.source);
  const [tags, setTags] = useState(initialPost.tags.join(", "));
  const [summary, setSummary] = useState(initialPost.summary);
  const [body, setBody] = useState(initialPost.body);

  const [saving, setSaving] = useState(false);

  const content = serializeMarkdownPost({
    title,
    date,
    type,
    source,
    tags: tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    summary,
    body,
  });

  async function save() {
    try {
      setSaving(true);

      const res = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          content,
        }),
      });

      if (!res.ok) {
        throw new Error("save failed");
      }

      alert("保存した");
    } catch (error) {
      console.error(error);
      alert("保存失敗");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    try {
      setSaving(true);

      const saveRes = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          content,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("save failed");
      }

      const publishRes = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
        }),
      });

      if (!publishRes.ok) {
        throw new Error("publish failed");
      }

      alert("公開用へコピーした");
    } catch (error) {
      console.error(error);
      alert("公開失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Title
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Date
            </label>

            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Type
            </label>

            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Source
            </label>

            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Tags
            </label>

            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ドラパルト, メタ読み"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Summary
          </label>

          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="min-h-[120px] w-full rounded-2xl border border-zinc-200 p-4 text-sm leading-7"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Body
        </label>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[70vh] w-full rounded-3xl border border-zinc-200 bg-white p-6 font-mono text-sm leading-7"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>

        <button
          onClick={publish}
          disabled={saving}
          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "公開中..." : "公開"}
        </button>
      </div>
    </div>
  );
}

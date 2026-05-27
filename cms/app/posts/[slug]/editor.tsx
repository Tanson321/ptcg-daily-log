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
  const [primaryImage, setPrimaryImage] = useState(initialPost.primaryImage);
  const [body, setBody] = useState(initialPost.body);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
    primaryImage,
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

  async function uploadDeckImage(file: File | null) {
    if (!file) return;

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("slug", slug);
      formData.append("file", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || "image upload failed");
      }

      const data = await res.json();
      setPrimaryImage(data.primaryImage);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "画像アップロード失敗");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="sticky top-0 z-10 -mx-6 border-b border-zinc-200 bg-zinc-50/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-zinc-500">{slug}</p>
            <p className="truncate text-sm font-medium text-zinc-900">
              {title || "Untitled draft"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>

            <button
              onClick={publish}
              disabled={saving}
              className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-800 disabled:opacity-50"
            >
              {saving ? "公開中..." : "公開"}
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">Metadata</h2>
            <p className="mt-1 text-sm text-zinc-500">
              一覧表示と公開ページに使う情報です。
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Title
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
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
              className="w-full rounded-lg border border-zinc-200 px-4 py-3 font-mono text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Type
            </label>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
              <option value="note">note</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Source
            </label>

            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="ai">ai</option>
              <option value="manual">manual</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Tags
            </label>

            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ドラパルト, メタ読み"
              className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
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
            className="min-h-[112px] w-full rounded-lg border border-zinc-200 p-4 text-sm leading-7 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Primary image
            </label>

            <input
              value={primaryImage}
              onChange={(e) => setPrimaryImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100">
                {uploadingImage ? "アップロード中..." : "画像をアップロード"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  disabled={uploadingImage}
                  onChange={(e) => uploadDeckImage(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>

              {primaryImage ? (
                <button
                  onClick={() => setPrimaryImage("")}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
                >
                  画像を外す
                </button>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage}
                alt=""
                className="aspect-video h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center px-4 text-center text-sm text-zinc-500">
                Primary imageなし
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-zinc-700">
            Body
          </label>
          <span className="font-mono text-xs text-zinc-500">
            {body.length.toLocaleString()} chars
          </span>
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[70vh] w-full rounded-lg border border-zinc-200 bg-white p-5 font-mono text-sm leading-7 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        />
      </section>

      <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
        保存すると下書きに反映され、公開すると published
        にコピーして静的サイト生成を起動します。
      </div>
    </div>
  );
}

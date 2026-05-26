"use client";

import { useState } from "react";

type Props = {
  slug: string;
  initialContent: string;
};

export default function Editor({ slug, initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

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
    <div className="mt-8">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[70vh] w-full rounded-2xl border p-4 font-mono text-sm leading-7"
      />

      <button
        onClick={save}
        disabled={saving}
        className="mt-4 rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {saving ? "保存中..." : "保存"}
      </button>
      <button
        onClick={publish}
        disabled={saving}
        className="mt-4 ml-3 rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {saving ? "公開中..." : "公開"}
      </button>
    </div>
  );
}

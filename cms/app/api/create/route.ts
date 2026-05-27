import { NextRequest, NextResponse } from "next/server";
import { getGitHubFile, putGitHubFile } from "@/lib/github";
import { serializeMarkdownPost } from "@/lib/markdown";

function isSafeSlug(slug: string) {
  return /^[a-z0-9][a-z0-9._-]*\.md$/i.test(slug);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const slug = body.slug;
  const title = body.title;
  const date = body.date;

  if (
    typeof slug !== "string" ||
    typeof title !== "string" ||
    typeof date !== "string"
  ) {
    return NextResponse.json(
      { error: "slug, title, and date are required" },
      { status: 400 },
    );
  }

  if (!isSafeSlug(slug)) {
    return NextResponse.json(
      { error: "slug must be a safe markdown filename" },
      { status: 400 },
    );
  }

  const filePath = `posts/${slug}`;
  const trimmedTitle = title.trim() || "Untitled note";

  try {
    await getGitHubFile(filePath);

    return NextResponse.json(
      { error: "draft already exists" },
      { status: 409 },
    );
  } catch {
    const content = serializeMarkdownPost({
      title: trimmedTitle,
      date,
      type: "note",
      source: "manual",
      tags: [],
      summary: "",
      primaryImage: "",
      body: `# ${trimmedTitle}

## 概要


## 目次

- [考察](#考察)
- [デッキ・カードメモ](#デッキカードメモ)
- [検証したいこと](#検証したいこと)

## 考察


## デッキ・カードメモ


## 検証したいこと


## メモ

`,
    });

    await putGitHubFile({
      path: filePath,
      content,
      message: `create manual note ${slug}`,
    });

    return NextResponse.json({
      ok: true,
      slug,
    });
  }
}

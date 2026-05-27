import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function safeBaseName(value: string) {
  return value
    .replace(/\.md$/i, "")
    .replace(/[^a-z0-9._-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is required" },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const slug = formData.get("slug");

  if (!(file instanceof File) || typeof slug !== "string") {
    return NextResponse.json(
      { error: "file and slug are required" },
      { status: 400 },
    );
  }

  const extension = EXTENSIONS[file.type];

  if (!extension) {
    return NextResponse.json(
      { error: "image must be jpeg, png, webp, or gif" },
      { status: 400 },
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "image must be 5MB or smaller" },
      { status: 400 },
    );
  }

  const filename = `${Date.now()}.${extension}`;
  const pathname = `assets/images/${safeBaseName(slug) || "post"}/${filename}`;
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return NextResponse.json({
    ok: true,
    path: blob.pathname,
    primaryImage: blob.url,
  });
}

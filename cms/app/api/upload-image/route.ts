import { NextRequest, NextResponse } from "next/server";
import { getGitHubFile, putGitHubFileBase64 } from "@/lib/github";

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const branch = process.env.GITHUB_BRANCH || "main";

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

function rawUrlFor(path: string) {
  if (!owner || !repo) return "";

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

export async function POST(request: NextRequest) {
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

  const filename = `${safeBaseName(slug) || "deck"}-${Date.now()}.${extension}`;
  const path = `docs/assets/decks/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let sha: string | undefined;

  try {
    const current = await getGitHubFile(path);
    sha = current.sha;
  } catch {
    sha = undefined;
  }

  await putGitHubFileBase64({
    path,
    encodedContent: buffer.toString("base64"),
    sha,
    message: `upload deck image ${filename}`,
  });

  return NextResponse.json({
    ok: true,
    path,
    primaryImage: rawUrlFor(path),
  });
}

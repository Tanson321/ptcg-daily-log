import { NextRequest, NextResponse } from "next/server";
import { getGitHubFile, putGitHubFile } from "@/lib/github";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const slug = body.slug;
  const content = body.content;

  if (typeof slug !== "string" || typeof content !== "string") {
    return NextResponse.json(
      { error: "slug and content are required" },
      { status: 400 },
    );
  }

  const filePath = `posts/${slug}`;
  const current = await getGitHubFile(filePath);

  await putGitHubFile({
    path: filePath,
    content,
    sha: current.sha,
    message: `update draft ${slug}`,
  });

  return NextResponse.json({ ok: true });
}

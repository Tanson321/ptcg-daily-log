import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

const POSTS_DIR = path.join(process.cwd(), "..", "posts");

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

  const filePath = path.join(POSTS_DIR, slug);

  await fs.writeFile(filePath, content, "utf-8");

  return NextResponse.json({ ok: true });
}

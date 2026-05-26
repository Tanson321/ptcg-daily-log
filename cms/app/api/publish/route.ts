import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

const ROOT_DIR = path.join(process.cwd(), "..");
const POSTS_DIR = path.join(ROOT_DIR, "posts");
const PUBLISHED_DIR = path.join(ROOT_DIR, "published");

async function run(command: string, args: string[]) {
  const result = await execFileAsync(command, args, {
    cwd: ROOT_DIR,
  });

  return result;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const slug = body.slug;

  if (typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const srcPath = path.join(POSTS_DIR, slug);
  const destPath = path.join(PUBLISHED_DIR, slug);

  const content = await fs.readFile(srcPath, "utf-8");

  await fs.mkdir(PUBLISHED_DIR, { recursive: true });
  await fs.writeFile(destPath, content, "utf-8");

  await run("git", ["pull", "--rebase", "--autostash"]);
  await run("npm", ["run", "site"]);
  await run("git", ["add", "posts", "published", "docs"]);
  await run("git", ["commit", "-m", `publish ${slug}`]).catch((error) => {
    const stderr = String(error?.stderr ?? "");
    const stdout = String(error?.stdout ?? "");

    if (
      stderr.includes("nothing to commit") ||
      stdout.includes("nothing to commit")
    ) {
      return;
    }

    throw error;
  });

  await run("git", ["push"]);

  return NextResponse.json({
    ok: true,
    published: slug,
  });
}

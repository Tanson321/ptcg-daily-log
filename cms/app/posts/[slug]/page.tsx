import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import Editor from "./editor";

const POSTS_DIR = path.join(process.cwd(), "..", "posts");

async function getPost(slug: string) {
  const filePath = path.join(POSTS_DIR, slug);

  return await fs.readFile(filePath, "utf-8");
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const decodedSlug = decodeURIComponent(slug);

  const content = await getPost(decodedSlug);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← 戻る
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{decodedSlug}</h1>

      {/* <pre className="mt-8 overflow-x-auto rounded-2xl border bg-gray-50 p-6 whitespace-pre-wrap text-sm leading-7">
        {content}
      </pre> */}
      <Editor slug={decodedSlug} initialContent={content} />
    </main>
  );
}

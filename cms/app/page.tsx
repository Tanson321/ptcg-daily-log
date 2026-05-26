import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

const POSTS_DIR = path.join(process.cwd(), "..", "posts");

async function getDrafts() {
  const files = await fs.readdir(POSTS_DIR);

  return files
    .filter((file) => file.endsWith(".md"))
    .sort()
    .reverse();
}

export default async function Home() {
  const drafts = await getDrafts();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold">ルカCMS</h1>

      <p className="mt-3 text-gray-600">
        AIが生成した下書き一覧です。ここから確認・編集・公開します。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">下書き</h2>

        <ul className="mt-4 space-y-3">
          {drafts.map((file) => (
            <li key={file} className="rounded-xl border p-4">
              <Link
                href={`/posts/${encodeURIComponent(file)}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {file}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

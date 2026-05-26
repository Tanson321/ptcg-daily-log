import { listGitHubDirectory } from "@/lib/github";
import Link from "next/link";

async function getDrafts() {
  const files = await listGitHubDirectory("posts");

  return files

    .filter((file) => file.type === "file" && file.name.endsWith(".md"))

    .map((file) => file.name)

    .sort()

    .reverse();
}

export default async function Home() {
  const drafts = await getDrafts();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold">PTCG-CMS</h1>
      <div className="mt-6">
        <Link
          href="/generate"
          className="inline-flex items-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-md"
        >
          ⚡ Generate Drafts
        </Link>
      </div>
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

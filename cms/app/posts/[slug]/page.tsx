import { getGitHubFile } from "@/lib/github";
import Link from "next/link";
import Editor from "./editor";

async function getPost(slug: string) {
  const file = await getGitHubFile(`posts/${slug}`);
  return file.content;
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
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
      <Link href="/" className="text-sm font-medium text-cyan-700 hover:text-cyan-900">
        下書き一覧へ
      </Link>

      <header className="mt-5 border-b border-zinc-200 pb-5">
        <p className="font-mono text-xs text-zinc-500">{decodedSlug}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
          Edit draft
        </h1>
      </header>

      <Editor slug={decodedSlug} initialContent={content} />
    </main>
  );
}

import { listGitHubDirectory } from "@/lib/github";
import { getGitHubFile } from "@/lib/github";
import { parseMarkdownPost } from "@/lib/markdown";
import Link from "next/link";
import NewNoteForm from "./new-note-form";

async function getDrafts() {
  const files = await listGitHubDirectory("posts");

  const draftFiles = files
    .filter((file) => file.type === "file" && file.name.endsWith(".md"))
    .map((file) => file.name)
    .sort()
    .reverse();

  return await Promise.all(
    draftFiles.map(async (name) => {
      const file = await getGitHubFile(`posts/${name}`);
      const post = parseMarkdownPost(file.content);

      return {
        name,
        ...post,
      };
    }),
  );
}

function formatDate(date: string) {
  if (!date) return "No date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

export default async function Home() {
  const drafts = await getDrafts();
  const dailyCount = drafts.filter((draft) => draft.type === "daily").length;
  const weeklyCount = drafts.filter((draft) => draft.type === "weekly").length;
  const periodCount = drafts.filter((draft) => draft.type === "period").length;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 sm:px-8">
      <header className="border-b border-zinc-200 pb-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
              LUKA PTCG NOTES
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
              Draft desk
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              Discordから生成した考察ログを確認して、編集し、公開用の記事へ送る場所。
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <div className="text-xs text-zinc-500">Drafts</div>
              <div className="mt-1 font-mono text-xl font-semibold">
                {drafts.length}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <div className="text-xs text-zinc-500">Daily</div>
              <div className="mt-1 font-mono text-xl font-semibold">
                {dailyCount}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <div className="text-xs text-zinc-500">Weekly</div>
              <div className="mt-1 font-mono text-xl font-semibold">
                {weeklyCount}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <div className="text-xs text-zinc-500">Period</div>
              <div className="mt-1 font-mono text-xl font-semibold">
                {periodCount}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">下書き</h2>
          <p className="mt-1 text-sm text-zinc-500">
            生成された記事を、日付の新しい順に表示しています。
          </p>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:items-end">
          <NewNoteForm />

          <Link
            href="/generate"
            className="inline-flex items-center rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Generate
          </Link>
        </div>
      </section>

      <section className="mt-5">
        {drafts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center">
            <p className="text-sm font-medium text-zinc-800">
              下書きはまだありません。
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              まずは今日か今週のログ生成を起動してください。
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
          {drafts.map((file) => (
            <li
              key={file.name}
              className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-cyan-300 hover:shadow-sm"
            >
              <Link
                href={`/posts/${encodeURIComponent(file.name)}`}
                className="block"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className="font-mono">{file.name}</span>
                      <span>・</span>
                      <span>{formatDate(file.date)}</span>
                      <span className="rounded-md bg-cyan-50 px-2 py-0.5 font-medium text-cyan-800">
                        {file.type || "draft"}
                      </span>
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
                        {file.source || "source"}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-zinc-950">
                      {file.title || "Untitled draft"}
                    </h3>

                    {file.summary ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                        {file.summary}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1 md:max-w-56 md:justify-end">
                    {file.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </li>
          ))}
          </ul>
        )}
      </section>
    </main>
  );
}

import Link from "next/link";
import {
  getArchiveMonths,
  getTagCounts,
  type PublishedPost,
} from "@/lib/posts";

export default function ArchiveSidebar({ posts }: { posts: PublishedPost[] }) {
  const months = getArchiveMonths(posts);
  const tags = getTagCounts(posts);

  return (
    <aside className="space-y-8 border-zinc-200 lg:sticky lg:top-8 lg:border-r lg:pr-8">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Archive
        </h2>
        <nav className="mt-3 grid gap-1">
          {months.map((month) => (
            <Link
              key={month.key}
              href={`/?month=${month.key}`}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
            >
              <span>
                {month.year}/{month.month}
              </span>
              <span className="font-mono text-xs text-zinc-400">
                {month.count}
              </span>
            </Link>
          ))}
        </nav>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Tags
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/?tag=${encodeURIComponent(tag)}`}
              className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 transition hover:bg-zinc-200"
            >
              #{tag} <span className="text-zinc-400">{count}</span>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}

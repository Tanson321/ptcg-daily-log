import Link from "next/link";
import {
  getArchiveMonths,
  getTagCounts,
  type PublishedPost,
} from "@/lib/posts";

const MAX_VISIBLE_TAGS = 5;
const MAX_VISIBLE_MONTHS = 6;

export default function ArchiveSidebar({ posts }: { posts: PublishedPost[] }) {
  const months = getArchiveMonths(posts).slice(0, MAX_VISIBLE_MONTHS);
  const tags = getTagCounts(posts).slice(0, MAX_VISIBLE_TAGS);

  return (
    <aside className="space-y-8 text-sm lg:sticky lg:top-8 lg:self-start">
      <section className="border-t border-zinc-200 pt-5">
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

      {tags.length > 0 ? (
        <section className="border-t border-zinc-200 pt-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Popular tags
          </h2>
          <div className="mt-3 grid gap-1">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                <span className="truncate">#{tag}</span>
                <span className="ml-3 font-mono text-xs text-zinc-400">
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  );
}

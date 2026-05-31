import Link from "next/link";
import ArchiveSidebar from "@/components/archive-sidebar";
import PostCard from "@/components/post-card";
import PostSearch from "@/components/post-search";
import { getPosts } from "@/lib/posts";

const POSTS_PER_PAGE = 5;
type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

type Props = {
  searchParams: Promise<{
    tag?: string;
    month?: string;
    page?: string;
  }>;
};

function parsePage(value: string | undefined) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) return 1;

  return parsed;
}

function createPageHref({
  tag,
  month,
  page,
}: {
  tag?: string;
  month?: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (tag) params.set("tag", tag);
  if (month) params.set("month", month);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function createPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push("start-ellipsis");
  }

  for (let pageNumber = start; pageNumber <= end; pageNumber++) {
    items.push(pageNumber);
  }

  if (end < totalPages - 1) {
    items.push("end-ellipsis");
  }

  items.push(totalPages);

  return items;
}

export default async function Home({ searchParams }: Props) {
  const posts = await getPosts();
  const { tag, month, page } = await searchParams;

  const filteredPosts = posts.filter((post) => {
    if (tag && !post.tags.includes(tag)) return false;
    if (month && `${post.year}-${post.month}` !== month) return false;
    return true;
  });

  const filterLabel = tag
    ? `#${tag}`
    : month
      ? month.replace("-", "/")
      : "";
  const latestPost = posts[0];
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / POSTS_PER_PAGE),
  );
  const currentPage = Math.min(parsePage(page), totalPages);
  const pageStart = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(
    pageStart,
    pageStart + POSTS_PER_PAGE,
  );
  const paginationItems = createPaginationItems(currentPage, totalPages);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="border-b border-zinc-200 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
          LUKA PTCG NOTES
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          PTCG Thought Log
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600">
          Discord上のポケカ考察、手書きメモ、検証したい仮説をまとめた思考アーカイブ。
        </p>

        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-zinc-500">記事</dt>
            <dd className="mt-1 font-mono text-zinc-950">{posts.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">表示中</dt>
            <dd className="mt-1 font-mono text-zinc-950">
              {filteredPosts.length}
            </dd>
          </div>
          {latestPost ? (
            <div>
              <dt className="text-xs text-zinc-500">最新</dt>
              <dd className="mt-1 font-mono text-zinc-950">
                {latestPost.date}
              </dd>
            </div>
          ) : null}
        </dl>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 space-y-6">
          <div id="search">
            <PostSearch posts={posts} />
          </div>

          {(tag || month) ? (
            <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 pb-4 text-sm">
              <span className="text-zinc-500">現在の絞り込み</span>
              <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">
                {filterLabel}
              </span>
              <Link
                href="/"
                className="text-zinc-500 transition hover:text-zinc-950"
              >
                すべて
              </Link>
            </div>
          ) : null}

          <section id="latest" className="grid gap-4 scroll-mt-24">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-950">
                  {filterLabel ? "Filtered posts" : "Latest posts"}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {filteredPosts.length === 0
                    ? "条件に合う記事はありません。"
                    : `${filteredPosts.length}件中 ${pageStart + 1}-${Math.min(
                        pageStart + paginatedPosts.length,
                        filteredPosts.length,
                      )}件を表示`}
                </p>
              </div>
            </div>

            {filteredPosts.length > 0 ? (
              paginatedPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center">
                <p className="text-sm text-zinc-500">記事がありません。</p>
              </div>
            )}
          </section>

          {totalPages > 1 ? (
            <nav
              className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-5 text-sm"
              aria-label="Pagination"
            >
              <Link
                href={createPageHref({
                  tag,
                  month,
                  page: Math.max(1, currentPage - 1),
                })}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1
                    ? "pointer-events-none rounded-md border border-zinc-200 px-3 py-2 text-zinc-300"
                    : "rounded-md border border-zinc-200 px-3 py-2 text-zinc-700 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-950"
                }
              >
                前へ
              </Link>

              <div className="flex flex-wrap items-center gap-1">
                {paginationItems.map((item) => {
                  if (typeof item !== "number") {
                    return (
                      <span
                        key={item}
                        className="px-2 py-2 text-zinc-400"
                        aria-hidden="true"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={item}
                      href={createPageHref({ tag, month, page: item })}
                      aria-current={item === currentPage ? "page" : undefined}
                      className={
                        item === currentPage
                          ? "rounded-md bg-zinc-950 px-3 py-2 font-medium text-white"
                          : "rounded-md px-3 py-2 text-zinc-600 transition hover:bg-white hover:text-zinc-950"
                      }
                    >
                      {item}
                    </Link>
                  );
                })}
              </div>

              <Link
                href={createPageHref({
                  tag,
                  month,
                  page: Math.min(totalPages, currentPage + 1),
                })}
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none rounded-md border border-zinc-200 px-3 py-2 text-zinc-300"
                    : "rounded-md border border-zinc-200 px-3 py-2 text-zinc-700 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-950"
                }
              >
                次へ
              </Link>
            </nav>
          ) : null}
        </div>

        <div id="discover" className="scroll-mt-24">
          <ArchiveSidebar posts={posts} />
        </div>
      </div>
    </main>
  );
}

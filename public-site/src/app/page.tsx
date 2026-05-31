import Link from "next/link";
import ArchiveSidebar from "@/components/archive-sidebar";
import PostCard from "@/components/post-card";
import PostSearch from "@/components/post-search";
import { getPosts } from "@/lib/posts";

type Props = {
  searchParams: Promise<{
    tag?: string;
    month?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const posts = await getPosts();
  const { tag, month } = await searchParams;

  const filteredPosts = posts.filter((post) => {
    if (tag && !post.tags.includes(tag)) return false;
    if (month && `${post.year}-${post.month}` !== month) return false;
    return true;
  });

  const heading = tag
    ? `#${tag}`
    : month
      ? month.replace("-", "/")
      : "PTCG Thought Log";
  const latestPost = posts[0];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="border-b border-zinc-200 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
          LUKA PTCG NOTES
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          {heading}
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
          <PostSearch posts={posts} />

          {(tag || month) ? (
            <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 pb-4 text-sm">
              <span className="text-zinc-500">Filter</span>
              <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">
                {heading}
              </span>
              <Link
                href="/"
                className="text-zinc-500 transition hover:text-zinc-950"
              >
                すべて
              </Link>
            </div>
          ) : null}

          <section className="grid gap-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center">
                <p className="text-sm text-zinc-500">記事がありません。</p>
              </div>
            )}
          </section>
        </div>

        <ArchiveSidebar posts={posts} />
      </div>
    </main>
  );
}

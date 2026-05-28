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

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[16rem_1fr]">
      <ArchiveSidebar posts={posts} />

      <div className="min-w-0">
        <header className="border-b border-zinc-200 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
            LUKA PTCG NOTES
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
            {heading}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600">
            Discord上のポケカ考察、手書きメモ、検証したい仮説をまとめた思考アーカイブ。
          </p>
        </header>

        <div className="mt-6">
          <PostSearch posts={posts} />
        </div>

        <section className="mt-6 grid gap-4">
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
    </main>
  );
}

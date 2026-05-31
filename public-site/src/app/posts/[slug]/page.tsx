import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { postSourceLabel, postTypeLabel } from "@/lib/post-labels";
import { getPost, getPosts, postHref, SITE_URL } from "@/lib/posts";

const MAX_VISIBLE_TAGS = 5;

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(decodeURIComponent(slug));

  if (!post) {
    return {
      title: "Not found",
    };
  }

  const url = `${SITE_URL}${postHref(post.slug)}`;
  const images = post.primaryImage ? [post.primaryImage] : [];

  return {
    title: post.title,
    description: post.summary || post.title,
    openGraph: {
      title: post.title,
      description: post.summary || post.title,
      type: "article",
      url,
      images,
    },
    twitter: {
      card: post.primaryImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.summary || post.title,
      images,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({
    slug: post.slug.replace(/\.md$/, ""),
  }));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(decodeURIComponent(slug));

  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
      <Link
        href="/"
        className="text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
      >
        一覧へ戻る
      </Link>

      <article className="mt-8">
        <header className="border-b border-zinc-200 pb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <span className="font-mono">{post.date}</span>
            <span>•</span>
            <span>{postTypeLabel(post.type)}</span>
            <span>•</span>
            <span>{postSourceLabel(post.source)}</span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950">
            {post.title}
          </h1>

          {post.summary ? (
            <p className="mt-4 text-base leading-7 text-zinc-600">
              {post.summary}
            </p>
          ) : null}

          {post.primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.primaryImage}
              alt=""
              className="mt-6 aspect-video w-full rounded-lg border border-zinc-200 object-cover"
            />
          ) : null}

          {post.tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 transition hover:bg-zinc-200"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          ) : null}
        </header>

        <div
          className="prose mt-8 max-w-none text-zinc-800"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    </main>
  );
}

import Link from "next/link";
import { postHref, type PublishedPost } from "@/lib/posts";

const MAX_VISIBLE_TAGS = 5;

type PostCardSize = "compact" | "comfortable" | "responsive";

type Props = {
  post: PublishedPost;
  size?: PostCardSize;
};

function sourceLabel(source: string) {
  return source === "manual" ? "手動" : "AI";
}

function typeLabel(type: string) {
  if (type === "daily") return "daily";
  if (type === "weekly") return "weekly";
  if (type === "period") return "period";
  if (type === "note") return "note";
  return type;
}

function CompactPostCard({ post }: { post: PublishedPost }) {
  return (
    <article className="border-b border-zinc-200 bg-white">
      <Link
        href={postHref(post.slug)}
        className="grid grid-cols-[minmax(0,1fr)_5.75rem] gap-3 px-3 py-3 transition hover:bg-zinc-50"
      >
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-5 text-zinc-950">
            {post.title}
          </h2>

          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
            <span className="font-mono">{post.date}</span>
            <span>{typeLabel(post.type)}</span>
            <span>{sourceLabel(post.source)}</span>
          </div>
        </div>

        {post.primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.primaryImage}
            alt=""
            className="h-16 w-[5.75rem] rounded-md border border-zinc-200 object-cover"
          />
        ) : (
          <div className="flex h-16 w-[5.75rem] items-center justify-center rounded-md border border-zinc-200 bg-zinc-50">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              {typeLabel(post.type)}
            </span>
          </div>
        )}
      </Link>
    </article>
  );
}

function ComfortablePostCard({ post }: { post: PublishedPost }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-cyan-300 hover:shadow-sm">
      <Link href={postHref(post.slug)} className="block">
        {post.primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.primaryImage}
            alt=""
            className="mb-5 aspect-video w-full rounded-md border border-zinc-200 object-cover"
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="font-mono">{post.date}</span>
          <span className="rounded-md bg-cyan-50 px-2 py-0.5 font-medium text-cyan-800">
            {typeLabel(post.type)}
          </span>
          <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
            {sourceLabel(post.source)}
          </span>
        </div>

        <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">
          {post.title}
        </h2>

        {post.summary ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
            {post.summary}
          </p>
        ) : null}

        {post.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </Link>
    </article>
  );
}

export default function PostCard({ post, size = "responsive" }: Props) {
  if (size === "compact") {
    return <CompactPostCard post={post} />;
  }

  if (size === "comfortable") {
    return <ComfortablePostCard post={post} />;
  }

  return (
    <>
      <div className="sm:hidden">
        <CompactPostCard post={post} />
      </div>
      <div className="hidden sm:block">
        <ComfortablePostCard post={post} />
      </div>
    </>
  );
}

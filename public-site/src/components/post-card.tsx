import Link from "next/link";
import { postSourceLabel, postTypeLabel } from "@/lib/post-labels";
import { postHref, type PublishedPost } from "@/lib/posts";

const MAX_VISIBLE_TAGS = 5;

type PostCardSize = "compact" | "comfortable" | "responsive";

type Props = {
  post: PublishedPost;
  size?: PostCardSize;
};

function NoImageThumbnail() {
  return (
    <div
      role="img"
      aria-label="画像なし"
      className="relative flex h-16 w-[5.75rem] shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-100"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, transparent 0 13px, rgba(113,113,122,0.5) 14px 17px, transparent 18px), linear-gradient(to bottom, transparent calc(50% - 1px), rgba(113,113,122,0.42) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)), radial-gradient(circle at 50% 50%, rgba(113,113,122,0.18) 0 36px, transparent 37px), linear-gradient(135deg, #fafafa, #e4e4e7)",
        }}
      />
      <span className="relative z-10 rounded bg-white/75 px-1.5 py-0.5 text-[9px] font-semibold leading-none tracking-[0.12em] text-zinc-500">
        NO IMAGE
      </span>
    </div>
  );
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
            <span>{postTypeLabel(post.type)}</span>
            <span>{postSourceLabel(post.source)}</span>
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
          <NoImageThumbnail />
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
            {postTypeLabel(post.type)}
          </span>
          <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
            {postSourceLabel(post.source)}
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

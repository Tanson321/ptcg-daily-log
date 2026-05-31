import Link from "next/link";
import { postHref, type PublishedPost } from "@/lib/posts";

const MAX_VISIBLE_TAGS = 5;

export default function PostCard({ post }: { post: PublishedPost }) {
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
            {post.type}
          </span>
          <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
            {post.source === "manual" ? "手動" : "AI"}
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

import matter from "gray-matter";
import { marked } from "marked";

export type PublishedPost = {
  slug: string;
  path: string;
  url: string;
  title: string;
  date: string;
  year: string;
  month: string;
  type: string;
  source: string;
  tags: string[];
  summary: string;
  primaryImage: string;
  searchText: string;
};

export type ArchiveMonth = {
  key: string;
  year: string;
  month: string;
  count: number;
};

const DEFAULT_INDEX_URL =
  "https://natqs7wrjzhu2j1s.public.blob.vercel-storage.com/published/index.json";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ptcg-daily-log-public.vercel.app";

function getIndexUrls() {
  const configuredUrl = process.env.NEXT_PUBLIC_PUBLISHED_INDEX_URL;

  if (!configuredUrl || configuredUrl === DEFAULT_INDEX_URL) {
    return [DEFAULT_INDEX_URL];
  }

  return [configuredUrl, DEFAULT_INDEX_URL];
}

export function postHref(slug: string) {
  return `/posts/${encodeURIComponent(slug.replace(/\.md$/, ""))}`;
}

export async function getPosts() {
  let lastError: unknown;

  for (const url of getIndexUrls()) {
    try {
      const res = await fetch(url, {
        next: {
          revalidate: 60,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch published index: ${res.status}`);
      }

      const posts = (await res.json()) as PublishedPost[];

      return posts.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.slug.localeCompare(a.slug);
      });
    } catch (error) {
      lastError = error;
    }
  }

  console.error(lastError);

  return [];
}

export async function getPost(slugWithoutExtension: string) {
  const posts = await getPosts();
  const slug = slugWithoutExtension.endsWith(".md")
    ? slugWithoutExtension
    : `${slugWithoutExtension}.md`;
  const post = posts.find((item) => item.slug === slug);

  if (!post) return null;

  const res = await fetch(post.url, {
    next: {
      revalidate: 60,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch post ${slug}: ${res.status}`);
  }

  const markdown = await res.text();
  const parsed = matter(markdown);
  const content = parsed.content.trimStart().replace(/^#\s+[^\n]*(?:\r?\n)+/, "");
  const html = marked.parse(content, {
    async: false,
  }) as string;

  return {
    ...post,
    markdown,
    html,
  };
}

export function getArchiveMonths(posts: PublishedPost[]): ArchiveMonth[] {
  const counts = new Map<string, ArchiveMonth>();

  for (const post of posts) {
    const key = `${post.year}-${post.month}`;
    const current = counts.get(key);

    if (current) {
      current.count += 1;
    } else {
      counts.set(key, {
        key,
        year: post.year,
        month: post.month,
        count: 1,
      });
    }
  }

  return Array.from(counts.values()).sort((a, b) => b.key.localeCompare(a.key));
}

export function getTagCounts(posts: PublishedPost[]) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    });
}

import { list, put } from "@vercel/blob";
import { parseMarkdownPost } from "./markdown";

export type PublishedPostIndexItem = {
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

const PUBLISHED_POSTS_PREFIX = "published/posts";
const PUBLISHED_INDEX_PATH = "published/index.json";

function normalizeDate(date: string) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date.slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}

function createSearchText({
  title,
  summary,
  tags,
  body,
}: {
  title: string;
  summary: string;
  tags: string[];
  body: string;
}) {
  return [title, summary, tags.join(" "), body]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createPublishedPostIndexItem({
  slug,
  path,
  url,
  markdown,
}: {
  slug: string;
  path: string;
  url: string;
  markdown: string;
}): PublishedPostIndexItem {
  const post = parseMarkdownPost(markdown);
  const date = normalizeDate(post.date || slug.slice(0, 10));

  return {
    slug,
    path,
    url,
    title: post.title,
    date,
    year: date.slice(0, 4),
    month: date.slice(5, 7),
    type: post.type,
    source: post.source,
    tags: post.tags,
    summary: post.summary,
    primaryImage: post.primaryImage,
    searchText: createSearchText({
      title: post.title,
      summary: post.summary,
      tags: post.tags,
      body: post.body,
    }),
  };
}

async function fetchBlobText(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch blob ${url}: ${res.status}`);
  }

  return await res.text();
}

export async function publishPostToBlob({
  slug,
  markdown,
}: {
  slug: string;
  markdown: string;
}) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required");
  }

  const path = `${PUBLISHED_POSTS_PREFIX}/${slug}`;

  const blob = await put(path, markdown, {
    access: "public",
    addRandomSuffix: false,
    contentType: "text/markdown; charset=utf-8",
  });

  return {
    path: blob.pathname,
    url: blob.url,
  };
}

async function loadPublishedIndex() {
  try {
    const { blobs } = await list({
      prefix: PUBLISHED_INDEX_PATH,
      limit: 1,
    });
    const indexBlob = blobs.find(
      (blob) => blob.pathname === PUBLISHED_INDEX_PATH,
    );

    if (!indexBlob) return [];

    const text = await fetchBlobText(indexBlob.url);
    const parsed = JSON.parse(text);

    return Array.isArray(parsed) ? (parsed as PublishedPostIndexItem[]) : [];
  } catch {
    return [];
  }
}

async function putPublishedIndex(posts: PublishedPostIndexItem[]) {
  const sortedPosts = posts.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.slug.localeCompare(a.slug);
  });

  const indexBlob = await put(
    PUBLISHED_INDEX_PATH,
    JSON.stringify(sortedPosts, null, 2),
    {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json; charset=utf-8",
    },
  );

  return {
    posts: sortedPosts,
    path: indexBlob.pathname,
    url: indexBlob.url,
  };
}

export async function upsertPublishedIndexItem(item: PublishedPostIndexItem) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required");
  }

  const posts = await loadPublishedIndex();
  const nextPosts = posts.filter((post) => post.slug !== item.slug);
  nextPosts.push(item);

  return await putPublishedIndex(nextPosts);
}

export async function rebuildPublishedIndex() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required");
  }

  const { blobs } = await list({
    prefix: `${PUBLISHED_POSTS_PREFIX}/`,
    limit: 1000,
  });

  const posts = await Promise.all(
    blobs
      .filter((blob) => blob.pathname.endsWith(".md"))
      .map(async (blob) => {
        const markdown = await fetchBlobText(blob.url);
        const slug = blob.pathname.split("/").pop() || blob.pathname;

        return createPublishedPostIndexItem({
          slug,
          path: blob.pathname,
          url: blob.url,
          markdown,
        });
      }),
  );

  return await putPublishedIndex(posts);
}

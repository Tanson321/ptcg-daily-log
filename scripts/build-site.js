import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const POSTS_DIR = "published";
const SITE_DIR = "docs";
const SITE_POSTS_DIR = path.join(SITE_DIR, "posts");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function getMarkdownFiles(dir) {
  const files = await fs.readdir(dir);

  return files
    .filter((file) => file.endsWith(".md"))
    .sort()
    .reverse();
}

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback.replace(/\.md$/, "");
}

function createLayout({ title, content }) {
  return `
<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${title}</title>

  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    body {
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        sans-serif;
    }

    .prose h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
    }

    .prose h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }

    .prose h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    .prose p {
      line-height: 1.9;
      margin-bottom: 1.2rem;
    }

    .prose ul {
      padding-left: 1.5rem;
      margin-bottom: 1.2rem;
    }

    .prose li {
      margin-bottom: 0.5rem;
    }

    .prose code {
      background: #f3f4f6;
      padding: 0.2rem 0.4rem;
      border-radius: 0.4rem;
      font-size: 0.9rem;
    }

    .prose pre {
      background: #111827;
      color: white;
      padding: 1rem;
      border-radius: 1rem;
      overflow-x: auto;
      margin-bottom: 1.5rem;
    }

    .prose blockquote {
      border-left: 4px solid #d1d5db;
      padding-left: 1rem;
      color: #6b7280;
      margin: 1.5rem 0;
    }
  </style>
</head>

<body class="bg-zinc-50 text-zinc-900">
  <div class="mx-auto max-w-3xl px-6 py-12">
    ${content}
  </div>
</body>
</html>
`;
}

async function buildPosts(files) {
  for (const file of files) {
    const src = path.join(POSTS_DIR, file);

    const markdown = await fs.readFile(src, "utf-8");
    const title = extractTitle(markdown, file);

    const html = marked.parse(markdown);

    const page = createLayout({
      title,
      content: `
        <a
          href="../index.html"
          class="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Back
        </a>

        <article class="prose mt-8 max-w-none">
          ${html}
        </article>
      `,
    });

    const outputPath = path.join(
      SITE_POSTS_DIR,
      file.replace(/\.md$/, ".html"),
    );

    await fs.writeFile(outputPath, page);
  }
}

async function buildIndex(files) {
  const posts = await Promise.all(
    files.map(async (file) => {
      const src = path.join(POSTS_DIR, file);
      const markdown = await fs.readFile(src, "utf-8");
      const title = extractTitle(markdown, file);
      const htmlFile = file.replace(/\.md$/, ".html");

      return {
        file,
        title,
        htmlFile,
      };
    }),
  );

  const links = posts
    .map((post) => {
      return `
        <a
          href="./posts/${post.htmlFile}"
          class="block rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="text-lg font-semibold">
            ${post.title}
          </div>

          <div class="mt-2 text-sm text-zinc-500">
            ${post.file.replace(/\.md$/, "")}
          </div>
        </a>
      `;
    })
    .join("\n");

  const page = createLayout({
    title: "LUKA-PTCG-NOTES",
    content: `
      <header>
        <div class="text-sm uppercase tracking-widest text-zinc-500">
          PTCG-LOG
        </div>

        <h1 class="mt-3 text-5xl font-black tracking-tight">
          PTCG Thought Log
        </h1>

        <p class="mt-6 text-lg leading-8 text-zinc-600">
          Discord上でメモした思考・議論・仮説を、
          AIが整理し、公開可能な形へ編集したログ。
        </p>
      </header>

      <section class="mt-14 space-y-5">
        ${links}
      </section>
    `,
  });

  await fs.writeFile(path.join(SITE_DIR, "index.html"), page);
}

const files = await getMarkdownFiles(POSTS_DIR);

await ensureDir(SITE_DIR);
await ensureDir(SITE_POSTS_DIR);

await buildPosts(files);

await buildIndex(files);

console.log("site built");

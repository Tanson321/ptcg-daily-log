import fs from "node:fs/promises";
import path from "node:path";

const POSTS_DIR = "posts";
const SITE_DIR = "site";
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

async function copyPosts(files) {
  for (const file of files) {
    const src = path.join(POSTS_DIR, file);
    const dest = path.join(SITE_POSTS_DIR, file);

    await fs.copyFile(src, dest);
  }
}

function createIndexHtml(files) {
  const links = files
    .map((file) => {
      return `<li><a href="./posts/${file}">${file}</a></li>`;
    })
    .join("\n");

  return `
<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>PTCG Thought Log</title>

  <style>
    body {
      font-family: sans-serif;
      max-width: 720px;
      margin: 40px auto;
      padding: 0 16px;
      line-height: 1.7;
    }

    h1 {
      margin-bottom: 32px;
    }

    ul {
      padding-left: 20px;
    }

    li {
      margin-bottom: 12px;
    }

    a {
      color: #2563eb;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  </style>
</head>

<body>
  <h1>PTCG Thought Log</h1>

  <ul>
    ${links}
  </ul>
</body>
</html>
`;
}

const files = await getMarkdownFiles(POSTS_DIR);

await ensureDir(SITE_DIR);
await ensureDir(SITE_POSTS_DIR);

await copyPosts(files);

const html = createIndexHtml(files);

await fs.writeFile(path.join(SITE_DIR, "index.html"), html);

console.log("site built");

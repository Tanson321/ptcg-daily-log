export type MarkdownPost = {
  title: string;
  date: string;
  type: string;
  source: string;
  tags: string[];
  summary: string;
  body: string;
};

const DEFAULT_POST: MarkdownPost = {
  title: "",
  date: "",
  type: "daily",
  source: "ai",
  tags: [],
  summary: "",
  body: "",
};

function parseTags(lines: string[]) {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

function parseFrontmatter(frontmatter: string) {
  const post = { ...DEFAULT_POST };
  const lines = frontmatter.split("\n");

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (line.startsWith("title:")) {
      post.title = line.replace(/^title:\s*/, "").trim();
      continue;
    }

    if (line.startsWith("date:")) {
      post.date = line.replace(/^date:\s*/, "").trim();
      continue;
    }

    if (line.startsWith("type:")) {
      post.type = line.replace(/^type:\s*/, "").trim();
      continue;
    }

    if (line.startsWith("source:")) {
      post.source = line.replace(/^source:\s*/, "").trim();
      continue;
    }

    if (line.startsWith("summary:")) {
      post.summary = line.replace(/^summary:\s*/, "").trim();
      continue;
    }

    if (line.startsWith("tags:")) {
      const tagLines: string[] = [];

      for (let tagIndex = index + 1; tagIndex < lines.length; tagIndex++) {
        const tagLine = lines[tagIndex];

        if (!tagLine.startsWith("  - ") && !tagLine.startsWith("- ")) {
          break;
        }

        tagLines.push(tagLine);
        index = tagIndex;
      }

      post.tags = parseTags(tagLines);
    }
  }

  return post;
}

function extractTitleFromBody(body: string) {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

export function parseMarkdownPost(markdown: string): MarkdownPost {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    const body = markdown.trimStart();

    return {
      ...DEFAULT_POST,
      title: extractTitleFromBody(body),
      body,
    };
  }

  const [, frontmatter, body] = match;
  const metadata = parseFrontmatter(frontmatter);
  const parsedBody = body.trimStart();

  return {
    ...metadata,
    title: metadata.title || extractTitleFromBody(parsedBody),
    body: parsedBody,
  };
}

function escapeYamlValue(value: string) {
  if (!value) return "";

  if (value.includes(":") || value.includes("#") || value.includes("\n")) {
    return JSON.stringify(value);
  }

  return value;
}

export function serializeMarkdownPost(post: MarkdownPost) {
  const tags = post.tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => `  - ${escapeYamlValue(tag)}`)
    .join("\n");

  const frontmatter = [
    "---",
    `title: ${escapeYamlValue(post.title)}`,
    `date: ${escapeYamlValue(post.date)}`,
    `type: ${escapeYamlValue(post.type)}`,
    `source: ${escapeYamlValue(post.source)}`,
    "tags:",
    tags || "  - ",
    `summary: ${escapeYamlValue(post.summary)}`,
    "---",
  ].join("\n");

  return `${frontmatter}\n\n${post.body.trimStart()}`;
}

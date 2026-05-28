import { NextResponse } from "next/server";
import { getGitHubFile, listGitHubDirectory } from "@/lib/github";
import { publishPostToBlob, rebuildPublishedIndex } from "@/lib/publication";

export async function POST() {
  const files = await listGitHubDirectory("published");
  const markdownFiles = files
    .filter((file) => file.type === "file" && file.name.endsWith(".md"))
    .map((file) => file.name)
    .sort();

  const published = await Promise.all(
    markdownFiles.map(async (slug) => {
      const file = await getGitHubFile(`published/${slug}`);
      const blob = await publishPostToBlob({
        slug,
        markdown: file.content,
      });

      return {
        slug,
        ...blob,
      };
    }),
  );

  const index = await rebuildPublishedIndex();

  return NextResponse.json({
    ok: true,
    published,
    index: {
      path: index.path,
      url: index.url,
      count: index.posts.length,
    },
  });
}

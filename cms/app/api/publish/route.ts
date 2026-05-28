import { NextRequest, NextResponse } from "next/server";
import { dispatchWorkflow, getGitHubFile, putGitHubFile } from "@/lib/github";
import { publishPostToBlob, rebuildPublishedIndex } from "@/lib/publication";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const slug = body.slug;

  if (typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const draftPath = `posts/${slug}`;
  const publishedPath = `published/${slug}`;

  const draft = await getGitHubFile(draftPath);

  let currentPublishedSha: string | undefined;

  try {
    const currentPublished = await getGitHubFile(publishedPath);
    currentPublishedSha = currentPublished.sha;
  } catch {
    currentPublishedSha = undefined;
  }

  await putGitHubFile({
    path: publishedPath,
    content: draft.content,
    sha: currentPublishedSha,
    message: `publish ${slug}`,
  });

  const blobPost = await publishPostToBlob({
    slug,
    markdown: draft.content,
  });
  const blobIndex = await rebuildPublishedIndex();

  await dispatchWorkflow({
    workflowId: "publish-pages.yml",
  });

  return NextResponse.json({
    ok: true,
    published: slug,
    blob: {
      post: blobPost,
      index: {
        path: blobIndex.path,
        url: blobIndex.url,
        count: blobIndex.posts.length,
      },
    },
  });
}

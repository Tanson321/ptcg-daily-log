const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const token = process.env.GITHUB_TOKEN;

if (!owner || !repo || !token) {
  throw new Error("GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN are required");
}

const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

export async function getGitHubFile(path: string) {
  const res = await fetch(`${baseUrl}/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }

  const data = await res.json();

  const content = Buffer.from(data.content, "base64").toString("utf-8");

  return {
    content,
    sha: data.sha as string,
  };
}

export async function listGitHubDirectory(path: string) {
  const res = await fetch(`${baseUrl}/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to list ${path}: ${res.status}`);
  }

  const data = await res.json();

  return data as Array<{
    name: string;
    path: string;
    type: string;
    sha: string;
  }>;
}

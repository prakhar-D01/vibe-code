import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";

const GITHUB_API = "https://api.github.com";

export interface GithubRepoSummary {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  private: boolean;
  defaultBranch: string;
  updatedAt: string;
  htmlUrl: string;
}

// Files/folders we don't want to pull into a playground (keeps the imported
// project small and avoids binary noise the Monaco editor can't render).
const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".vscode",
  ".idea",
  "coverage",
]);

const IGNORED_FILE_PATTERNS = [
  /\.lock$/,
  /\.png$/i,
  /\.jpe?g$/i,
  /\.gif$/i,
  /\.ico$/i,
  /\.woff2?$/i,
  /\.ttf$/i,
  /\.mp4$/i,
  /\.zip$/i,
];

const MAX_FILES = 400;
const MAX_FILE_SIZE = 300 * 1024; // 300KB per file

function githubHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubFetch(url: string, accessToken: string) {
  const response = await fetch(url, { headers: githubHeaders(accessToken) });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `GitHub API request failed (${response.status} ${response.statusText}): ${body}`,
    );
  }
  return response.json();
}

/**
 * Lists repositories the authenticated user owns or collaborates on, most
 * recently updated first.
 */
export async function listUserRepos(
  accessToken: string,
): Promise<GithubRepoSummary[]> {
  const repos = await githubFetch(
    `${GITHUB_API}/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator`,
    accessToken,
  );

  return (repos as any[]).map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner?.login,
    description: repo.description,
    private: repo.private,
    defaultBranch: repo.default_branch,
    updatedAt: repo.updated_at,
    htmlUrl: repo.html_url,
  }));
}

interface GitTreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  sha: string;
  size?: number;
}

function shouldIgnorePath(path: string): boolean {
  const segments = path.split("/");
  if (segments.some((segment) => IGNORED_DIRS.has(segment))) return true;
  if (IGNORED_FILE_PATTERNS.some((pattern) => pattern.test(path))) return true;
  return false;
}

/**
 * Fetches an entire repository's file tree + blob contents and converts it
 * into the same `TemplateFolder` shape used by local starter templates, so
 * it can be dropped straight into a new Playground's `TemplateFile.content`.
 */
export async function importRepoAsTemplateFolder(
  accessToken: string,
  owner: string,
  repo: string,
  branch?: string,
): Promise<TemplateFolder> {
  const repoInfo = await githubFetch(
    `${GITHUB_API}/repos/${owner}/${repo}`,
    accessToken,
  );
  const ref = branch || repoInfo.default_branch;

  const treeData = await githubFetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`,
    accessToken,
  );

  if (treeData.truncated) {
    console.warn(
      `GitHub tree for ${owner}/${repo}@${ref} was truncated by the API; some files may be missing.`,
    );
  }

  const blobs: GitTreeEntry[] = (treeData.tree as GitTreeEntry[])
    .filter((entry) => entry.type === "blob")
    .filter((entry) => !shouldIgnorePath(entry.path))
    .filter((entry) => (entry.size ?? 0) <= MAX_FILE_SIZE)
    .slice(0, MAX_FILES);

  const root: TemplateFolder = { folderName: repo, items: [] };

  // Fetch blob contents with limited concurrency to stay well within
  // GitHub's rate limits on larger repos.
  const CONCURRENCY = 8;
  let cursor = 0;

  async function worker() {
    while (cursor < blobs.length) {
      const index = cursor++;
      const entry = blobs[index];
      try {
        const blob = await githubFetch(
          `${GITHUB_API}/repos/${owner}/${repo}/git/blobs/${entry.sha}`,
          accessToken,
        );

        const content =
          blob.encoding === "base64"
            ? Buffer.from(blob.content, "base64").toString("utf8")
            : blob.content;

        insertFileAtPath(root, entry.path, content);
      } catch (error) {
        console.error(`Failed to fetch blob for ${entry.path}:`, error);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, blobs.length) }, worker),
  );

  return root;
}

function insertFileAtPath(
  root: TemplateFolder,
  filePath: string,
  content: string,
) {
  const segments = filePath.split("/");
  const fileName = segments.pop()!;
  const dotIndex = fileName.lastIndexOf(".");
  const filename = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const fileExtension = dotIndex > 0 ? fileName.slice(dotIndex + 1) : "";

  let currentFolder = root;

  for (const segment of segments) {
    let nextFolder = currentFolder.items.find(
      (item): item is TemplateFolder =>
        "folderName" in item && item.folderName === segment,
    );

    if (!nextFolder) {
      nextFolder = { folderName: segment, items: [] };
      currentFolder.items.push(nextFolder);
    }

    currentFolder = nextFolder;
  }

  currentFolder.items.push({ filename, fileExtension, content });
}

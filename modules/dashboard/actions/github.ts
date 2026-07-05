"use server";

import { db } from "@/lib/db";
import {
  currentUser,
  getAccountByUserIdAndProvider,
} from "@/modules/auth/actions";
import {
  importRepoAsTemplateFolder,
  listUserRepos,
  type GithubRepoSummary,
} from "@/lib/github";
import { revalidatePath } from "next/cache";

async function getGithubAccessToken(): Promise<string | null> {
  const user = await currentUser();
  if (!user?.id) return null;

  const account = await getAccountByUserIdAndProvider(user.id, "github");
  return account?.accessToken ?? null;
}

export const getGithubConnectionStatus = async () => {
  const accessToken = await getGithubAccessToken();
  return { connected: Boolean(accessToken) };
};

export const listGithubRepositories = async (): Promise<{
  repos: GithubRepoSummary[];
  error?: string;
}> => {
  const accessToken = await getGithubAccessToken();

  if (!accessToken) {
    return {
      repos: [],
      error: "GITHUB_NOT_CONNECTED",
    };
  }

  try {
    const repos = await listUserRepos(accessToken);
    return { repos };
  } catch (error) {
    console.error("Failed to list GitHub repositories:", error);
    return { repos: [], error: "GITHUB_API_ERROR" };
  }
};

export const importGithubRepository = async (params: {
  owner: string;
  repo: string;
  branch?: string;
}) => {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("You must be signed in to import a repository");
  }

  const accessToken = await getGithubAccessToken();
  if (!accessToken) {
    throw new Error("Connect your GitHub account before importing a repo");
  }

  const { owner, repo, branch } = params;

  const templateFolder = await importRepoAsTemplateFolder(
    accessToken,
    owner,
    repo,
    branch,
  );

  const playground = await db.playground.create({
    data: {
      title: repo,
      description: `Imported from github.com/${owner}/${repo}`,
      template: "GITHUB",
      userId: user.id,
      templateFiles: {
        create: {
          content: JSON.stringify(templateFolder),
        },
      },
    },
  });

  revalidatePath("/dashboard");

  return playground;
};

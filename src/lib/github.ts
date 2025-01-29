import { Octokit } from "octokit";
import axios from "axios";
import { aiSummarizeContent } from "./gemini";
import { db } from "@/server/db";

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

interface CommitProps {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAvatar: string;
    commitDate: string;
}

export const getCommitHashes = async (githubUrl: string): Promise<CommitProps[]> => {
    const owner = githubUrl.split("/")[3];
    const repo = githubUrl.split("/")[4];

    if (!owner || !repo) {
        throw new Error("Invalid GitHub URL: Unable to extract owner and repo.");
    }

    const { data } = await octokit.rest.repos.listCommits({ owner, repo });

    const sortedCommits = data.sort(
        (a: any, b: any) =>
            new Date(b.commit.author?.date).getTime() - new Date(a.commit.author?.date).getTime()
    );

    return sortedCommits.slice(0, 10).map((commit: any) => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit.author?.name ?? "",
        commitAvatar: commit.author?.avatar_url ?? "",
        commitDate: commit.commit.author?.date ?? "",
    }));
};

export const pollCommits = async (projectId: string) => {
    const { githubUrl } = await fetchProjectGithubUrl(projectId);

    const commitHashes = await getCommitHashes(githubUrl);

    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

    const summaryResponses = await Promise.allSettled(
        unprocessedCommits.map((commit) => summarizeCommit(githubUrl, commit.commitHash))
    );

    const summaries = summaryResponses.map((response) =>
        response.status === "fulfilled" ? (response.value as string) : ""
    );

    const commits = await db.commit.createMany({
        data: summaries.map((summary, index) => {
            const commit = unprocessedCommits[index];
            if (!commit) {
                throw new Error("Unexpected undefined commit.");
            }
            return {
                projectId: projectId,
                commitHash: commit.commitHash,
                commitMessage: commit.commitMessage,
                commitAuthorName: commit.commitAuthorName,
                commitAuthorAvatar: commit.commitAvatar,
                commitDate: commit.commitDate,
                summary,
            };
        }),
    });

    return commits;
};

async function summarizeCommit(githubUrl: string, commitHash: string) {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: "application/vnd.github.v3.diff",
        },
    });

    if (!data) {
        return "Not found";
    }

    return (await aiSummarizeContent(data)) || "";
}

async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            githubUrl: true,
        },
    });

    if (!project?.githubUrl) {
        throw new Error("Project has no GitHub URL.");
    }

    return { githubUrl: project.githubUrl };
}

async function filterUnprocessedCommits(
    projectId: string,
    commitHashes: CommitProps[]
): Promise<CommitProps[]> {
    const processedCommits = await db.commit.findMany({
        where: {
            projectId,
        },
        select: {
            commitHash: true,
        },
    });

    const processedCommitHashes = processedCommits.map((commit) => commit.commitHash);

    return commitHashes.filter(
        (commit) => !processedCommitHashes.includes(commit.commitHash)
    );
}

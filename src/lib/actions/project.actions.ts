"use server";

import { db } from "@/server/db";
import { pollCommits } from "../github";
import { indexGithubRepo } from "../github-loader";
import { currentProfile } from "../current-profile";

interface CreateProps {
    githubUrl: string;
    projectName: string;
    githubAccessToken: string;
}

export const createProject = async ({ githubUrl, projectName, githubAccessToken }: CreateProps) => {
    const user = await currentProfile();

    // Ensure the user is authenticated
    if (!user) {
        console.error("User is not authenticated");
        return { status: 401, message: "User is not authenticated" };
    }

    const project = await db.project.create({
        data: {
            name: projectName,
            githubUrl: githubUrl,
            accessToken: githubAccessToken,
            userToProjects: {
                create: {
                    userId: user.id, // Access user ID
                },
            },
        },
    });

    // Index the GitHub repository and poll commits
    try {
        await indexGithubRepo(project.id, githubUrl, githubAccessToken);
        await pollCommits(project.id);
    } catch (error) {
        console.error("GitHub operations failed:", error);
    }

    return {
        status: 200,
        data: project,
    };
};

export const getProjects = async () => {
    const user = await currentProfile();

    // Ensure the user is authenticated
    if (!user) {
        console.error("User is not authenticated");
        return { status: 401, message: "User is not authenticated" };
    }

    const projects = await db.project.findMany({
        where: {
            userToProjects: {
                some: {
                    userId: user.id, // Access user ID
                },
            },
            deletedAt: null,
        },
    });

    return {
        status: 200,
        data: projects,
    };
};

export const getCommitLogs = async (projectId: string) => {
    await pollCommits(projectId);
    const commits = await db.commit.findMany({
        where: {
            projectId,
        },
    });

    return commits;
};

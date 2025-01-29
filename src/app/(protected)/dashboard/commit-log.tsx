
"use client";

import { useState, useEffect } from "react";
import { useProjects}  from "@/hooks/use-project";
import { getCommitLogs } from "@/lib/actions/project.actions";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface Commit {
    commitHash: string;
    commitMessage: string;
    commitAuthor: string;
    commitAvatar: string;
    commitDate: string;
    summary?: string;
}

const CommitLog = () => {
    const { selectedProject, project } = useProjects();
    const [commits, setCommits] = useState<Commit[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedProject) return;

        const fetchCommits = async () => {
            try {
                const fetchedCommits = await getCommitLogs(selectedProject);
                setCommits(fetchedCommits);
            } catch (err) {
                console.error("Error fetching commit logs:", err);
                setError("Failed to fetch commit logs. Please try again later.");
            }
        };

        fetchCommits();
    }, [selectedProject]);

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!commits) {
        return <div className="text-gray-500">Loading commit logs...</div>;
    }

    return (
        <ul className="space-y-6">
            {commits?.map((commit, commitIndex) => (
                <li key={commit.commitHash} className="relative flex gap-x-4">
                    {/* Vertical Line */}
                    <div
                        className={cn(
                            commitIndex === commits.length - 1 ? "h-6" : "-bottom-6",
                            "absolute left-4 top-0 flex w-6 justify-center"
                        )}
                    >
                        <div className="w-px translate-x-1 bg-gray-200"></div>
                    </div>

                    {/* Commit Info */}
                    <>
                        <img
                            src={commit.commitAvatar}
                            alt="avatar"
                            className="relative mt-4 h-8 w-8 flex-none rounded-full bg-gray-500"
                        />
                        <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
                            <div className="flex justify-between gap-x-4">
                                <Link
                                    target="_blank"
                                    href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                                    className="py-0.5 text-xs leading-5 text-gray-500"
                                >
                                    <span className="font-medium text-gray-900">
                                        {commit.commitAuthor}
                                    </span>{" "}
                                    <span className="inline-flex items-center">
                                        committed
                                        <ExternalLink className="ml-1 h-4 w-4" />
                                    </span>
                                </Link>
                            </div>
                            <span className="font-semibold">{commit.commitMessage}</span>
                            {commit.summary && (
                                <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                                    {commit.summary}
                                </pre>
                            )}
                        </div>
                    </>
                </li>
            ))}
        </ul>
    );
};

export default CommitLog;
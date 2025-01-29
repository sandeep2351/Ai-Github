import { useEffect, useState, useMemo } from "react";
import { getProjects } from "@/lib/actions/project.actions";
import { useLocalStorage } from "usehooks-ts";

type Project = {
    id: string;
    name: string;
    [key: string]: any; // Allows additional properties
};

type UseProjectsReturn = {
    projects: Project[];
    project: Project | undefined; // The currently selected project
    projectId: string; // ID of the selected project
    setProjectId: (value: string) => void; // Function to set the selected project ID
    loading: boolean; // Loading state for fetching projects
    error: Error | null; // Error state, if any
};

export const useProjects = (): UseProjectsReturn => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [projectId, setProjectId] = useLocalStorage<string>("projectId", ""); // Persist selected project ID in local storage

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await getProjects();
                setProjects(response.data || []); // Ensure data is set even if empty
            } catch (err) {
                setError(err as Error); // Safely cast error
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Memoize the selected project to avoid unnecessary computations
    const project = useMemo(
        () => projects.find((proj) => proj.id === projectId),
        [projects, projectId]
    );

    return {
        projects,
        project, // Selected project object
        projectId, // Current project ID
        setProjectId, // Function to update project ID
        loading,
        error,
    };
};

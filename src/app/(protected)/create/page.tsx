'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();

  const onSubmit: SubmitHandler<FormInput> = (data) => {
    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success('Project created successfully');
          refetch();
          reset();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to create project');
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-12 h-full justify-center">
      <img
        src="/undraw.svg"
        alt="Link GitHub repository illustration"
        className="h-56 w-auto"
        onError={(e) => { (e.target as HTMLImageElement).src = '/fallback.svg'; }}
      />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">Link your GitHub Repository</h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to DevSpace.
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <Input
                {...register('projectName', { required: "Project Name is required" })}
                placeholder="Project Name"
                aria-invalid={!!errors.projectName}
                className={`${
                  errors.projectName ? "border-red-500 focus:ring-red-500" : ""
                }`}
              />
              {errors.projectName && (
                <p className="text-red-500 text-xs mt-1">{errors.projectName.message}</p>
              )}
            </div>

            <div className="mb-4">
              <Input
                {...register('repoUrl', {
                  required: "GitHub URL is required",
                  pattern: {
                    value: /^(https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)$/,
                    message: "Invalid GitHub URL format",
                  },
                })}
                placeholder="GitHub URL"
                type="url"
                aria-invalid={!!errors.repoUrl}
                className={`${
                  errors.repoUrl ? "border-red-500 focus:ring-red-500" : ""
                }`}
              />
              {errors.repoUrl && (
                <p className="text-red-500 text-xs mt-1">{errors.repoUrl.message}</p>
              )}
            </div>

            <div className="mb-4">
              <Input
                {...register('githubToken')}
                placeholder="GitHub Token (Optional)"
                className="focus:ring-primary"
              />
            </div>

            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure.input(
    z.object({
      name: z.string(),
      githubUrl: z.string(),
      githubToken: z.string().optional(),
    })
  ).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.userId) {
      console.error('User is not authenticated:', ctx.user);
      return { status: 401, message: "User is not authenticated" };
    }

    const userId = ctx.user.userId;

    const user = await ctx.db.user.findUnique({
      where: {
        id: userId, 
      },
    });

    if (!user) {
      console.error("User not found with ID:", userId);
      return { status: 400, message: "User not found" };
    }

    const project = await ctx.db.project.create({
      data: {
        name: input.name,
        githubUrl: input.githubUrl,
        userToProjects: {
          create: {
            userId,
          },
        },
      },
    });

    try {
      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pollCommits(project.id);
    } catch (error) {
      console.error("GitHub operations failed:", error);
    }

    return project;
  }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.userId) {
      return { status: 401, message: "User is not authenticated" };
    }

    const userId = ctx.user.userId;

    const user = await ctx.db.user.findUnique({
      where: {
        id: userId, 
      },
    });

    if (!user) {
      console.error("User not found with ID:", userId);
      return { status: 400, message: "User not found" };
    }

    return await ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId, 
          },
        },
        deletedAt: null,
      },
    });
  }),

  getCommits: protectedProcedure.input(
    z.object({
      projectId: z.string(),
    })
  ).query(async ({ ctx, input }) => {
    try {
      pollCommits(input.projectId).catch(console.error);
    } catch (error) {
      console.error("Error polling commits:", error);
    }

    return await ctx.db.commit.findMany({
      where: {
        projectId: input.projectId,
      },
    });
  }),

  saveAnswer: protectedProcedure.input(
    z.object({
      projectId: z.string(),
      question: z.string(),
      answer: z.string(),
      fileReferences: z.any(),
    })
  ).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.userId) {
      return { status: 401, message: "User is not authenticated" };
    }

    return await ctx.db.question.create({
      data: {
        answer: input.answer,
        fileReferences: input.fileReferences,
        projectId: input.projectId,
        question: input.question,
        userId: ctx.user.userId, 
      },
    });
  }),

  getQuestions: protectedProcedure.input(
    z.object({
      projectId: z.string(),
    })
  ).query(async ({ ctx, input }) => {
    return await ctx.db.question.findMany({
      where: {
        projectId: input.projectId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  uploadMeeting: protectedProcedure.input(
    z.object({
      projectId: z.string(),
      meetingUrl: z.string(),
      name: z.string(),
    })
  ).mutation(async ({ ctx, input }) => {
    const meeting = await ctx.db.meeting.create({
      data: {
        meetingUrl: input.meetingUrl,
        projectId: input.projectId,
        name: input.name,
        status: "PROCESSING",
      },
    });

    return meeting;
  }),

  getMeetings: protectedProcedure.input(
    z.object({
      projectId: z.string(),
    })
  ).query(async ({ ctx, input }) => {
    return await ctx.db.meeting.findMany({
      where: { projectId: input.projectId },
      include: { issues: true },
    });
  }),

  deleteMeetings: protectedProcedure.input(
    z.object({
      meetingId: z.string(),
    })
  ).mutation(async ({ ctx, input }) => {
    return await ctx.db.meeting.delete({
      where: { id: input.meetingId },
    });
  }),
  getMeetingById: protectedProcedure.input(
    z.object({
      meetingId: z.string(),
    })
  ).query(async ({ ctx, input }) => {
    return await ctx.db.meeting.findUnique({
      where: { id: input.meetingId },
      include: { issues: true },
    });
  }),

  archiveProject: protectedProcedure.input(
    z.object({
      projectId: z.string(),
    })
  ).mutation(async ({ ctx, input }) => {
    return await ctx.db.project.update({
      where: { id: input.projectId },
      data: { deletedAt: new Date() },
    });
  }),


  getMembers: protectedProcedure.input(
    z.object({
      projectId: z.string(),
    })
  ).query(async ({ ctx, input }) => {
    return await ctx.db.userToProject.findMany({
      where: { projectId: input.projectId },
      include: { user: true },
    });
  }),  
});

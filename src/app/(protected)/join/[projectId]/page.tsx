import { db } from '@/server/db';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
    params: { projectId: string };
};

type ClerkUser = {
    emailAddresses: { emailAddress: string }[];
    imageUrl?: string;
    firstName?: string;
    lastName?: string;
};

const JoinHandler: React.FC<Props> = async (props: Props): Promise<JSX.Element> => {
    const { projectId } = props.params;
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
        return <></>;
    }
    const numericUserId = parseInt(userId, 10);

    if (isNaN(numericUserId)) {
        redirect('/error');
        return <></>;
    }

    const dbUser = await db.user.findUnique({
        where: {
            id: numericUserId,
        },
    });

    const user = await clerkClient.users.getUser(userId) as ClerkUser;

    if (!dbUser && user) {
        await db.user.create({
            data: {
                id: numericUserId,
                emailAddress: user.emailAddresses[0]?.emailAddress || '',
                imageUrl: user.imageUrl || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            },
        });
    }

    const project = await db.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        redirect('/dashboard');
        return <></>;
    }

    try {
        await db.userToProject.create({
            data: {
                userId: numericUserId,
                projectId,
            },
        });
    } catch (error) {
        console.log('User already in project');
    }

    return redirect('/dashboard');
};

export default JoinHandler;

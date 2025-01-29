import { useProjects } from '@/hooks/use-project';
import { api } from '@/trpc/react';
import React from 'react';

const TeamMembers = () => {
    const { projectId } = useProjects();
    const { data: members } = api.project.getMembers.useQuery({ projectId });

    return (
        <div className='flex items-center gap-2'>
            {members?.map(member => (
                <img
                    key={member.id}
                    src={member.user.imageUrl || '/default-avatar.png'}
                    alt={member.user.firstName || "Member"} 
                    height={30}
                    className='w-8 rounded-full'
                />
            ))}
        </div>
    );
};

export default TeamMembers;

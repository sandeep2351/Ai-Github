import React from 'react';
import IssuesList from './issues-list';
import { api } from '@/trpc/react';

type Props = {
  params: Promise<{ meetingId: string }>;
};

const MeetingDetailsPage = async ({ params }: Props) => {
  const { meetingId } = await params;

  // Fetch the meeting details (assuming this is how you get the meeting's name and createdAt)
  const { data: meeting } = await api.project.getMeetingById.useQuery({ meetingId });

  if (!meeting) {
    // Handle the case when the meeting is not found
    return <div>Meeting not found</div>;
  }

  return (
    <IssuesList 
      meetingId={meetingId} 
      name={meeting.name} 
      createdAt={meeting.createdAt} 
    />
  );
};

export default MeetingDetailsPage;

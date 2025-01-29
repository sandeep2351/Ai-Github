'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { api, RouterOutputs } from '@/trpc/react';
import { VideoIcon } from 'lucide-react';
import React from 'react';

type Props = {
  meetingId: string;
  name: string;
  createdAt: Date;
};

type Meeting = NonNullable<RouterOutputs['project']['getMeetingById']>;
type Issue = Meeting['issues'][number];

const IssuesList = ({ meetingId }: Props) => {
  const { data: meeting, isLoading } = api.project.getMeetingById.useQuery(
    { meetingId },
    {
      refetchInterval: 4000,
    }
  );

  if (isLoading) return <div>Loading...</div>;

  if (!meeting) {
    return <div>Meeting not found or no data available.</div>;
  }

  const { issues } = meeting;

  if (!issues || issues.length === 0) {
    return <div>No issues available for this meeting.</div>;
  }

  return (
    <>
      <div className='p-8'>
        <div className='mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b pb-6 lg:mx-0 lg:max-w-none'>
          <div className="flex items-center gap-x-6">
            <div className='rounded-full border bg-white p-3'>
              <VideoIcon className='h-6 w-6' />
            </div>
            <h1>
              <div className='text-sm leading-6 text-gray-600'>
                Meeting on {new Date(meeting.createdAt).toLocaleDateString()}
              </div>
              <div className='mt-1 text-base font-semibold leading-6 text-gray-900'>
                {meeting.name}
              </div>
            </h1>
          </div>
        </div>
        <div className="h-4"></div>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
          {issues.map((issue: Issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>
    </>
  );
};

function IssueCard({ issue }: { issue: Issue }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{issue.gist}</DialogTitle>
          <DialogDescription>
            {new Date(issue.createdAt).toLocaleDateString()}
          </DialogDescription>
          <p className='text-gray-600'>{issue.headline}</p>
          <blockquote className='mt-2 border-1-4 border-gray-300 bg-gray-50 p-4'>
            <span className='text-sm text-gray-600'>{issue.start}-{issue.end}</span>
            <p className='font-medium italic leading-relaxed text-gray-900'>{issue.summary}</p>
          </blockquote>
        </DialogContent>
      </Dialog>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-xl">{issue.gist}</CardTitle>
          <div className="border-b"></div>
          <CardDescription>{issue.headline}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpen(true)}>Details</Button>
        </CardContent>
      </Card>
    </>
  );
}

export default IssuesList;

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/hooks/use-project';
import React, { useEffect, useState } from 'react';

const InviteButton = () => {
  const [open, setOpen] = useState(false);
  const { projectId } = useProjects();
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(`${window.location.origin}/join/${projectId}`);
    }
  }, [projectId]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-gray-500'>
            Ask them to paste this link
          </p>
          <Input
            className='mt-4'
            readOnly
            onClick={() => {
              if (url) {
                navigator.clipboard.writeText(url);
              }
            }}
            value={url}
          />
        </DialogContent>
      </Dialog>
      <Button size='sm' onClick={() => setOpen(true)}>
        Invite Members
      </Button>
    </>
  );
};

export default InviteButton;

import React, { useState } from 'react';
import { toast } from 'sonner';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';

import { requestReregister } from '@/services/authfunctions';

const ReregisterButton: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleReregister = async () => {
    setLoading(true);
    try {
      const response = await requestReregister();
      
      if (response.reregister_link) {
        // this should only happen in development where there is no SMTP_SENDER
        console.log('REREGISTRATION LINK:', response.reregister_link);
        toast.success('Reregistration link sent to your email.');
      } else if (response.email_sent) {
        toast.success('Reregistration link sent to your email.');
      } else {
        toast.error('Failed to send reregistration email. Please try again later.', {
          duration: 10000,
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Reregistration request failed: ' + error.message, {
          duration: 10000,
        });
      } else {
        toast.error('An unknown error occurred', {
          duration: 10000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button variant="link" className="mt-2">
          Renew user details?
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-background/80 fixed inset-0" />
        <AlertDialog.Content
          className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] 
            translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-background p-[25px] 
            shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] 
            focus:outline-none border border-input"
        >
          <AlertDialog.Title className="text-lg font-medium text-foreground">
            Renew User Details
          </AlertDialog.Title>
          <AlertDialog.Description
            className="mt-2 mb-5 text-sm text-muted-foreground"
          >
            Do you wish to reregister your email and password? It will not
            affect the collected data or fetching. You will receive a reset link
            to your email. (Be aware that the sender is "Unverified".)
          </AlertDialog.Description>
          <div className="flex justify-end gap-[25px]">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button onClick={handleReregister} disabled={loading}>
                {loading ? 'Sending...' : 'Send Email Link'}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ReregisterButton;

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { toast } from 'sonner';

// custom ui
import { PageLayout } from '@/components/page-layout';
import { itemVariants } from '@/components/animation-variants';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Log api calls
import { getLogRecords, clearLogRecords } from './log-records';

export default function Errors() {
  const [logRecords, setLogRecords] = useState<string[]>([]);

  useEffect(() => {
    fetchLog();
  }, []);

  const fetchLog = async () => {
    const data = await getLogRecords();
    setLogRecords(data);
  };

  const handleClearLog = async () => {
    try {
      await clearLogRecords();
      setLogRecords([]);
      toast.success('Log cleared successfully');
    } catch (error) {
      console.error('Failed to clear log:', error);
      toast.error('Failed to clear log');
    }
  };

  const handleDownloadLog = () => {
    const blob = new Blob([logRecords.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'error_log.log';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout title="Errors">
      <motion.div variants={itemVariants} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Error log</CardTitle>
            <CardDescription>View and manage error log</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[60vh] overflow-y-auto text-xs">
              {logRecords.length > 0 ? (
                logRecords.map((record, index) => (
                  <div
                    key={index}
                    className="mb-1 border-b border-gray-100 pb-1"
                  >
                    <pre className="whitespace-pre-wrap break-words font-mono">
                      {record}
                    </pre>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No error log.</p>
              )}
            </div>
            {logRecords.length > 0 && (
              <div className="mt-4 flex justify-end space-x-2">
                <Button onClick={handleDownloadLog}>Download Log</Button>
                <AlertDialog.Root>
                  <AlertDialog.Trigger asChild>
                    <Button variant="destructive">Clear Log</Button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 bg-background/80" />
                    <AlertDialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-background p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                      <AlertDialog.Title className="text-lg font-medium text-foreground">
                        Are you sure?
                      </AlertDialog.Title>
                      <AlertDialog.Description className="mb-5 mt-2 text-sm text-muted-foreground">
                        This action cannot be undone. This will empty the entire
                        error log.
                      </AlertDialog.Description>
                      <div className="flex justify-end gap-[15px]">
                        <AlertDialog.Cancel asChild>
                          <Button variant="outline">Cancel</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                          <Button
                            variant="destructive"
                            onClick={handleClearLog}
                          >
                            Clear Log
                          </Button>
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}

import { useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { getLogRecords, clearLogRecords } from './log_records';

export default function Logs() {
  const [logRecords, setLogRecords] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const handleToggleLogs = async () => {
    if (!showLogs) {
      const data = await getLogRecords();
      setLogRecords(data);
    }
    setShowLogs(!showLogs);
  };

  const handleClearLogs = async () => {
    try {
      await clearLogRecords();
      setLogRecords([]);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const handleDownloadLogs = () => {
    const blob = new Blob([logRecords.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'error_logs.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-center">
        <Button
          className="px-4 py-2 text-sm font-medium text-gray-600"
          onClick={handleToggleLogs}
          variant="ghost"
        >
          {showLogs ? 'Hide Error Logs' : 'Show Error Logs'}
        </Button>
      </div>
      {showLogs && (
        <Card className="mt-2 shadow-sm w-full">
          <CardContent className="p-2">
            <div className="max-h-60 overflow-y-auto text-xs">
              {logRecords.length > 0 ? (
                logRecords.map((record, index) => (
                  <div key={index} className="mb-1 border-b border-gray-100 pb-1">
                    <pre className="whitespace-pre-wrap break-words font-mono">{record}</pre>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No error logs.</p>
              )}
            </div>
            {logRecords.length > 0 && (
              <div className="mt-1 flex justify-end space-x-1">
                <Button
                  onClick={handleDownloadLogs}
                  size="xs"
                  variant="outline"
                >
                  Download Logs
                </Button>
                <AlertDialog.Root>
                  <AlertDialog.Trigger asChild>
                    <Button
                      size="xs"
                      variant="outline"
                    >
                      Clear Logs
                    </Button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="bg-background/80 fixed inset-0" />
                      <AlertDialog.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-background p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                        <AlertDialog.Title className="text-lg font-medium text-foreground">Are you sure?</AlertDialog.Title>
                        <AlertDialog.Description className="mt-2 mb-5 text-sm text-muted-foreground">
                          This action cannot be undone. This will delete all the error logs.
                        </AlertDialog.Description>
                        <div className="flex justify-end gap-[15px]">
                          <AlertDialog.Cancel asChild>
                            <Button variant="outline">Cancel</Button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action asChild>
                            <Button variant="destructive" onClick={handleClearLogs}>Clear Logs</Button>
                          </AlertDialog.Action>
                        </div>
                      </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

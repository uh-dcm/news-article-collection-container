import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLogRecords } from '../services/log_records';

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

  return (
    <Card className="col-span-5">
      <CardContent className="w-[20%] p-6 text-base">
        <Button
          className="w-full p-6 text-base"
          onClick={handleToggleLogs}
          variant="outline"
        >
          {showLogs ? 'Hide logs' : 'Show logs'}
        </Button>
      </CardContent>
      {showLogs && (
        <CardContent>
          {logRecords.length > 0 ? (
            logRecords.map((record, index) => (
              <div key={index} className="mb-2 border-b border-gray-200 p-2">
                {record}
              </div>
            ))
          ) : (
            <p>No logs available.</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

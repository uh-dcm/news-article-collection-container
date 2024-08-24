import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';

import { sendDataSizeQuery } from '@/services/database-queries';

const VersionInfo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dataSize, setDataSize] = useState<string | null>(null);
  const version = import.meta.env.VITE_RELEASE_VERSION || 'development';

  const handleGetDataSize = async () => {
    try {
      const response = await sendDataSizeQuery();
      setDataSize(response.size);
      setIsOpen(true);
    } catch (error) {
      console.error('Error fetching data size:', error);
    }
  };

  return (
    <div className="flex items-center mb-4">
      <span className="text-base font-semibold">
        Current version: <span className="font-bold">{version}</span>
      </span>
      <Button className="ml-4" onClick={handleGetDataSize}>Get Data Size</Button>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold mb-2">Database Size</Dialog.Title>
            <p>{dataSize ? `The current database size is ${dataSize}` : 'Database is empty'}</p>
            <Dialog.Close asChild>
              <Button className="mt-4">Close</Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default VersionInfo;

import React, { useEffect, useState } from 'react';
import { getAllFeedUrls, sendAllFeedUrls } from './services/feed_urls';
import { keepFetching, stopFetching } from './services/fetching-news';
import axios from 'axios';
import './css/index.css';
import {
  ArrowDownTrayIcon,
  CheckIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// eslint-disable-next-line react-refresh/only-export-components
export const serverUrl = import.meta.env.PROD
  ? 'http://localhost:4000'
  : 'http://localhost:5000';

function App() {
  const [feedUrls, setFeedUrls] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const handleInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setFeedUrls(event.target.value);
  };

  const handleSubmit = async () => {
    const rssFeeds = feedUrls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '');
    console.log(rssFeeds);
    if ((await sendAllFeedUrls(rssFeeds)).status == 200) {
      toast.success('URLs Set Successfully!');
    }
  };

  const handleFetchStart = () => {
    toast.info('URL fetching started...');
    keepFetching();
  };

  const handleFetchStop = () => {
    toast.info('URL fetching stopped.');
    stopFetching();
  };

  const handleArticleDownload = async () => {
    setIsDisabled(true);

    toast.promise(
      async () => {
        try {
          const response = await axios.get(`${serverUrl}/api/articles`, {
            responseType: 'blob',
          });

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'articles.json');
          document.body.appendChild(link);
          link.click();

          link.parentNode!.removeChild(link);
          window.URL.revokeObjectURL(url);

          return 'Download successful!';
        } catch (error) {
          console.error('Download failed', error);
          throw new Error('Failed to download the file.');
        } finally {
          setIsDisabled(false);
        }
      },
      {
        loading: 'Downloading...',
        success: (msg) => msg,
        error: (error) => {
          console.error('Error downloading:', error);
          return 'Failed to download the file.';
        },
      }
    );
  };

  useEffect(() => {
    const fetchFeedUrls = async () => {
      const feedUrls = await getAllFeedUrls();
      setFeedUrls(feedUrls.join('\n'));
    };
    fetchFeedUrls();
  }, []);

  return (
    <div className="flex min-h-[100vh] flex-col">
      <div className="border-border/70 relative flex items-center border-b p-3">
        <img
          className="mx-2"
          width="40"
          src="https://avatars.githubusercontent.com/u/80965139?s=200&v=4"
        ></img>
        <h3 className="scroll-m-20 text-2xl font-medium tracking-tight">
          News article collector
        </h3>
      </div>

      <div className="mb-8 mt-10 flex justify-center">
        <div className="flex w-[550px] min-w-[200px] flex-col justify-center">
          <div className="grid w-full gap-1.5">
            <Label className="text-base" htmlFor="message">
              Enter RSS feed URLs, each on their own separate line:
            </Label>
            <Textarea
              value={feedUrls}
              onChange={handleInputChange}
              placeholder="RSS-feed addresses here..."
              rows={4}
              cols={50}
              className="min-h-64"
            />
          </div>
        </div>
      </div>
      <div className="mb-20 flex justify-center">
        <div className="grid w-[550px] grid-cols-2 grid-rows-2 gap-4">
          <Button
            variant="outline"
            onClick={handleSubmit}
            className="col-span-2 p-5 text-base"
          >
            <div className="flex justify-center">
              <CheckIcon className="mr-3 size-6"></CheckIcon>
              Set RSS feed list
            </div>
          </Button>
          <Button
            className="p-5 text-base"
            variant="outline"
            onClick={handleFetchStart}
          >
            <div className="flex justify-center">
              <BarsArrowUpIcon className="mr-3 size-6"></BarsArrowUpIcon>
              Activate RSS fetching
            </div>
          </Button>
          <Button
            className="p-5 text-base"
            variant="outline"
            onClick={handleFetchStop}
          >
            <div className="flex justify-center">
              <BarsArrowDownIcon className="mr-3 size-6"></BarsArrowDownIcon>
              Disable RSS fetching
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={handleArticleDownload}
            disabled={isDisabled}
            className="col-span-2 p-5 text-base"
          >
            {isDisabled ? (
              'Downloading...'
            ) : (
              <div className="flex justify-center">
                <ArrowDownTrayIcon className="mr-3 size-6"></ArrowDownTrayIcon>
                Download articles
              </div>
            )}
          </Button>
          {isDisabled && (
            <p className="col-span-2">
              Please note that the download might take some time.
            </p>
          )}
        </div>
      </div>
      <div className="mt-auto flex w-full flex-col items-center p-3">
        <div className="mb-3 flex items-center">
          <Label>
            <a
              className="hover:underline"
              href="https://github.com/uh-dcm/news-article-collection-container"
            >
              &copy; University of Helsinki, Digital and Computational Methods
            </a>
          </Label>
        </div>
      </div>
    </div>
  );
}

export default App;

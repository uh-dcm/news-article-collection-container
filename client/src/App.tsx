import React, { useEffect, useState } from 'react';
import { getAllFeedUrls, sendAllFeedUrls } from './services/feed_urls';
import { keepFetching, stopFetching } from './services/fetching-news';
import { sendSearchQuery } from './services/database_queries';
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
import { ThemeProvider } from './components/ui/theme-provider';

import QuestionsAccordion from './components/questions-accordion';
import Footer from './components/footer';
import RssInput from './components/rss-input';
import Header from './components/header';

type Article = {
  time: string;
  url: string;
};

// eslint-disable-next-line react-refresh/only-export-components
export const serverUrl = import.meta.env.PROD
  ? 'http://localhost:4000'
  : 'http://localhost:5000';

function App() {
  const [feedUrls, setFeedUrls] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchData, setSearchData] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setFeedUrls(event.target.value);
  };

  const handleFilterInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSearchQuery(event.target.value);
  };

  const handleSubmit = async () => {
    toast.dismiss();
    const rssFeeds = feedUrls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '');
    console.log(rssFeeds);
    if ((await sendAllFeedUrls(rssFeeds)).status == 200) {
      toast.success('Feed list set successfully!');
    }
  };

  const handleFetchStart = () => {
    toast.loading('RSS fetching in progress...', {
      style: {
        background: 'hsl(208, 100%, 97%)',
        border: '1px solid hsl(221, 91%, 91%)',
        color: 'hsl(210, 92%, 45%)',
      },
      classNames: {
        title: 'text-sm',
      },
    });
    setIsFetching(true);
    keepFetching();
  };

  const handleFetchStop = () => {
    setIsFetching(false);
    toast.dismiss();
    toast.warning('RSS fetching stopped.');
    stopFetching();
  };

  const handleArticleDownload = async () => {
    toast.dismiss();
    setIsDisabled(true);

    type ToastOptions = {
      loading: string;
      description: string | null;
      success: (msg: string) => string;
      error: (error: string) => string;
    };

    const toastOptions = {
      loading: 'Downloading...',
      description: 'Please note that the download might take some time.',
      success: (msg: string) => msg,
      error: (error: string) => {
        console.error('Error downloading:', error);
        return 'Failed to download the file.';
      },
    } as ToastOptions satisfies ToastOptions;

    toast.promise(async () => {
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

        toastOptions.description = null;

        return 'Download successful!';
      } catch (error) {
        console.error('Download failed', error);
        throw new Error('Failed to download the file.');
      } finally {
        setIsDisabled(false);
      }
    }, toastOptions);
  };

  const handleSearchQuery = async () => {
    const data = await sendSearchQuery(searchQuery);
    setSearchData(data);
  };

  useEffect(() => {
    const fetchFeedUrls = async () => {
      const feedUrls = await getAllFeedUrls();
      setFeedUrls(feedUrls.join('\n'));
    };
    fetchFeedUrls();
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex min-h-[100vh] flex-col">
        <Header />

        <RssInput feedUrls={feedUrls} handleInputChange={handleInputChange} />

        <div className="mb-20 flex justify-center">
          <div className="grid w-[550px] grid-cols-2 grid-rows-3 gap-4">
            <Button
              variant="outline"
              onClick={handleSubmit}
              className="col-span-2 p-6 text-base"
            >
              <div className="flex justify-center">
                <CheckIcon className="mr-3 size-6"></CheckIcon>
                Set RSS feed list
              </div>
            </Button>

            <Button
              variant="outline"
              className="p-6 text-base"
              onClick={handleFetchStart}
              disabled={isFetching}
            >
              <div className="flex justify-center">
                <BarsArrowUpIcon className="mr-3 size-6"></BarsArrowUpIcon>
                Activate RSS fetching
              </div>
            </Button>

            <Button
              variant="outline"
              className="p-6 text-base"
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
              className="col-span-2 p-6 text-base"
            >
              <div className="flex justify-center">
                <ArrowDownTrayIcon className="mr-3 size-6"></ArrowDownTrayIcon>
                Download articles
              </div>
            </Button>

            <div className="col-span-2 mt-16">
              <QuestionsAccordion />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;

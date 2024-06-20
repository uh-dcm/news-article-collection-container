import React, { useEffect, useState } from 'react';
import { getAllFeedUrls, sendAllFeedUrls } from './services/feed_urls';
import {
  getFetchingStatus,
  keepFetching,
  stopFetching,
} from './services/fetching-news';
import { sendSearchQuery } from './services/database_queries';
import axios from 'axios';
import './css/index.css';
import {
  ArrowDownTrayIcon,
  CheckIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ThemeProvider } from './components/ui/theme-provider';

import { Input } from '@/components/ui/input';

import QuestionsAccordion from './components/questions-accordion';
import Footer from './components/footer';
import RssInput from './components/rss-input';
import Header from './components/header';
import { DataTable } from './components/ui/data-table';
import { articleColumns, Article } from './components/ui/article-columns';
import { feedColumns, Feed } from './components/ui/feed-columns';
import { Label } from '@radix-ui/react-label';

type ToastOptions = {
  loading: string;
  description: string | null;
  success: (msg: string) => string;
  error: (error: string) => string;
};

// eslint-disable-next-line react-refresh/only-export-components
export const serverUrl = import.meta.env.VITE_WEBPAGE_URL;

export default function App() {
  const [feedUrlList, setFeedUrlList] = useState<Feed[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isUrlSetDisabled, setIsUrlSetDisabled] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchData, setSearchData] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSearchQuery(event.target.value);
  };

  const handleFeedAdd = (url: Feed) => {
    setFeedUrlList([...feedUrlList, url]);
  };

  const handleSubmit = async () => {
    toast.dismiss();
    setIsUrlSetDisabled(true);

    const toastOptions = {
      loading: 'Submitting...',
      description: 'Processing the feed URLs. Please wait...',
      duration: 4000,
      success: (msg: string) => msg,
      error: (error: string) => {
        console.error('Error submitting:', error);
        toastOptions.description = 'Please try again.';
        return 'Failed to submit the feed URLs.';
      },
    } as ToastOptions satisfies ToastOptions;

    toast.promise(async () => {
      try {
        console.log(feedUrlList);
        const feedUrlArray = feedUrlList.map((feedObject) => feedObject.url);

        const response = await sendAllFeedUrls(feedUrlArray);

        if (response.status == 200) {
          toastOptions.description = null;
          return 'Feed list set successfully!';
        } else {
          throw new Error();
        }
      } catch (error) {
        throw new Error();
      } finally {
        setIsUrlSetDisabled(false);
      }
    }, toastOptions);
  };

  const handleFetchStart = () => {
    toast.dismiss();
    toast.info('RSS fetching in progress', {
      description: 'Gathering articles...',
      duration: Infinity,
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

    const toastOptions = {
      loading: 'Downloading...',
      description: 'Please note that the process might take some time.',
      duration: 4000,
      success: (msg: string) => msg,
      error: (error: string) => {
        console.error('Error downloading:', error);
        return 'Failed to download the file. Try waiting longer before downloading.';
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

  const deleteSelectedRows = (selectedRows: Feed[]) => {
    setFeedUrlList((prevData) =>
      prevData.filter((item) => !selectedRows.includes(item))
    );
  };

  useEffect(() => {
    toast.dismiss();
    const fetchFeedUrls = async () => {
      const feedUrls = await getAllFeedUrls();

      const feedUrlObjArray = feedUrls.map((feedUrl: string) => ({
        url: feedUrl.trim(),
      }));

      setFeedUrlList(feedUrlObjArray);
    };
    fetchFeedUrls();

    const isFetching = async () => {
      const response = await getFetchingStatus();
      if (response.status === 'running') {
        toast.dismiss();
        toast.info('RSS fetching in progress', {
          description: 'Gathering articles...',
          duration: Infinity,
          classNames: {
            title: 'text-sm',
          },
        });
        setIsFetching(true);
      }
    };
    isFetching();
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex min-h-[100vh] flex-col">
        <Header />

        <RssInput handleFeedAdd={handleFeedAdd} />

        <div className="mb-20 flex justify-center">
          <div className="grid-rows- grid w-[550px] grid-cols-2 gap-4">
            <div className="col-span-2">
              <DataTable
                columns={feedColumns}
                data={feedUrlList}
                onDeleteSelected={deleteSelectedRows}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleSubmit}
              className="col-span-2 p-6 text-base"
              disabled={isUrlSetDisabled}
            >
              <div className="flex justify-center">
                <CheckIcon className="mr-3 size-6"></CheckIcon>
                Send selected RSS feeds
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
              disabled={!isFetching}
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

            <Input
              className="w-full p-6"
              onChange={handleFilterInputChange}
              placeholder="Insert search query..."
              value={searchQuery}
            ></Input>

            <Button
              className="p-6 text-base"
              variant="outline"
              onClick={handleSearchQuery}
            >
              <div className="flex justify-center">
                <MagnifyingGlassIcon className="mr-3 size-6"></MagnifyingGlassIcon>
                Search
              </div>
            </Button>

            <div className="col-span-2">
              <DataTable columns={articleColumns} data={searchData} />
            </div>

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

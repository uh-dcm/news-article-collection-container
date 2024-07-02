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
import Logs from './components/logs';
import { DataTable } from './components/ui/data-table';
import { articleColumns, Article } from './components/ui/article-columns';
import { feedColumns, Feed } from './components/ui/feed-columns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Separator } from '@/components/ui/separator';

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
    setFeedUrlList((prevData) => {
      // CAUTION: this could be slow for large lists, but it's fine for now
      if (!prevData.find((feed) => feed.url === url.url)) {
        return [...prevData, url];
      }
      return prevData;
    });
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

  const handleArticleDownload = async (format: 'json' | 'csv' | 'parquet') => {
    toast.dismiss();
    setIsDisabled(true);

    const toastOptions = {
      loading: 'Downloading...',
      description: 'Please note that the process might take some time.',
      duration: 4000,
      success: (msg: string) => msg,
      error: (error: string) => {
        console.error('Error downloading:', error);
        return 'Failed to download the file. Have you fetched articles yet?';
      },
    } as ToastOptions satisfies ToastOptions;

    toast.promise(async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/articles?format=${format}`,
          {
            responseType: 'blob',
          }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `articles.${format}`);
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

      if (typeof feedUrls === 'string') {
        // prevent error if backend is down, CAUTION: this may not always work
        return;
      }

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
        <div className="flex justify-center">
          <div className="mt-10 grid w-[1000px] grid-cols-5 grid-rows-1 gap-4">
            <h1 className="col-span-5 mb-6 h-4 text-3xl font-semibold">
              Dashboard
            </h1>
            <Separator className="col-span-5" />
          </div>
        </div>
        <div className="mb-20 flex justify-center">
          <div className="grid w-[1000px] grid-cols-5 grid-rows-3 gap-6">
            <Card className="col-span-3 row-span-3 mt-12">
              <CardHeader>
                <CardTitle className="text-lg">RSS Feed Manager</CardTitle>
                <CardDescription>Add, Select or Delete feeds</CardDescription>
              </CardHeader>
              <CardContent>
                <RssInput handleFeedAdd={handleFeedAdd} />
              </CardContent>
              <CardContent>
                <Separator className="my-5" />
                <DataTable
                  columns={feedColumns}
                  data={feedUrlList}
                  onDeleteSelected={deleteSelectedRows}
                  tableName={'List of RSS feeds'}
                />
              </CardContent>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={handleSubmit}
                  className="w-full p-6 text-base"
                  disabled={isUrlSetDisabled}
                >
                  <div className="flex justify-center">
                    <CheckIcon className="mr-3 size-6"></CheckIcon>
                    Send selected RSS feeds
                  </div>
                </Button>
              </CardContent>
            </Card>
            <Card className="col-span-2 row-span-2 mt-12">
              <CardHeader className="mb-2">
                <CardTitle className="text-lg">Collector</CardTitle>
                <CardDescription>Manage article fetching</CardDescription>
              </CardHeader>
              <CardContent>
                <Separator />
                <Button
                  variant="outline"
                  className="mt-10 w-full p-6 text-base"
                  onClick={handleFetchStart}
                  disabled={isFetching}
                >
                  <div className="flex justify-center">
                    <BarsArrowUpIcon className="mr-3 size-6"></BarsArrowUpIcon>
                    Activate RSS fetching
                  </div>
                </Button>
              </CardContent>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full p-6 text-base"
                  onClick={handleFetchStop}
                  disabled={!isFetching}
                >
                  <div className="flex justify-center">
                    <BarsArrowDownIcon className="mr-3 size-6"></BarsArrowDownIcon>
                    Disable RSS fetching
                  </div>
                </Button>
              </CardContent>
            </Card>
            <Card className="col col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Export</CardTitle>
                <CardDescription>
                  Download article data in JSON, CSV or Parquet
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleArticleDownload('json')}
                  disabled={isDisabled}
                  className="w-[30%] p-6 text-base"
                >
                  <div className="flex justify-center">
                    <ArrowDownTrayIcon className="mr-1.5 size-6"></ArrowDownTrayIcon>
                    JSON
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleArticleDownload('csv')}
                  disabled={isDisabled}
                  className="w-[30%] p-6 text-base"
                >
                  <div className="flex justify-center">
                    <ArrowDownTrayIcon className="mr-1.5 size-6"></ArrowDownTrayIcon>
                    CSV
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleArticleDownload('parquet')}
                  disabled={isDisabled}
                  className="w-[30%] p-6 text-base"
                >
                  <div className="flex justify-center">
                    <ArrowDownTrayIcon className="mr-1.5 size-6"></ArrowDownTrayIcon>
                    Parquet
                  </div>
                </Button>
              </CardContent>
            </Card>
            <Card className="col-span-5">
              <CardHeader>
                <CardTitle className="text-lg">Search articles</CardTitle>
                <CardDescription>
                  Filter articles based on matching text
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
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
              </CardContent>
              <CardContent>
                <DataTable
                  columns={articleColumns}
                  data={searchData}
                  tableName={'Query results'}
                />
              </CardContent>
            </Card>
            <Logs />
            <div className="col-start-2 col-end-5 mt-16">
              <QuestionsAccordion />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

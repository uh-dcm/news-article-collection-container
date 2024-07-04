import React, { useEffect, useState } from 'react';
import { getAllFeedUrls, sendAllFeedUrls } from './services/feed_urls';
import {
  getFetchingStatus,
  keepFetching,
  stopFetching,
} from './services/fetching-news';
import {
  sendSearchQuery,
  sendStatisticsQuery,
} from './services/database_queries';
import axios from 'axios';
import './css/index.css';
import {
  ArrowDownTrayIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
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

import {
  DomainData,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

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
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statisticData, setStatisticsData] = useState<DomainData[][]>([]);

  const handleFilterInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSearchQuery(event.target.value);
  };

  const handleFetchStatistics = async () => {
    toast.dismiss();
    console.log(statisticData);

    const toastOptions = {
      loading: 'Getting statistics..',
      description: 'Note that the statistics might not be updated yet',
      duration: 4000,
      success: (msg: string) => msg,
      error: (error: string) => {
        console.error('Error getting statistics:', error);
        toastOptions.description =
          'Have you fetched any articles or is the downloading still in progress?';
        return 'Failed to get statistics';
      },
    } as ToastOptions satisfies ToastOptions;

    toast.promise(async () => {
      try {
        const data = await sendStatisticsQuery();
        setStatisticsData(data);
        return 'Got statistics succesfully!';
      } catch (error) {
        throw new Error();
      }
    }, toastOptions);
  };

  const handleFeedAdd = (feed: Feed) => {
    setFeedUrlList((prevData) => {
      // CAUTION: this could be slow for large lists, but it's fine for now
      if (!prevData.find((f) => f.url === feed.url)) {
        return [...prevData, feed];
      }

      return prevData;
    });

    if (!feedUrlList.find((f) => f.url === feed.url)) {
      const currentFeeds = feedUrlList.map((feed) => feed.url);
      const updatedFeeds = [...currentFeeds, feed.url];
      sendAllFeedUrls(updatedFeeds);
      handleSubmit(updatedFeeds);
    } else {
      toast.dismiss();
      toast.error('RSS Feed already exists');
    }
  };

  const handleSubmit = async (updatedFeeds: string[]) => {
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
        const response = await sendAllFeedUrls(updatedFeeds);

        if (response.status == 200) {
          toastOptions.description = null;
          return 'Feed list updated successfully!';
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

  const handleFetchStart = async () => {
    toast.dismiss();
    toast.info('RSS fetching in progress', {
      description: 'Gathering articles...',
      duration: Infinity,
      classNames: {
        title: 'text-sm',
      },
    });
    setIsFetching(true);
    setArticlesLoading(true);

    const response = await keepFetching();
    if (response.status === 'started') {
      handleSearchQuery();
    }
    setArticlesLoading(false);
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
    const updatedFeeds = feedUrlList
      .filter((item) => !selectedRows.includes(item))
      .map((feed: { url: string }) => feed.url);
    sendAllFeedUrls(updatedFeeds);
    handleSubmit(updatedFeeds);
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

    const updateArticleTable = async () => {
      try {
        await handleSearchQuery();
      } catch (e) {
        /* empty */
      }
    };
    updateArticleTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.15,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 0, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <motion.div
        className="flex min-h-screen flex-col"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Header />
        <motion.div
          className="mt-16 flex justify-center px-4 sm:px-6 lg:px-8"
          variants={itemVariants}
        >
          <div className="w-full max-w-5xl">
            <motion.div className="mt-10" variants={itemVariants}>
              <h1 className="mb-6 text-3xl font-semibold">Dashboard</h1>
              <Separator />
            </motion.div>

            <motion.div
              className="mt-14 grid gap-6 sm:grid-cols-1 lg:grid-cols-5"
              variants={containerVariants}
            >
              <Card className="lg:col-span-3 lg:row-span-3">
                <CardHeader>
                  <CardTitle className="text-lg">RSS Feed Manager</CardTitle>
                  <CardDescription>Add or Delete feeds</CardDescription>
                </CardHeader>
                <CardContent>
                  <RssInput
                    handleFeedAdd={handleFeedAdd}
                    isUrlSetDisabled={isUrlSetDisabled}
                  />
                </CardContent>
                <CardContent>
                  <DataTable
                    columns={feedColumns}
                    data={feedUrlList}
                    onDeleteSelected={deleteSelectedRows}
                    tableName={'List of RSS feeds'}
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 lg:row-span-2">
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
                      <BarsArrowUpIcon className="mr-3 size-6" />
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
                      <BarsArrowDownIcon className="mr-3 size-6" />
                      Disable RSS fetching
                    </div>
                  </Button>
                </CardContent>
              </Card>

              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 lg:row-span-1"
              >
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Export</CardTitle>
                    <CardDescription>
                      Download article data in JSON, CSV or Parquet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handleArticleDownload('json')}
                      disabled={isDisabled}
                      className="w-full p-6 text-base sm:w-[30%]"
                    >
                      <div className="flex justify-center">
                        <ArrowDownTrayIcon className="mr-1.5 size-6" />
                        JSON
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleArticleDownload('csv')}
                      disabled={isDisabled}
                      className="w-full p-6 text-base sm:w-[30%]"
                    >
                      <div className="flex justify-center">
                        <ArrowDownTrayIcon className="mr-1.5 size-6" />
                        CSV
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleArticleDownload('parquet')}
                      disabled={isDisabled}
                      className="w-full p-6 text-base sm:w-[30%]"
                    >
                      <div className="flex justify-center">
                        <ArrowDownTrayIcon className="mr-1.5 size-6" />
                        Parquet
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="lg:col-span-5 lg:row-span-1"
              >
                <Card className="lg:col-span-5">
                  <CardHeader className="mb-2">
                    <CardTitle className="text-center text-lg">
                      Statistics
                    </CardTitle>
                    <CardDescription className="text-center">
                      View summary statistics of all articles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between">
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={handleFetchStatistics}
                          disabled={isDisabled}
                          className="w-full p-6 text-base sm:w-[100%]"
                        >
                          <div className="flex justify-center">
                            <ChartBarIcon className="mr-1.5 size-6"></ChartBarIcon>
                            View statistics
                          </div>
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="mx-auto w-full max-w-sm">
                          <DrawerHeader>
                            <DrawerTitle>
                              {' '}
                              Articles contain{' '}
                              {statisticData.length === 0
                                ? 0
                                : statisticData[0].length}{' '}
                              domain(s) and{' '}
                              {statisticData.length === 0
                                ? 0
                                : statisticData[1].length}{' '}
                              subdirectories{' '}
                            </DrawerTitle>
                            <DrawerDescription>
                              {' '}
                              Number of articles by domain and subdirectory
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="mt-3 h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart width={400} height={400}>
                                <Pie
                                  data={statisticData[0]}
                                  dataKey="count"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={60}
                                  fill="#8884d8"
                                />
                                <Tooltip />
                                <Pie
                                  data={statisticData[1]}
                                  dataKey="count"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={70}
                                  outerRadius={90}
                                  fill="#82ca9d"
                                  label
                                />
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Close</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="lg:col-span-5">
                <Card className="lg:col-span-5">
                  <CardHeader>
                    <CardTitle className="text-lg">Search articles</CardTitle>
                    <CardDescription>
                      Filter articles based on matching text
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                    <Input
                      className="w-full p-6"
                      onChange={handleFilterInputChange}
                      placeholder="Insert search query..."
                      value={searchQuery}
                    />
                    <Button
                      className="p-6 text-base"
                      variant="outline"
                      onClick={handleSearchQuery}
                    >
                      <div className="flex justify-center">
                        <MagnifyingGlassIcon className="mr-3 size-6" />
                        Search
                      </div>
                    </Button>
                  </CardContent>
                  <CardContent>
                    <DataTable
                      columns={articleColumns}
                      data={searchData}
                      tableName={'Query results'}
                      isLoading={articlesLoading}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mb-20 lg:col-span-5"
              >
                <Logs />
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mb-40 lg:col-start-2 lg:col-end-5"
              >
                <QuestionsAccordion />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <Footer />
      </motion.div>
    </ThemeProvider>
  );
}

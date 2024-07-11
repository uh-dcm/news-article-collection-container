import React, { useEffect, useState } from 'react';
import { getAllFeedUrls, sendAllFeedUrls } from './services/feed_urls';

import {
  getFetchingStatus,
  keepFetching,
  stopFetching,
} from './services/fetching-news';
import {
  sendSearchQuery,
  sendStatisticsQuery
} from './services/database_queries';

import authClient from './services/authclient';

import './css/index.css';
import {
  ArrowDownTrayIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  MagnifyingGlassIcon,
  ChartBarSquareIcon,
  ChartPieIcon
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
import TimeSeries from './components/timeseries';
import { PieChart, SubPieChart } from './components/piechart';
import { DataTable } from './components/ui/data-table';
import { articleColumns, Article } from './components/ui/article-columns';
import { feedColumns, Feed } from './components/ui/feed-columns';
import InfoIcon from './components/ui/info-icon';

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

import { motion } from 'framer-motion';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import { checkUserExists } from './services/authfunctions';

type ToastOptions = {
  loading: string;
  description: string | null;
  success: (msg: string) => string;
  error: (error: string) => string;
};

import {
  registerUser,
  getIsValidToken,
  loginUser,
} from './services/authfunctions';

export default function App() {
  const [feedUrlList, setFeedUrlList] = useState<Feed[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isUrlSetDisabled, setIsUrlSetDisabled] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchData, setSearchData] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statisticData, setStatisticsData] = useState<DomainData[][]>([]);
  const [subDirectoryData, setSubDirectoryData] = useState<DomainData[]>([]);
  const [userExists, setUserExists] = useState(false);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const response = await checkUserExists();
      setUserExists(response.exists);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await getIsValidToken();
          setValidToken(response);
        }
      } catch (error) {
        console.log('Error in checkToken: ', error);
      }
    };
    checkToken();
  }, []);

  const formSubDirectoryData = async (url: string) => {
    await setSubDirectoryData(statisticData[1].filter(x => x.name.startsWith(url)))
  };

  const handleFilterInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSearchQuery(event.target.value);
  };

  const handleFetchStatistics = async () => {
    toast.dismiss();

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
        console.log(statisticData);

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
        sendAllFeedUrls([...prevData, feed].map((f) => f.url));
        handleSubmit([...prevData, feed].map((f) => f.url));
        return [...prevData, feed];
      }

      toast.dismiss();
      toast.error('RSS Feed already exists');
      return prevData;
    });
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

  const handleArticleDownload = async (format: 'json' | 'csv' | 'parquet', isQuery: boolean = false) => {
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
        const endpoint = isQuery ? '/api/articles/export_query' : '/api/articles/export';
        const response = await authClient.get(
          `${endpoint}?format=${format}`,
          {
            responseType: 'blob',
          }
        );
  
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `articles${isQuery ? '_query' : ''}.${format}`);
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
    if (validToken) fetchFeedUrls();

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
    if (validToken) isFetching();

    const updateArticleTable = async () => {
      try {
        await handleSearchQuery();
      } catch (e) {
        /* empty */
      }
    };
    if (validToken) updateArticleTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validToken]);

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

  // TODO: add register / login functionality
  // for now, only login with fixed pass shall be used

  if (!userExists) {
    // register view
    return (
      <div
        className="flex h-screen flex-col items-center justify-center"
        data-testid="register-view"
      >
        <h1 className="text-3xl font-semibold">RSS Feed Reader</h1>
        <p className="mt-4 text-lg">Please register to use the app.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={async () => {
            const response = await registerUser('testpassword');
            if (response) {
              setUserExists(true);
            } else {
              toast.error('Failed to register');
            }
          }}
        >
          Register
        </Button>
      </div>
    );
  }

  if (!validToken) {
    // login with password
    return (
      <div
        className="flex h-screen flex-col items-center justify-center"
        data-testid="login-view"
      >
        <h1 className="text-3xl font-semibold">RSS Feed Reader</h1>
        <p className="mt-4 text-lg">Please log in to use the app.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={async () => {
            const response = await loginUser('testpassword');
            if (response.access_token) {
              localStorage.setItem('accessToken', response.access_token);
              setValidToken(true);
            } else {
              toast.error('Failed to login');
            }
          }}
        >
          Log in
        </Button>
      </div>
    );
  }

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
              <h1 className="mb-4 text-3xl font-semibold">Dashboard</h1>
              <Separator />
            </motion.div>

            <motion.div
              className="mt-12 grid gap-6 sm:grid-cols-1 lg:grid-cols-5"
              variants={containerVariants}
            >
              <Card className="lg:col-span-3 lg:row-span-3">
                <CardHeader>
                  <CardTitle className="text-lg">RSS Feed Manager</CardTitle>
                  <CardDescription>Add or delete feeds</CardDescription>
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
                  <CardTitle className="text-lg">Fetcher</CardTitle>
                  <CardDescription>
                    Manage article fetching
                    <InfoIcon
                      tooltipContent="Collects new article data from feeds every 5 minutes."
                      ariaLabel="Fetcher info"
                    />
                  </CardDescription>
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
                      Download all article data in JSON, CSV or Parquet
                      <InfoIcon
                        tooltipContent="See Q&A for more info."
                        ariaLabel="Download info"
                      />
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
                          className="w-full p-6 text-base sm:w-[45%]"
                        >
                          <div className="flex justify-center">
                            <ChartPieIcon className="mr-1.5 size-6"></ChartPieIcon>
                            Domain distribution
                          </div>
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="mx-auto w-full max-w-full">
                          <DrawerHeader>
                            <DrawerTitle>
                              {' '}
                              {statisticData.length === 0
                                ? 0
                                : statisticData[0].map(x => x.count).reduce((s, c) => s + c, 0)}{' '}
                              articles collected from{' '}
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
                              Click on a domain to view the subdirectory distribution
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="grid grid-cols-1 grid-cols-2 gap-4">
                              <PieChart data={statisticData[0]} fnc={formSubDirectoryData}></PieChart>
                              <SubPieChart data={subDirectoryData}></SubPieChart>
                          </div>
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Close</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </div>
                      </DrawerContent>
                    </Drawer>
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={handleFetchStatistics}
                          disabled={isDisabled}
                          className="w-full p-6 text-base sm:w-[45%]"
                        >
                          <div className="flex justify-center">
                            <ChartBarSquareIcon className="mr-1.5 size-6"></ChartBarSquareIcon>
                            Time series
                          </div>
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="mx-auto w-full max-w-sm">
                          <DrawerHeader>
                            <DrawerTitle>
                              {' '}
                              Time series for collected articles
                            </DrawerTitle>
                            <DrawerDescription>
                              {' '}
                              Number of articles collected per day
                            </DrawerDescription>
                          </DrawerHeader>
                            <TimeSeries data={statisticData[2]}></TimeSeries>
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
                      Query and export articles on matching data
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
                      reducedSpacing={true}
                    />
                  </CardContent>
                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handleArticleDownload('json', true)}
                      disabled={isDisabled || searchData.length === 0}
                      className="w-full p-6 text-base sm:w-[30%]"
                    >
                      <div className="flex justify-center">
                        <ArrowDownTrayIcon className="mr-1.5 size-6" />
                        JSON (Query)
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleArticleDownload('csv', true)}
                      disabled={isDisabled || searchData.length === 0}
                      className="w-full p-6 text-base sm:w-[30%]"
                    >
                      <div className="flex justify-center">
                        <ArrowDownTrayIcon className="mr-1.5 size-6" />
                        CSV (Query)
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleArticleDownload('parquet', true)}
                      disabled={isDisabled || searchData.length === 0}
                      className="w-full p-6 text-base sm:w-[30%]"
                    >
                      <div className="flex justify-center">
                        <ArrowDownTrayIcon className="mr-1.5 size-6" />
                        Parquet (Query)
                      </div>
                    </Button>
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
      <ReactTooltip
        id="react-tooltip"
        place="right"
        variant="dark"
        style={{ fontSize: '10px' }}
      />
    </ThemeProvider>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { DownloadButton } from '@/components/ui/download-button';
import InfoIcon from '@/components/ui/info-icon';
import { Switch } from '@/components/ui/switch';

// feeds and fetching
import RssInput from './rss-input';
import { DataTable } from '@/components/ui/data-table';
import { feedColumns, Feed } from '@/components/ui/feed-columns';
import { getAllFeedUrls, sendAllFeedUrls } from './feed-urls';
import { getFetchingStatus, keepFetching, stopFetching } from './fetching-news';

// statistics
import {
  sendStatisticsQuery,
  sendTextQuery,
} from '@/services/database-queries';
import StatisticsDrawers from '@/features/statistics/statistics-drawers';
import { DomainData } from '@/components/ui/drawer';

// download function
import { handleArticleDownload } from '@/services/article-download';
import { Label } from '@/components/ui/label';

export default function Dashboard() {
  const [feedUrlList, setFeedUrlList] = useState<Feed[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isUrlSetDisabled, setIsUrlSetDisabled] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statisticData, setStatisticsData] = useState<DomainData[][]>([]);
  const [subDirectoryData, setSubDirectoryData] = useState<DomainData[]>([]);
  const [textData, setTextData] = useState<string[]>([]);
  const [isStatisticsDisabled, setIsStatisticsDisabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Feed check at start from backend
  useEffect(() => {
    const fetchFeedUrls = async () => {
      const feedUrls = await getAllFeedUrls();
      if (typeof feedUrls === 'string') return;
      const feedUrlObjArray = feedUrls.map((feedUrl: string) => ({
        url: feedUrl.trim(),
      }));
      setFeedUrlList(feedUrlObjArray);
    };

    const checkFetchingStatus = async () => {
      const response = await getFetchingStatus();
      if (response.status === 'running') {
        setIsFetching(true);
      }
    };

    fetchFeedUrls();
    checkFetchingStatus();
  }, []);

  // Processing status stream
  useEffect(() => {
    const eventSource = new EventSource('/stream');
    eventSource.addEventListener('processing_status', (event) => {
      setIsProcessing(event.data === 'true');
    });

    // disable complaints about chunking that seem to affect nothing
    eventSource.onerror = (event) => {
      if (event instanceof ErrorEvent && event.error instanceof Error) {
        if (
          event.error.message.includes('net::ERR_INCOMPLETE_CHUNKED_ENCODING')
        ) {
          event.preventDefault();
        }
      }
    };

    return () => eventSource.close();
  }, []);

  // Feed add triggered by "Add to list"
  const handleFeedAdd = (feed: Feed) => {
    setFeedUrlList((prevData) => {
      if (!prevData.find((f) => f.url === feed.url)) {
        const newList = [...prevData, feed];
        sendAllFeedUrls(newList.map((f) => f.url));
        handleSubmit(newList.map((f) => f.url));
        return newList;
      }
      toast.error('That RSS feed is already listed');
      return prevData;
    });
  };

  // Feed submit triggered by above
  const handleSubmit = async (updatedFeeds: string[]) => {
    setIsUrlSetDisabled(true);
    try {
      const response = await sendAllFeedUrls(updatedFeeds);
      if (response.status === 200) {
        toast.success('Feed list updated successfully!');
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Failed to submit the feed URLs.');
    } finally {
      setIsUrlSetDisabled(false);
    }
  };

  // Feed deletion from list
  const deleteSelectedRows = (selectedRows: Feed[]) => {
    const updatedFeeds = feedUrlList
      .filter((item) => !selectedRows.includes(item))
      .map((feed) => feed.url);
    setFeedUrlList(feedUrlList.filter((item) => !selectedRows.includes(item)));
    sendAllFeedUrls(updatedFeeds);
    handleSubmit(updatedFeeds);
  };

  // Feed page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Feed pagination
  const paginatedFeedUrlList = feedUrlList.slice(
    (currentPage - 1) * 8,
    currentPage * 8
  );

  // Next 3 const are fetch related
  const handleFetchStart = async () => {
    toast.dismiss();
    toast.info('RSS fetching in progress', {
      description: 'Gathering articles...',
      duration: 5000,
      classNames: { title: 'text-sm' },
    });
    setIsFetching(true);
    const response = await keepFetching();
    if (response.status === 'started') {
      // Implement handleSearchQuery etc. or remove if not needed
    }
  };

  const handleFetchStop = () => {
    setIsFetching(false);
    toast.dismiss();
    toast.warning('RSS fetching stopped');
    stopFetching();
  };

  const handleSwitch = () => {
    if (isFetching) {
      handleFetchStop();
    } else {
      handleFetchStart();
    }
  };

  // Download function
  const handleDownload = (format: 'json' | 'csv' | 'parquet') => {
    handleArticleDownload(format, false, setIsDisabled);
  };

  // Next 3 const are stats related
  const handleFetchStatistics = async () => {
    setIsStatisticsDisabled(true);
    try {
      const data = await sendStatisticsQuery(false);
      setStatisticsData(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      toast.error('Failed to get statistics. Have you fetched yet?');
    } finally {
      setIsStatisticsDisabled(false);
    }
  };

  const formSubDirectoryData = async (url: string) => {
    setSubDirectoryData(statisticData[1].filter((x) => x.name.startsWith(url)));
  };

  const handleFetchText = async () => {
    setIsDisabled(true);
    try {
      const data = await sendTextQuery(false);
      setTextData(data.map((x: Map<string, string>) => Object.values(x)[0]));
    } catch (error) {
      console.error('Failed to fetch filtered statistics:', error);
      toast.error('Failed to get full text. Have you fetched yet?');
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <PageLayout title="Dashboard">
      {/* Feed manager */}
      <motion.div variants={itemVariants}>
        <Card className="mt-6 lg:col-span-3 lg:row-span-3">
          <CardHeader className="relative pb-4">
            <CardTitle className="text-lg">RSS feeds</CardTitle>
            <CardDescription className="flex items-center">
              Add or delete feeds
              <InfoIcon
                tooltipContent="Addresses that often end in .rss, .xml or /feed/."
                ariaLabel="RSS feed URL info"
              />
            </CardDescription>
            <div className="absolute right-4 top-4">
              <Card className="rounded-md">
                <div className="flex items-center px-4 py-2">
                  <Switch
                    id="toggleFetching"
                    data-testid="fetchToggle"
                    checked={isFetching}
                    onCheckedChange={handleSwitch}
                    className="mr-2 data-[state=checked]:bg-green-500"
                  />
                  <Label
                    htmlFor="toggleFetching"
                    className="whitespace-nowrap text-sm"
                  >
                    Toggle fetching
                  </Label>
                  <InfoIcon
                    tooltipContent="Collects new article data from feeds every 5 minutes."
                    ariaLabel="Fetcher info"
                  />
                  <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />
                  <div className="flex items-center whitespace-nowrap text-sm">
                    <span className="mr-2 font-bold">Status:</span>
                    <span
                      className={`inline-flex w-32 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-300 ${
                        isProcessing
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                      }`}
                    >
                      {isProcessing && (
                        <span className="relative mr-2 flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
                        </span>
                      )}
                      <span className="truncate">
                        {isProcessing ? 'Processing' : 'Not processing'}
                      </span>
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pb-6 pt-2">
            <div>
              <DataTable<Feed, unknown>
                columns={feedColumns}
                data={paginatedFeedUrlList}
                onDeleteSelected={deleteSelectedRows}
                tableName="RSS feeds"
                hideTitle={true}
                showDeleteButton={true}
                totalCount={feedUrlList.length}
                currentPage={currentPage}
                itemsPerPage={8}
                onPageChange={handlePageChange}
                showPagination={true}
                showPageNumbers={false}
              />
            </div>
            <RssInput
              handleFeedAdd={handleFeedAdd}
              isUrlSetDisabled={isUrlSetDisabled}
              downloadButton={
                <DownloadButton
                  onDownload={handleDownload}
                  isDisabled={isDisabled}
                  buttonText="Download All Articles"
                  className="w-[230px]"
                />
              }
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics for all articles, not just filtered */}
      <motion.div variants={itemVariants}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
            <CardDescription>
              View summary statistics of all articles
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <StatisticsDrawers
              statisticData={statisticData}
              subDirectoryData={subDirectoryData}
              textData={textData}
              isDisabled={isStatisticsDisabled}
              handleFetchStatistics={handleFetchStatistics}
              handleFetchText={handleFetchText}
              formSubDirectoryData={formSubDirectoryData}
              isFiltered={false}
            />
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

{/* custom ui */}
import { PageLayout } from '@/components/page-layout';
import { itemVariants } from '@/components/animation-variants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BarsArrowUpIcon, BarsArrowDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import InfoIcon from '@/components/ui/info-icon';

{/* feeds and fetching */}
import RssInput from './rss-input';
import { DataTable } from '@/components/ui/data-table';
import { feedColumns, Feed } from '@/components/ui/feed-columns';
import { getAllFeedUrls, sendAllFeedUrls } from './feed_urls';
import { getFetchingStatus, keepFetching, stopFetching } from './fetching-news';

{/* statistics */}
import { sendStatisticsQuery } from '@/services/database_queries';
import StatisticsDrawers from '@/features/statistics/statistics-drawers';
import { DomainData } from '@/components/ui/drawer';

{/* download function */}
import { handleArticleDownload } from '@/lib/articleDownload';

export default function Dashboard() {
  const [feedUrlList, setFeedUrlList] = useState<Feed[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isUrlSetDisabled, setIsUrlSetDisabled] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statisticData, setStatisticsData] = useState<DomainData[][]>([]);
  const [subDirectoryData, setSubDirectoryData] = useState<DomainData[]>([]);
  const [isStatisticsDisabled, setIsStatisticsDisabled] = useState(false);

  useEffect(() => {
    const fetchFeedUrls = async () => {
      const feedUrls = await getAllFeedUrls();
      if (typeof feedUrls === 'string') return;
      const feedUrlObjArray = feedUrls.map((feedUrl: string) => ({ url: feedUrl.trim() }));
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

  useEffect(() => {
    const eventSource = new EventSource('/stream');
    eventSource.addEventListener('processing_status', (event) => {
      setIsProcessing(event.data === 'true');
    });
    return () => eventSource.close();
  }, []);

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

  const handleSubmit = async (updatedFeeds: string[]) => {
    setIsUrlSetDisabled(true);
    try {
      const response = await sendAllFeedUrls(updatedFeeds);
      if (response.status === 200) {
      toast.success('Feed list updated successfully!');
      console.error('Successfully added feed to list');
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Failed to submit the feed URLs.');
    } finally {
      setIsUrlSetDisabled(false);
    }
  };

  const handleFetchStart = async () => {
    toast.info('RSS fetching in progress', {
      description: 'Gathering articles...',
      duration: 5000,
      classNames: { title: 'text-sm' },
    });
    setIsFetching(true);
    const response = await keepFetching();
    if (response.status === 'started') {
      // Implement handleSearchQuery or remove if not needed
    }
  };

  const handleFetchStop = () => {
    setIsFetching(false);
    toast.warning('RSS fetching stopped.');
    stopFetching();
  };

  const deleteSelectedRows = (selectedRows: Feed[]) => {
    const updatedFeeds = feedUrlList
      .filter((item) => !selectedRows.includes(item))
      .map((feed) => feed.url);
    setFeedUrlList(feedUrlList.filter((item) => !selectedRows.includes(item)));
    sendAllFeedUrls(updatedFeeds);
    handleSubmit(updatedFeeds);
  };

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


  return (
    <PageLayout title="Dashboard">
      {/* Feed manager */}
      <motion.div variants={itemVariants}>
        <Card className="mt-6 lg:col-span-3 lg:row-span-3">
          <CardHeader>
            <CardTitle className="text-lg">RSS feed manager</CardTitle>
            <CardDescription>Add or delete feeds</CardDescription>
          </CardHeader>
          <CardContent>
            <RssInput handleFeedAdd={handleFeedAdd} isUrlSetDisabled={isUrlSetDisabled} />
            <DataTable
              columns={feedColumns}
              data={feedUrlList}
              onDeleteSelected={deleteSelectedRows}
              tableName={'List of RSS feeds'}
              showGlobalFilter={false}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Fetching manager */}
      <motion.div variants={itemVariants}>
        <Card className="mt-6 lg:col-span-2 lg:row-span-2">
          <CardHeader className="relative">
            <div className="absolute right-4 top-4 flex flex-col items-end text-sm">
              <span className={isFetching ? 'text-primary' : 'text-muted-foreground'}>
                {isFetching ? 'Fetching' : 'Not fetching'}
              </span>
              <span className={isProcessing ? 'text-primary' : 'text-muted-foreground'}>
                {isProcessing ? 'Processing' : 'Not processing'}
              </span>
            </div>
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
            <Button
              variant="outline"
              className="mt-4 w-full p-6 text-base"
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
      </motion.div>

      {/* Download for all articles, not just filtered */}
      <motion.div variants={itemVariants}>
        <Card className="mt-6 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Export</CardTitle>
            <CardDescription>
              Download all article data in JSON, CSV or Parquet
              <InfoIcon tooltipContent="See Q&A below for more info." ariaLabel="Download info" />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              {['JSON', 'CSV', 'Parquet'].map((format) => (
                  <Button
                  key={format.toLowerCase()}
                  variant="outline"
                  onClick={() => handleArticleDownload(format.toLowerCase() as 'json' | 'csv' | 'parquet', false, setIsDisabled)}
                  disabled={isDisabled}
                  className="w-full p-6 text-base sm:w-[30%]"
                  >
                  <div className="flex justify-center">
                      <ArrowDownTrayIcon className="mr-1.5 size-6" />
                      {format}
                  </div>
                  </Button>
              ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics for all articles, not just filtered */}
      <motion.div variants={itemVariants}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
            <CardDescription>View summary statistics of all articles</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <StatisticsDrawers
              statisticData={statisticData}
              subDirectoryData={subDirectoryData}
              isDisabled={isStatisticsDisabled}
              handleFetchStatistics={handleFetchStatistics}
              formSubDirectoryData={formSubDirectoryData}
              isFiltered={false}
            />
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

{
  /* custom ui */
}
import { PageLayout } from '@/components/page-layout';
import { itemVariants } from '@/components/animation-variants';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import InfoIcon from '@/components/ui/info-icon';
import { Switch } from '@/components/ui/switch';

{
  /* feeds and fetching */
}
import RssInput from './rss-input';
import { DataTable } from '@/components/ui/data-table';
import { feedColumns, Feed } from '@/components/ui/feed-columns';
import { getAllFeedUrls, sendAllFeedUrls } from './feed-urls';
import { getFetchingStatus, keepFetching, stopFetching } from './fetching-news';

{
  /* statistics */
}
import { sendStatisticsQuery } from '@/services/database-queries';
import StatisticsDrawers from '@/features/statistics/statistics-drawers';
import { DomainData } from '@/components/ui/drawer';

{
  /* download function */
}
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
  const [isStatisticsDisabled, setIsStatisticsDisabled] = useState(false);

  {
    /* Feed check at start from backend */
  }
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

  {
    /* Processing status stream */
  }
  useEffect(() => {
    const eventSource = new EventSource('/stream');
    eventSource.addEventListener('processing_status', (event) => {
      setIsProcessing(event.data === 'true');
    });
    return () => eventSource.close();
  }, []);

  {
    /* Feed add triggered by "Add to list" */
  }
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

  {
    /* Feed submit triggered by above */
  }
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
      // Implement handleSearchQuery etc. or remove if not needed
    }
  };

  const handleFetchStop = () => {
    setIsFetching(false);
    toast.warning('RSS fetching stopped.');
    stopFetching();
  };

  {
    /* Feed deletion from list */
  }
  const deleteSelectedRows = (selectedRows: Feed[]) => {
    const updatedFeeds = feedUrlList
      .filter((item) => !selectedRows.includes(item))
      .map((feed) => feed.url);
    setFeedUrlList(feedUrlList.filter((item) => !selectedRows.includes(item)));
    sendAllFeedUrls(updatedFeeds);
    handleSubmit(updatedFeeds);
  };

  {
    /* Two const below are stats related */
  }
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

  const handleSwitch = () => {
    if (isFetching) {
      handleFetchStop();
    } else {
      handleFetchStart();
    }
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
            <RssInput
              handleFeedAdd={handleFeedAdd}
              isUrlSetDisabled={isUrlSetDisabled}
            />
            <DataTable
              columns={feedColumns}
              data={feedUrlList}
              onDeleteSelected={deleteSelectedRows}
              tableName={'List of RSS feeds'}
              showGlobalFilter={false}
            />
            <div className="flex">
              <Card className="rounded-md">
                <div className="flex items-center px-4 py-2">
                  <Switch
                    id="toggleFetching"
                    data-testid="fetchToggle"
                    checked={isFetching}
                    onCheckedChange={handleSwitch}
                    className="mr-2 data-[state=checked]:bg-green-500"
                  />
                  <Label htmlFor="toggleFetching">
                    Toggle article fetching
                  </Label>
                  <InfoIcon
                    tooltipContent="Collects new article data from feeds every 5 minutes."
                    ariaLabel="Fetcher info"
                  />
                  <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />

                  <div className="text-sm">
                    <span
                      className={
                        isProcessing ? 'text-primary' : 'text-muted-foreground'
                      }
                    >
                      <b>Processing status:</b>
                      {isProcessing ? ' Processing' : ' Not processing'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
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
              <InfoIcon
                tooltipContent="See Q&A below for more info."
                ariaLabel="Download info"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            {['JSON', 'CSV', 'Parquet'].map((format) => (
              <Button
                key={format.toLowerCase()}
                variant="outline"
                onClick={() =>
                  handleArticleDownload(
                    format.toLowerCase() as 'json' | 'csv' | 'parquet',
                    false,
                    setIsDisabled
                  )
                }
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
            <CardDescription>
              View summary statistics of all articles
            </CardDescription>
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

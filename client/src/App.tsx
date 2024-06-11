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

import { serverUrl } from './main';

function App() {
  const [feedUrls, setFeedUrls] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const handleInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setFeedUrls(event.target.value);
  };

  const handleSubmit = () => {
    const rssFeeds = feedUrls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '');
    console.log(rssFeeds);
    sendAllFeedUrls(rssFeeds);
  };

  const handleFetchStart = () => {
    keepFetching();
  };

  const handleFetchStop = () => {
    stopFetching();
  };

  const handleArticleDownload = async () => {
    setIsDisabled(true);

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
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to download the file.');
    } finally {
      setIsDisabled(false);
    }
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
      <div className="relative flex items-center p-3 shadow-md">
        <img
          className="mx-2"
          width="40"
          src="https://avatars.githubusercontent.com/u/80965139?s=200&v=4"
        ></img>
        <h1 className="text-3xl">News article collector</h1>
      </div>

      <div className="mb-8 mt-10 flex justify-center">
        <div className="flex w-[550px] min-w-[200px] flex-col justify-center">
          <p className="my-3">
            Enter RSS feed URLs, each on their own separate line:
          </p>
          <textarea
            value={feedUrls}
            onChange={handleInputChange}
            placeholder="RSS-feed addresses here..."
            rows={4}
            cols={50}
            className="mb-2 min-h-28 resize-y rounded-lg border border-gray-500 p-2 font-mono text-sm outline-none dark:bg-gray-950"
          />
        </div>
      </div>

      <div className="mb-20 flex justify-center">
        <div className="grid w-[550px] grid-cols-2 grid-rows-2 gap-4">
          <button
            onClick={handleSubmit}
            className="col-span-2 border border-gray-500 outline-none hover:bg-slate-50 dark:bg-gray-950 dark:hover:bg-gray-900 dark:hover:text-white"
          >
            <div className="flex justify-center">
              <CheckIcon className="mr-3 size-6"></CheckIcon>
              Set RSS feed list
            </div>
          </button>
          <button
            onClick={handleFetchStart}
            className="border border-gray-500 outline-none hover:bg-slate-50 dark:bg-gray-950 dark:hover:bg-gray-900 dark:hover:text-white"
          >
            <div className="flex justify-center">
              <BarsArrowUpIcon className="mr-3 size-6"></BarsArrowUpIcon>
              Activate RSS fetching
            </div>
          </button>
          <button
            onClick={handleFetchStop}
            className="border border-gray-500 outline-none hover:bg-slate-50 dark:bg-gray-950 dark:hover:bg-gray-900 dark:hover:text-white"
          >
            <div className="flex justify-center">
              <BarsArrowDownIcon className="mr-3 size-6"></BarsArrowDownIcon>
              Disable RSS fetching
            </div>
          </button>
          <button
            onClick={handleArticleDownload}
            disabled={isDisabled}
            className="col-span-2 border border-gray-500 outline-none hover:bg-slate-50 dark:bg-gray-950 dark:hover:bg-gray-900 dark:hover:text-white"
          >
            {isDisabled ? (
              'Downloading...'
            ) : (
              <div className="flex justify-center">
                <ArrowDownTrayIcon className="mr-3 size-6"></ArrowDownTrayIcon>
                Download articles
              </div>
            )}
          </button>
          {isDisabled && (
            <p className="col-span-2">
              Please note that the download might take some time.
            </p>
          )}
        </div>
      </div>
      <div className="mt-auto flex w-full flex-col items-center p-3">
        <div className="mb-3 flex items-center">
          <div className="text-sm">
            <a href="https://github.com/uh-dcm/news-article-collection-container">
              &copy; University of Helsinki, Digital and Computational Methods
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

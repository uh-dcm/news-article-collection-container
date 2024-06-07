import React, { useEffect, useState } from 'react';
import { getAllFeedUrls, sendAllFeedUrls } from './services/feed_urls';
import { keepFetching, stopFetching } from './services/fetching-news';
import axios from 'axios';
import './css/index.css';

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
      const response = await axios.get('http://localhost:4000/api/articles', {
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
    <div className="App">
      <h1 className="text-5xl">News article collector</h1>
      <p className="my-3">
        Enter RSS feed URLs, each on their own separate line:
      </p>
      <textarea
        value={feedUrls}
        onChange={handleInputChange}
        placeholder="RSS-feed addresses here..."
        rows={4}
        cols={50}
        className="mb-2 min-h-28 resize-y rounded-lg border border-gray-500 bg-gray-950 p-2 font-mono text-sm text-gray-300 outline-none"
      />
      <br />
      <div className="grid grid-cols-2 grid-rows-2 gap-4">
        <button
          onClick={handleSubmit}
          className="border border-gray-500 bg-gray-950 text-gray-300 outline-none hover:bg-gray-900 hover:text-white"
        >
          Set RSS feed list
        </button>
        <button
          onClick={handleFetchStart}
          className="border border-gray-500 bg-gray-950 text-gray-300 outline-none hover:bg-gray-900 hover:text-white"
        >
          Activate RSS fetching
        </button>
        <button
          onClick={handleFetchStop}
          className="border border-gray-500 bg-gray-950 text-gray-300 outline-none hover:bg-gray-900 hover:text-white"
        >
          Disable RSS fetching
        </button>
        <button
          onClick={handleArticleDownload}
          disabled={isDisabled}
          className="border border-gray-500 bg-gray-950 text-gray-300 outline-none hover:bg-gray-900 hover:text-white"
        >
          {isDisabled ? 'Downloading...' : 'Download articles'}
        </button>
        {isDisabled && (
          <p>Please note that the download might take some time.</p>
        )}
      </div>
    </div>
  );
}

export default App;

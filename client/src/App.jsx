import React, { useEffect, useState } from "react";
import { getAllFeedUrls, sendAllFeedUrls } from "./services/feed_urls";
import { keepFetching, stopFetching } from "./services/fetching-news";

function App() {
  const [feedUrls, setFeedUrls] = useState("");

  const handleInputChange = (event) => {
    setFeedUrls(event.target.value);
  };

  const handleSubmit = () => {
    const rssFeeds = feedUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url !== "");
    console.log(rssFeeds);
    sendAllFeedUrls(rssFeeds);
  };

  const handleFetchStart = () => {
    keepFetching();
  };

  const handleFetchStop = () => {
    stopFetching();
  };

  useEffect(() => {
    const fetchFeedUrls = async () => {
      const feedUrls = await getAllFeedUrls();
      setFeedUrls(feedUrls.join("\n"));
    };
    fetchFeedUrls();
  }, []);

  return (
    <div className="App">
      <h1>RSS Feed Reader</h1>
      <p>Enter RSS feed URLs, each on their own separate line:</p>
      <textarea
        value={feedUrls}
        onChange={handleInputChange}
        placeholder="Syötä RSS lähteet tähän..."
        rows="4"
        cols="50"
        // style={{ resize: "none" }}
      />
      <br />
      <div id="buttons">
        <button
          onClick={handleSubmit}
          className="hae"
          style={{
            fontSize: "20px",
            padding: "10px 20px",
            margin: "4px 0px",
            backgroundColor: "#0000FF",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Set RSS feed list
        </button>
        <br />
        <button
          onClick={handleFetchStart}
          className="hae"
          style={{
            fontSize: "20px",
            padding: "10px 20px",
            margin: "4px 0px",
            backgroundColor: "#00CF00",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Activate RSS fetching
        </button>
        <br />
        <button
          onClick={handleFetchStop}
          className="hae"
          style={{
            fontSize: "20px",
            padding: "10px 20px",
            margin: "4px 0px",
            backgroundColor: "#F00000",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Disable RSS fetching
        </button>
        <a href="http://localhost:4000/api/articles" download="articles.json">
          Download articles
        </a>
      </div>
    </div>
  );
}

export default App;

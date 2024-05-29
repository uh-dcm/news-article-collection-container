import React, { useState } from "react";

function App() {
  const [feedUrl, setFeedUrl] = useState("");

  const handleInputChange = (event) => {
    setFeedUrl(event.target.value);
  };

  const handleSubmit = () => {
    console.log("RSS Feed URLS:", feedUrl);
  };

  return (
    <div className="App">
      <h1>RSS Feed Reader</h1>
      <textarea
        value={feedUrl}
        onChange={handleInputChange}
        placeholder="Syötä RSS lähteet tähän..."
        rows="4"
        cols="50"
        // style={{ resize: "none" }}
      />
      <button onClick={handleSubmit} className="hae">
        Hae
      </button>
    </div>
  );
}

export default App;

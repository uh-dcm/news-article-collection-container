import axios from "axios";
const baseUrl = "http://localhost:4000";

const getAllFeedUrls = async () => {
  const response = await axios.get(baseUrl + "/api/get_feed_urls");
  return response.data;
};

const sendAllFeedUrls = async (feedUrls) => {
  const response = await axios.post(baseUrl + "/api/set_feed_urls", {
    feedUrls,
  });
  return response.data;
};

export { getAllFeedUrls, sendAllFeedUrls };

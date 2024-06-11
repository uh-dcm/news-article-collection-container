import axios from 'axios';
import { serverUrl } from '../App';

const getAllFeedUrls = async () => {
  const response = await axios.get(`${serverUrl}/api/get_feed_urls`);
  return response.data;
};

const sendAllFeedUrls = async (feedUrls: string[]) => {
  const response = await axios.post(`${serverUrl}/api/set_feed_urls`, {
    feedUrls,
  });
  return response.status;
};

export { getAllFeedUrls, sendAllFeedUrls };

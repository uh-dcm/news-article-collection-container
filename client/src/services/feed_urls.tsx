import axios from 'axios';
import { backendUrl } from '../main';

const getAllFeedUrls = async () => {
  const response = await axios.get(`${backendUrl}/api/get_feed_urls`);
  return response.data;
};

const sendAllFeedUrls = async (feedUrls: string[]) => {
  const response = await axios.post(`${backendUrl}/api/set_feed_urls`, {
    feedUrls,
  });
  return response.status;
};

export { getAllFeedUrls, sendAllFeedUrls };

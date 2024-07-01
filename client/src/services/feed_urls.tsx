import axios from 'axios';
import { serverUrl } from '../App';

const getAllFeedUrls = async () => {
  const response = await axios.get(`${serverUrl}/api/get_feed_urls/all`);
  return response.data;
};

const sendAllFeedUrls = async (feedUrls: string[]) => {
  console.log(feedUrls);
  const response = await axios.post(`${serverUrl}/api/set_feed_urls/all`, {
    feedUrls,
  });
  return response;
};

const getSelectedFeedUrls = async () => {
  const response = await axios.get(`${serverUrl}/api/get_feed_urls`);
  return response.data;
};

const sendSelectedFeedUrls = async (feedUrls: string[]) => {
  const response = await axios.post(`${serverUrl}/api/set_feed_urls`, {
    feedUrls,
  });
  return response;
};

export {
  getAllFeedUrls,
  sendAllFeedUrls,
  getSelectedFeedUrls,
  sendSelectedFeedUrls,
};

import authClient from './authclient';

const getAllFeedUrls = async () => {
  const response = await authClient.get('/api/get_feed_urls');
  // const response = await axios.get(`${serverUrl}/api/get_feed_urls`);
  return response.data;
};

const sendAllFeedUrls = async (feedUrls: string[]) => {
  const response = await authClient.post(`/api/set_feed_urls`, {
    feedUrls,
  });
  return response;
};

export { getAllFeedUrls, sendAllFeedUrls };

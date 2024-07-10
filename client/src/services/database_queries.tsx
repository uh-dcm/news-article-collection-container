import authClient from './authclient';

const sendSearchQuery = async (searchQuery: string) => {
  const response = await authClient.get(`/api/articles/search`, {
    params: { searchQuery: searchQuery },
  });
  return response.data;
};

const sendStatisticsQuery = async () => {
  const response = await authClient.get(`/api/articles/statistics`);
  return response.data;
};

export { sendSearchQuery, sendStatisticsQuery };

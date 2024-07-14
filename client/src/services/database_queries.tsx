import authClient from './authclient';

export interface SearchParams {
  textQuery?: string;
  urlQuery?: string;
  startTime?: string;
  endTime?: string;
  htmlQuery?: string;
}

export const sendSearchQuery = async (params: SearchParams) => {
  try {
    const response = await authClient.get('/api/articles/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error in sendSearchQuery:', error);
    throw error;
  }
};

export const sendStatisticsQuery = async (filtered: boolean) => {
  try {
    const response = await authClient.get('/api/articles/statistics', {
      params: { filtered: filtered }
    });
    return response.data;
  } catch (error) {
    console.error('Error in sendStatisticsQuery:', error);
    throw error;
  }
};

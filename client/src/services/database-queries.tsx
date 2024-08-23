import authClient from './authclient';

export interface SearchParams {
  generalQuery?: string;
  textQuery?: string;
  urlQuery?: string;
  startTime?: string;
  endTime?: string;
  htmlQuery?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const sendSearchQuery = async (params: Partial<SearchParams>) => {
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

export const sendTextQuery = async (filtered: boolean) => {
  try {
    const response = await authClient.get('/api/articles/full_text', {
      params: { filtered: filtered }
    });
    return response.data;
  } catch (error) {
    console.error('Error in sendTextQuery:', error);
    throw error;
  }
};

export const sendDataSizeQuery = async () => {
  try {
    const response = await authClient.get('/api/data_size');
    return response.data;
  } catch (error) {
    console.error('Error in sendDataSizeQuery:', error);
    throw error;
  }
};

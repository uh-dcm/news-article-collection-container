import authClient from '@/services/authclient';

const getLogRecords = async (): Promise<string[]> => {
  try {
    const response = await authClient.get(`/api/error_log`);
    return response.data.log;
  } catch (error) {
    console.error('Failed to fetch log records:', error);
    return [];
  }
};

const clearLogRecords = async (): Promise<void> => {
  try {
    await authClient.post(`/api/clear_error_log`);
  } catch (error) {
    console.error('Failed to clear log records:', error);
    throw error;
  }
};

export { getLogRecords, clearLogRecords };

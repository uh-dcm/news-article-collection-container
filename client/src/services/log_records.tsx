import axios from 'axios';
import { serverUrl } from '../App';

const getLogRecords = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${serverUrl}/api/error_logs`);
    return response.data.logs;
  } catch (error) {
    console.error('Failed to fetch log records:', error);
    return [];
  }
};

const clearLogRecords = async (): Promise<void> => {
  try {
    await axios.post(`${serverUrl}/api/clear_error_logs`);
  } catch (error) {
    console.error('Failed to clear log records:', error);
    throw error;
  }
};

export { getLogRecords, clearLogRecords };
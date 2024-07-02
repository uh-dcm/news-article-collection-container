import axios from 'axios';
import { serverUrl } from '../App';

const getLogRecords = async () => {
  const response = await axios.get(`${serverUrl}/api/error_logs`);
  return response.data.logs;
};

export { getLogRecords };

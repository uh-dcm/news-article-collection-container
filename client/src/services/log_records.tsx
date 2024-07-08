import axios from 'axios';
import { serverUrl } from '../config';
import authClient from './authclient';

const getLogRecords = async () => {
  const response = await authClient.get(`${serverUrl}/api/error_logs`);
  return response.data.logs;
};

export { getLogRecords };

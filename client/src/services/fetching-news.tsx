import axios from 'axios';
import { serverUrl } from '../App';

const keepFetching = async () => {
  const response = await axios.post(`${serverUrl}/api/start`);
  return response.data;
};

const stopFetching = async () => {
  const response = await axios.post(`${serverUrl}/api/stop`);
  return response.data;
};

export { keepFetching, stopFetching };

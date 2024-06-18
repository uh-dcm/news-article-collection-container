import axios from 'axios';
import { serverUrl } from '../App';

const keepFetching = async () => {
  try {
    const response = await axios.post(`${serverUrl}/api/start`);
    return response.data;
  } catch (e) {
    return e;
  }
};

const stopFetching = async () => {
  try {
    const response = await axios.post(`${serverUrl}/api/stop`);
    return response.data;
  } catch (e) {
    return e;
  }
};

const getFetchingStatus = async () => {
  try {
    const response = await axios.get(`${serverUrl}/api/status`);
    return response.data;
  } catch (e) {
    return e;
  }
};

export { keepFetching, stopFetching, getFetchingStatus };

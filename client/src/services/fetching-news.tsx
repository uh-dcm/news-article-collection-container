import axios from 'axios';
import { serverUrl } from '../config';
import authClient from './authclient';

const keepFetching = async () => {
  try {
    const response = await authClient.post(`${serverUrl}/api/start`);
    return response.data;
  } catch (e) {
    return e;
  }
};

const stopFetching = async () => {
  try {
    const response = await authClient.post(`${serverUrl}/api/stop`);
    return response.data;
  } catch (e) {
    return e;
  }
};

const getFetchingStatus = async () => {
  try {
    const response = await authClient.get(`${serverUrl}/api/status`);
    return response.data;
  } catch (e) {
    return e;
  }
};

export { keepFetching, stopFetching, getFetchingStatus };

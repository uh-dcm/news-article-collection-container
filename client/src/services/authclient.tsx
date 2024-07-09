import axios from 'axios';
import { serverUrl } from '../config';

const authClient = axios.create({
  baseURL: `${serverUrl}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// request interceptor to add the auth token to every request
authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default authClient;

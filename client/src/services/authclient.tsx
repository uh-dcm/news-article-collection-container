import axios from 'axios';
import { serverUrl } from '../config';
import { toast } from 'sonner';

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

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      toast.error('Your session has expired. Please log in again.', {
        duration: 10000,
        position: 'top-center',
      });
    }
    return Promise.reject(error);
  }
);

export default authClient;

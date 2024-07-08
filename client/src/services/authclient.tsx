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
    // const token = localStorage.getItem('accessToken');
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTcyMDQ0ODU1NCwianRpIjoiNGE3OWRkNjItMDZlOC00MTFlLWJjNGItZWQ2MWQyNWZmN2IzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluIiwibmJmIjoxNzIwNDQ4NTU0LCJjc3JmIjoiMDY0NzM4NDAtZjRkOS00OTQ3LThmYjEtZGQ4ZDQ5MzVhY2NjIiwiZXhwIjoxNzIwNDQ5NDU0fQ.epNRkWJ7aK1Ih_ye2flb22DArlgVXzzZwPdj1096IVE';
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

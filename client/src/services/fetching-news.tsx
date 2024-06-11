import axios from 'axios';
const baseUrl = 'http://localhost:5000';

const keepFetching = async () => {
  const response = await axios.post(baseUrl + '/api/start');
  return response.data;
};

const stopFetching = async () => {
  const response = await axios.post(baseUrl + '/api/stop');
  return response.data;
};

export { keepFetching, stopFetching };

import authClient from './authclient';

const keepFetching = async () => {
  try {
    const response = await authClient.post(`/api/start`);
    return response.data;
  } catch (e) {
    return e;
  }
};

const stopFetching = async () => {
  try {
    const response = await authClient.post(`/api/stop`);
    return response.data;
  } catch (e) {
    return e;
  }
};

const getFetchingStatus = async () => {
  try {
    const response = await authClient.get(`/api/status`);
    return response.data;
  } catch (e) {
    return e;
  }
};

export { keepFetching, stopFetching, getFetchingStatus };

import authClient from './authclient';

const getLogRecords = async () => {
  const response = await authClient.get(`/api/error_logs`);
  return response.data.logs;
};

export { getLogRecords };

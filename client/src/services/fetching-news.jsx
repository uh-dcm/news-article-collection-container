import axios from "axios";
const baseUrl = "http://localhost:4000";

const keepFetching = async () => {
  const response = await axios.post(baseUrl + "/api/start");
  return response.data;
};

const stopFetching = async (feedUrls) => {
  const response = await axios.post(baseUrl + "/api/stop");
  return response.data;
};

export { keepFetching, stopFetching };

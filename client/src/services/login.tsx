import axios from 'axios';
import { serverUrl } from '../config';

const login = async (password: string) => {
  try {
    const response = await axios.post(`${serverUrl}/api/login`, {
      password: password,
    });
    return response.data;
  } catch (e) {
    return e;
  }
};

export { login };

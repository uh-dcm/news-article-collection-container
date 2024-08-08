import axios from 'axios';
import { serverUrl } from '@/config';
import authClient from '@/services/authclient';

const checkUserExists = async () => {
  try {
    const response = await axios.get(`${serverUrl}/api/get_user_exists`);
    return response.data;
  } catch (error) {
    console.log('Error in checkUserExists: ', error);
    return false;
  }
};

const registerUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${serverUrl}/api/register`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.log('Error in createUser: ', error);
    return false;
  }
};

const getIsValidToken = async () => {
  try {
    // uses the token in localStorage to check if it is valid
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    const response = await authClient.get('/api/get_is_valid_token');
    return response.data.valid;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

const loginUser = async (password: string) => {
  try {
    const response = await axios.post(`${serverUrl}/api/login`, {
      password,
    });
    return response.data;
  } catch (error) {
    console.log('Error in loginUser: ', error);
    return false;
  }
};

const sendResetPasswordLink = async () => {
  try {
    let modified_webpage = window.location.href;
    // remove /login from end of webpage
    if (modified_webpage.endsWith('/login')) {
      modified_webpage = modified_webpage.slice(0, -6);
    }
    const response = await axios.post(
      `${serverUrl}/api/send_reset_password_link`,
      {
        webpage: modified_webpage + '/reset-password',
      }
    );
    return response.data;
  } catch (error) {
    console.log('Error in sendResetPasswordEmail: ', error);
    return false;
  }
};

const resetUserPassword = async (password: string, reset_token: string) => {
  try {
    const response = await axios.post(`${serverUrl}/api/reset_password`, {
      password,
      reset_token,
    });
    return response.data;
  } catch (error) {
    console.log('Error in resetUserPassword: ', error);
    return false;
  }
};

export {
  checkUserExists,
  registerUser,
  getIsValidToken,
  loginUser,
  sendResetPasswordLink,
  resetUserPassword,
};

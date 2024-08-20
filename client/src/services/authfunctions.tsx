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

const registerUser = async (email: string, password: string, isReregistering: boolean = false) => {
  try {
    const response = await axios.post(`${serverUrl}/api/register`, {
      email,
      password,
      isReregistering
    });
    return {
      success: true,
      data: response.data,
      emailSent: response.data.email_sent
    };
  } catch (error) {
    console.error('Error in registerUser: ', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
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

const requestReregister = async () => {
  try {
    const response = await axios.post(`${serverUrl}/api/request_reregister`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in requestReregister: ', error);
    throw error;
  }
};

const validateReregisterToken = async (token: string) => {
  try {
    const response = await axios.get(`${serverUrl}/api/validate_reregister_token/${token}`);
    return response.data;
  } catch (error) {
    console.log('Error in validateReregisterToken: ', error);
    throw error;
  }
};

export {
  checkUserExists,
  registerUser,
  getIsValidToken,
  loginUser,
  requestReregister,
  validateReregisterToken
};

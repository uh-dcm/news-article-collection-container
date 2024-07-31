import axios from 'axios';
import { serverUrl } from '../config';

export const sendMailNotification = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${serverUrl}/api/mail_dispatcher`, {
      email,
      password,
    });
    return response;
  } catch (error) {
    console.error('Error in sendMailNotification:', error);
    throw error;
  }
};

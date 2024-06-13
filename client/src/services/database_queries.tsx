import axios from 'axios';
import { serverUrl } from '../App';

const sendSearchQuery = async (searchQuery: string) => {
    const response = await axios.get(`${serverUrl}/api/articles/search`, {
        params: { searchQuery: searchQuery } 
    });
    return response.data
};

export { sendSearchQuery };

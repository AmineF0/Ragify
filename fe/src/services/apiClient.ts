import axios from 'axios';
import { API_URL } from '../config/constants';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      return Promise.reject('No response from server. Please check your connection.');
    }
    return Promise.reject('Failed to make request. Please try again.');
  }
);
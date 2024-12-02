import axios from 'axios';
import { Profile, CreateProfileData, Model } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 seconds
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      return Promise.reject(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      // Request made but no response
      return Promise.reject('No response from server. Please check your connection.');
    } else {
      // Request setup error
      return Promise.reject('Failed to make request. Please try again.');
    }
  }
);

export const api = {
  async getModels(): Promise<Model[]> {
    try {
      const response = await apiClient.get('/models');
      return response.data.models.map((name: string) => ({
        name,
        label: formatModelName(name)
      }));
    } catch (error) {
      console.error('Error fetching models:', error);
      throw typeof error === 'string' ? error : 'Failed to load models';
    }
  },

  async createProfile(data: CreateProfileData, files?: FileList) {
    try {
      const formData = new FormData();
      
      // Add profile data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add files if present
      if (files) {
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
      }

      const response = await apiClient.post('/profiles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw typeof error === 'string' ? error : 'Failed to create profile';
    }
  },

  async getAllProfiles(): Promise<Profile[]> {
    try {
      const response = await apiClient.get('/profiles');
      return response.data.profiles;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      throw typeof error === 'string' ? error : 'Failed to load profiles';
    }
  },

  async uploadFiles(profileName: string, files: FileList) {
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await apiClient.post(
        `/profiles/${profileName}/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw typeof error === 'string' ? error : 'Failed to upload files';
    }
  },

  async query(profileName: string, query: string) {
    try {
      const formData = new FormData();
      formData.append('query', query);

      const response = await apiClient.post(`/profiles/${profileName}/query`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('response', response);
      return { response: response.data };
    } catch (error) {
      console.error('Error querying profile:', error);
      throw typeof error === 'string' ? error : 'Failed to process query';
    }
  },
};

function formatModelName(name: string): string {
  const cleanName = name.replace(/:latest$/, '');
  
  switch (cleanName) {
    case 'aya-expanse':
      return 'Aya Expanse';
    case 'mistral':
      return 'Mistral';
    case '0ssamaak0/silma-v1':
      return 'Silma (Arabic)';
    case 'gemma':
      return 'Gemma';
    case 'llama3.2':
      return 'LLaMA 3.2';
    case 'llama3.1':
      return 'LLaMA 3.1';
    default:
      return cleanName.split('/').pop() || cleanName;
  }
}
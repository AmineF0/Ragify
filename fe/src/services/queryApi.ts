import { apiClient } from './apiClient';

export const queryApi = {
  async query(profileName: string, query: string) {
    try {
      const response = await apiClient.post(`/profiles/${profileName}/query`, {
        query,
      });
      return response.data;
    } catch (error) {
      console.error('Error querying profile:', error);
      throw typeof error === 'string' ? error : 'Failed to process query';
    }
  }
};
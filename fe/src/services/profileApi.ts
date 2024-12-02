import { apiClient } from './apiClient';
import { Profile, CreateProfileData } from '../types';

export const profileApi = {
  async getAllProfiles(): Promise<Profile[]> {
    try {
      const response = await apiClient.get('/profiles');
      return response.data.profiles;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      throw typeof error === 'string' ? error : 'Failed to load profiles';
    }
  },

  async createProfile(data: CreateProfileData, files?: FileList) {
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

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

  async getActiveProfile(): Promise<Profile | null> {
    try {
      const response = await apiClient.get('/profiles/active');
      return response.data.running_profile;
    } catch (error) {
      console.error('Error fetching active profile:', error);
      return null;
    }
  },

  async setActiveProfile(profileName: string): Promise<void> {
    try {
      await apiClient.post('/profiles/select', { name: profileName });
    } catch (error) {
      console.error('Error setting active profile:', error);
      throw typeof error === 'string' ? error : 'Failed to set active profile';
    }
  },

  async changeProfileState(profileName: string, state: 'active' | 'inactive'): Promise<void> {
    try {
      await apiClient.post(`/profiles/${profileName}/state`, { state });
    } catch (error) {
      console.error('Error changing profile state:', error);
      throw typeof error === 'string' ? error : 'Failed to change profile state';
    }
  }
};
import { apiClient } from './apiClient';
import { Model } from '../types';

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

export const modelApi = {
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
  }
};
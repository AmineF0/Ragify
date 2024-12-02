import { useState, useEffect } from 'react';
import { Model } from '../types';
import { api } from '../services/api';

export const useModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const availableModels = await api.getModels();
        setModels(availableModels);
      } catch (error) {
        setError(typeof error === 'string' ? error : 'Failed to load models');
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  return { models, isLoading, error };
};
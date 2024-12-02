export const API_URL = import.meta.env.VITE_API_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME;
export const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION;

export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' }
] as const;

export const SUPPORTED_MODELS = [
  { name: 'llama3.1', label: 'LLaMA 3.1' },
  { name: 'llama3.2', label: 'LLaMA 3.2' },
  { name: 'gemma2', label: 'Gemma 2' },
  { name: 'mistral', label: 'Mistral' },
  { name: 'silma-v1', label: 'Silma (Arabic)' }
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FILE_TYPES = '.pdf,.txt';
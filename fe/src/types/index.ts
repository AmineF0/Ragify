export interface Message {
  text: string;
  isBot: boolean;
}

export interface Profile {
  name: string;
  model: string;
  prompt: string;
  description: string;
  language: Language;
  text_content?: string;
  train: boolean;
  use_only_context: boolean;
  state: 'active' | 'inactive';
}

export interface Model {
  name: string;
  label: string;
}

export type Language = 'ar' | 'fr' | 'en';

export interface CreateProfileData {
  name: string;
  model: string;
  prompt: string;
  description: string;
  language: Language;
  text_content?: string;
  train: boolean;
  use_only_context: boolean;
}
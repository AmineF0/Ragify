import React from 'react';
import { Language } from '../../../types';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' }
];

interface LanguageSelectProps {
  value: Language;
  onChange: (value: Language) => void;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Language</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.value} value={lang.value}>{lang.label}</option>
        ))}
      </select>
    </div>
  );
};
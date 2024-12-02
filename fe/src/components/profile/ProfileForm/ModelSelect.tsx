import React from 'react';
import { Model } from '../../../types';
import { useModels } from '../../../hooks/useModels';
import { Spinner } from '../../ui/Spinner';

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const ModelSelect: React.FC<ModelSelectProps> = ({ value, onChange }) => {
  const { models, isLoading, error } = useModels();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Spinner size={20} />
        <span className="text-sm text-gray-600">Loading models...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 text-sm">
        Failed to load models. Please try again later.
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Model</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        {models.map((model) => (
          <option key={model.name} value={model.name}>
            {model.label}
          </option>
        ))}
      </select>
    </div>
  );
};
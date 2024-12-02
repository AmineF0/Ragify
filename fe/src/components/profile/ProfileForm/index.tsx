import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreateProfileData } from '../../../types';
import { ModelSelect } from './ModelSelect';
import { LanguageSelect } from './LanguageSelect';
import { ContentInput } from './ContentInput';
import { useModels } from '../../../hooks/useModels';

interface ProfileFormProps {
  onSubmit: (data: CreateProfileData, files?: FileList) => Promise<void>;
  onCancel: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, onCancel }) => {
  const { models } = useModels();
  const [formData, setFormData] = useState<CreateProfileData>({
    name: '',
    model: '',
    prompt: '',
    description: '',
    language: 'en',
    text_content: '',
    train: true,
    use_only_context: false,
  });
  const [files, setFiles] = useState<FileList | null>(null);

  // Update model when models are loaded
  React.useEffect(() => {
    if (models.length > 0 && !formData.model) {
      setFormData(prev => ({ ...prev, model: models[0].name }));
    }
  }, [models, formData.model]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, files || undefined);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-sm"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <LanguageSelect
          value={formData.language}
          onChange={(language) => setFormData(prev => ({ ...prev, language }))}
        />
      </div>

      <ModelSelect
        value={formData.model}
        onChange={(model) => setFormData(prev => ({ ...prev, model }))}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">System Prompt</label>
        <textarea
          value={formData.prompt}
          onChange={e => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <ContentInput
        onTextChange={(text) => setFormData(prev => ({ ...prev, text_content: text }))}
        onFileChange={(files) => setFiles(files)}
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Profile
        </button>
      </div>
    </motion.form>
  );
};
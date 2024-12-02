import React from 'react';
import { Model, Language, CreateProfileData } from '../../types';

interface ProfileFormProps {
  models: Model[];
  initialData: {
    name: string;
    model: string;
    prompt: string;
    description: string;
    language: Language;
    text_content: string;
    train: boolean;
    use_only_context: boolean;
    files: FileList | null;
  };
  onSubmit: (data: CreateProfileData, files?: FileList) => Promise<void>;
  onCancel: () => void;
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' }
];

export const ProfileForm: React.FC<ProfileFormProps> = ({
  models,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = React.useState(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(
      {
        name: formData.name,
        model: formData.model,
        prompt: formData.prompt,
        description: formData.description,
        language: formData.language,
        text_content: formData.text_content,
        train: formData.train,
        use_only_context: formData.use_only_context,
      },
      formData.files || undefined
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, files: e.target.files! }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
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
        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <select
            value={formData.language}
            onChange={e => setFormData(prev => ({ ...prev, language: e.target.value as Language }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Model</label>
        <select
          value={formData.model}
          onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {models.map(model => (
            <option key={model.name} value={model.name}>{model.name}</option>
          ))}
        </select>
      </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700">Context Text (Optional)</label>
        <textarea
          value={formData.text_content}
          onChange={e => setFormData(prev => ({ ...prev, text_content: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Upload Files (Optional)</label>
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
          className="mt-1 block w-full"
          multiple
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.train}
            onChange={e => setFormData(prev => ({ ...prev, train: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Train on context</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.use_only_context}
            onChange={e => setFormData(prev => ({ ...prev, use_only_context: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Use only context</span>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Profile
        </button>
      </div>
    </form>
  );
};
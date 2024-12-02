import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface ContentInputProps {
  onTextChange: (text: string) => void;
  onFileChange: (files: FileList) => void;
}

export const ContentInput: React.FC<ContentInputProps> = ({ onTextChange, onFileChange }) => {
  const [inputType, setInputType] = useState<'text' | 'file'>('text');

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setInputType('text')}
          className={`px-3 py-1 rounded-lg ${
            inputType === 'text' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Text Input
        </button>
        <button
          type="button"
          onClick={() => setInputType('file')}
          className={`px-3 py-1 rounded-lg ${
            inputType === 'file' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          File Upload
        </button>
      </div>

      {inputType === 'text' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">Context Text</label>
          <textarea
            onChange={(e) => onTextChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            placeholder="Enter your context text here..."
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Files</label>
          <div className="mt-1">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload size={20} className="text-gray-500" />
              <span className="text-gray-600">Choose PDF or TXT files</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onFileChange(e.target.files);
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { Upload, Check } from 'lucide-react';
import { Profile, Language } from '../../types';
import { motion } from 'framer-motion';

interface ProfileCardProps {
  profile: Profile;
  isActive: boolean;
  onFileUpload: (files: FileList) => void;
  onSelect: () => void;
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' }
];

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isActive,
  onFileUpload,
  onSelect,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{profile.name}</h3>
            {isActive && (
              <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                <Check size={12} />
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {profile.model}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {LANGUAGES.find(l => l.value === profile.language)?.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label 
            className="relative cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onFileUpload(e.target.files);
                }
              }}
            />
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Upload size={16} />
              <span className="text-sm">Add Files</span>
            </div>
          </label>
        </div>
      </div>
    </motion.div>
  );
};
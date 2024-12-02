import React from 'react';
import { BookOpen, Settings } from 'lucide-react';
import { Profile } from '../types';

interface HeaderProps {
  activeProfile: Profile | null;
  onShowProfiles: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeProfile, onShowProfiles }) => {
  const getLanguageLabel = (code: string) => {
    switch (code) {
      case 'ar': return 'Arabic';
      case 'fr': return 'French';
      case 'en': return 'English';
      default: return code;
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Your Smart Assistant</h1>
            <p className="text-sm text-gray-500">
              {activeProfile 
                ? `${getLanguageLabel(activeProfile.language)} - ${activeProfile.name}`
                : 'No profile selected'}
            </p>
          </div>
        </div>
        <button
          onClick={onShowProfiles}
          className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          title="Manage Profiles"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};
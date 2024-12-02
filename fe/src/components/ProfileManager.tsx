import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Profile, CreateProfileData } from '../types';
import { ProfileForm } from './forms/ProfileForm';
import { ProfileCard } from './profile/ProfileCard';
import { useModels } from '../hooks/useModels';
import { api } from '../services/api';

interface ProfileManagerProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  onProfilesChange: () => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ 
  profiles, 
  activeProfile, 
  onProfilesChange 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const { models, isLoading, error } = useModels();

  const handleSubmit = async (data: CreateProfileData, files?: FileList) => {
    try {
      await api.createProfile(data, files);
      setIsCreating(false);
      onProfilesChange();
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };

  const handleUploadFiles = async (profileName: string, files: FileList) => {
    try {
      await api.uploadFiles(profileName, files);
      onProfilesChange();
    } catch (error) {
      console.error('Failed to upload files:', error);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-gray-600">Loading available models...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading models. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Smart Assistant Profiles</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          New Profile
        </button>
      </div>

      {isCreating && (
        <ProfileForm
          models={models}
          initialData={{
            name: '',
            model: models[0]?.name || '',
            prompt: '',
            description: '',
            language: 'en',
            text_content: '',
            train: true,
            use_only_context: false,
            files: null
          }}
          onSubmit={handleSubmit}
          onCancel={() => setIsCreating(false)}
        />
      )}

      <div className="space-y-2">
        {profiles.map(profile => (
          <ProfileCard
            key={profile.name}
            profile={profile}
            isActive={activeProfile?.name === profile.name}
            onFileUpload={(files) => handleUploadFiles(profile.name, files)}
          />
        ))}
      </div>
    </div>
  );
};
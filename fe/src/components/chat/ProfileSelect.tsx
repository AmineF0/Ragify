import React from 'react';
import { Profile } from '../../types';
import { motion } from 'framer-motion';

interface ProfileSelectProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  onProfileSelect: (profile: Profile) => void;
}

export const ProfileSelect: React.FC<ProfileSelectProps> = ({
  profiles = [],
  activeProfile,
  onProfileSelect,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border-b border-gray-100"
    >
      <select
        value={activeProfile?.name || ''}
        onChange={(e) => {
          const profile = profiles.find(p => p.name === e.target.value);
          if (profile) onProfileSelect(profile);
        }}
        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>Select a profile</option>
        {Array.isArray(profiles) && profiles.map((profile) => (
          <option key={profile.name} value={profile.name}>
            {profile.name} ({profile.language.toUpperCase()})
          </option>
        ))}
      </select>
    </motion.div>
  );
};
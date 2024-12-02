import React from 'react';
import { Send } from 'lucide-react';
import { Profile } from '../../types';
import { LoadingDots } from '../ui/LoadingDots';
import { motion } from 'framer-motion';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  activeProfile: Profile | null;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  activeProfile,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && !isLoading && onSubmit()}
        placeholder={activeProfile 
          ? `Ask anything in ${activeProfile.language === 'ar' ? 'Arabic' : activeProfile.language === 'fr' ? 'French' : 'English'}...`
          : "Select a profile to start chatting..."}
        className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        disabled={!activeProfile || isLoading}
        dir={activeProfile?.language === 'ar' ? 'rtl' : 'ltr'}
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim() || isLoading || !activeProfile}
        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <LoadingDots /> : <Send size={20} />}
      </button>
    </motion.div>
  );
};
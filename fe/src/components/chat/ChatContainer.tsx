import React from 'react';
import { Message, Profile } from '../../types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ProfileSelect } from './ProfileSelect';
import { Sparkles } from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (text: string) => void;
  isLoading: boolean;
  activeProfile: Profile | null;
  profiles: Profile[];
  onProfileSelect: (profile: Profile) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  activeProfile,
  profiles,
  onProfileSelect,
  messagesEndRef,
}) => {
  return (
    <>
      <ProfileSelect
        profiles={profiles}
        activeProfile={activeProfile}
        onProfileSelect={onProfileSelect}
      />
      <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message.text} isBot={message.isBot} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-100 p-4 bg-white">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={() => handleSubmit(input)}
          isLoading={isLoading}
          activeProfile={activeProfile}
        />
      </div>
    </>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { ChatContainer } from './components/chat/ChatContainer';
import { ProfileManager } from './components/ProfileManager';
import { Header } from './components/Header';
import { Message, Profile } from './types';
import { api } from './services/api';
import { Spinner } from './components/ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const profilesData = await api.getAllProfiles();
        setProfiles(profilesData || []);
        setError(null);
        
        // Set initial message based on available profiles
        const initialMessage = profilesData && profilesData.length > 0
          ? "Hello! I'm your Smart Assistant. Please select a profile to get started."
          : "Welcome! Please create a new profile to begin.";
        
        setMessages([{ text: initialMessage, isBot: true }]);
      } catch (error) {
        if (typeof error === 'string') {
          setError(error);
        } else {
          setError('Failed to initialize the assistant');
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || !activeProfile) return;
    
    const userMessage = { text, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.query(activeProfile.name, text);
      console.log(response);
      console.log('response', response.response.response.answer);
      const botMessage = { text: response.response.response.answer, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        text: typeof error === 'string' ? error : "I apologize, but I'm having trouble connecting to the server. Please try again later.", 
        isBot: true 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    setActiveProfile(profile);
    setMessages(prev => [
      ...prev,
      {
        text: `Profile switched to ${profile.name}. How can I assist you today?`,
        isBot: true
      }
    ]);
    setShowProfiles(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Spinner size={40} />
          <p className="mt-4 text-gray-600">Initializing Your Smart Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <Header 
            activeProfile={activeProfile}
            onShowProfiles={() => setShowProfiles(true)}
          />

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-red-50 border-l-4 border-red-500"
            >
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {showProfiles ? (
              <motion.div
                key="profiles"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4"
              >
                <ProfileManager
                  profiles={profiles}
                  activeProfile={activeProfile}
                  onProfileSelect={handleProfileSelect}
                  onProfilesChange={async () => {
                    const profilesData = await api.getAllProfiles();
                    setProfiles(profilesData || []);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ChatContainer
                  messages={messages}
                  input={input}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
                  activeProfile={activeProfile}
                  profiles={profiles}
                  onProfileSelect={handleProfileSelect}
                  messagesEndRef={messagesEndRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
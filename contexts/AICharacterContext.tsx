import React, { createContext, useState, useEffect } from 'react';
import { AICharacterContextType, UserType } from '@/lib/types/AICharacterTypes';

export const AICharacterContext = createContext<AICharacterContextType | undefined>(undefined);

export const AICharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to control character visibility
  const [isCharacterOpen, setIsCharacterOpen] = useState(false);
  
  // State to track if user has already interacted with the character
  const [hasInteractedBefore, setHasInteractedBefore] = useState(false);
  
  // State to store the user type selected during onboarding
  const [userType, setUserType] = useState<UserType>('');
  
  // State to track if user is in chat mode with the AI character
  const [isChatting, setIsChatting] = useState(false);
  
  // Mock username - in a real app this would come from authentication
  const [username, setUsername] = useState('User');
  
  // Check local storage on initial load to see if user has interacted before
  useEffect(() => {
    const hasInteracted = localStorage.getItem('ai_character_interacted');
    if (hasInteracted === 'true') {
      setHasInteractedBefore(true);
      
      // Load saved user type if available
      const savedUserType = localStorage.getItem('ai_character_user_type');
      if (savedUserType) {
        setUserType(savedUserType as UserType);
      }
    } else {
      // Auto-show the character after a delay if user hasn't interacted before
      const timer = setTimeout(() => {
        if (!hasInteractedBefore) {
          setIsCharacterOpen(true);
        }
      }, 5000); // 5 second delay
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Save interaction state to localStorage
  useEffect(() => {
    if (hasInteractedBefore) {
      localStorage.setItem('ai_character_interacted', 'true');
    }
  }, [hasInteractedBefore]);
  
  // Save user type to localStorage when it changes
  useEffect(() => {
    if (userType) {
      localStorage.setItem('ai_character_user_type', userType);
    }
  }, [userType]);
  
  const openCharacter = () => {
    setIsCharacterOpen(true);
  };
  
  const closeCharacter = () => {
    setIsCharacterOpen(false);
  };
  
  const startChatting = () => {
    setIsChatting(true);
    setIsCharacterOpen(false); // Close the intro dialog
  };
  
  return (
    <AICharacterContext.Provider
      value={{
        isCharacterOpen,
        hasInteractedBefore,
        username,
        userType,
        isChatting,
        openCharacter,
        closeCharacter,
        setHasInteractedBefore,
        setUserType,
        startChatting,
      }}
    >
      {children}
    </AICharacterContext.Provider>
  );
};

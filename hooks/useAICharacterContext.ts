import { useContext } from 'react';
import { AICharacterContext } from '@/contexts/AICharacterContext';

export const useAICharacter = () => {
  const context = useContext(AICharacterContext);
  
  if (context === undefined) {
    throw new Error('useAICharacter must be used within an AICharacterProvider');
  }
  
  return context;
};

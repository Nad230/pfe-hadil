import React from 'react';
import { Sparkles, HandMetal, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAICharacter } from '@/hooks/useAICharacterContext';

const AICharacterButton: React.FC = () => {
  const { openCharacter, isCharacterOpen, hasInteractedBefore } = useAICharacter();

  // New users who haven't interacted see the "Free me!" button
  if (!hasInteractedBefore) {
    return (
      <Button
        onClick={openCharacter}
        className="fixed bottom-20 right-6 shadow-lg rounded-full w-16 h-16 p-0 bg-insight hover:bg-insight/90 group z-50 animate-bounce overflow-hidden"
        aria-label="Free the AI Character"
      >
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand rounded-full animate-pulse-soft"></div>
        
        <div className="relative flex items-center justify-center h-full w-full">
          <HandMetal className="w-6 h-6 text-white group-hover:scale-110 transition-all absolute" />
          <Sparkles className="w-6 h-6 text-white absolute opacity-0 group-hover:opacity-100 transition-all animate-pulse" />
        </div>
        
        <span className="absolute bottom-0 left-0 right-0 text-[10px] text-white font-medium bg-black/30 py-1">
          Free me!
        </span>
      </Button>
    );
  }
  
  // Users who already interacted see the chat button
  // This button is always visible in the corner
  if (!isCharacterOpen) {
    return (
      <Button
        onClick={openCharacter}
        className="fixed bottom-20 right-6 shadow-lg rounded-full w-14 h-14 p-0 bg-brand hover:bg-brand-dark z-50"
        aria-label="Chat with AI Character"
      >
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-insight rounded-full animate-pulse-soft"></div>
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>
    );
  }
  
  return null;
};

export default AICharacterButton;
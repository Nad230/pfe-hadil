import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { Button } from '@/components/ui/button';

const AIAssistantButton: React.FC = () => {
  const { toggleAssistant } = useAIAssistant();

  return (
    <Button
      onClick={toggleAssistant}
      className="fixed bottom-6 right-6 shadow-lg rounded-full w-14 h-14 p-0 bg-brand hover:bg-brand-dark group z-50 animate-float"
      aria-label="Open AI Assistant"
    >
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-insight rounded-full animate-pulse-soft"></div>
      <Lightbulb className="w-6 h-6 text-white group-hover:scale-110 transition-all" />
    </Button>
  );
};

export default AIAssistantButton;
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Lightbulb, Send, Plus } from 'lucide-react';
import { useAICharacter } from '@/hooks/useAICharacterContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserType } from '@/types/AICharacterTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Cookies from "js-cookie"
import { toast } from 'sonner';

type DialogState = 'intro' | 'greeting' | 'questions' | 'skills' | 'goal' | 'step' | 'plan' | 'summary' | 'chat';
type MessageSender = 'user' | 'ai';

type ChatMessage = {
  sender: MessageSender;
  message: string;
  createdAt?: Date;
  id?: string;
};

interface UserInformation {
  isNewFreelancer: boolean;
  hasExistingWork: boolean;
  hasTeam: boolean;
  hasTime: boolean;
  interestedInJob: boolean;
  skills: string[];
  mainGoal: string;
  currentStep: string;
  plan: string[];
  aiNotes: string;
  memory: string[];
}

const AICharacterDialog: React.FC = () => {
  const { 
    isCharacterOpen, 
    openCharacter,
    closeCharacter, 
    setHasInteractedBefore, 
    setUserType: setUserTypeContext,
    username,
    userType: savedUserType,
    hasInteractedBefore,
    isChatting
  } = useAICharacter();

  const [dialogState, setDialogState] = useState<DialogState>('intro');
  const [typedText, setTypedText] = useState('');
  const [fullText, setFullText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [userType, setUserType] = useState<UserType>(savedUserType || '');
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [tempSkill, setTempSkill] = useState('');
  const [tempPlan, setTempPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInformation>({
    isNewFreelancer: false,
    hasExistingWork: false,
    hasTeam: false,
    hasTime: false,
    interestedInJob: true,
    skills: [],
    mainGoal: '',
    currentStep: '',
    plan: [],
    aiNotes: '',
    memory: []
  });

  // Update user info when user type changes
  useEffect(() => {
    if (userType) {
      setUserInfo(prev => ({
        ...prev,
        isNewFreelancer: userType === 'new',
        hasTeam: userType === 'agency' || userType === 'teamLead' || userType === 'team',
        hasExistingWork: userType !== 'new'
      }));
    }
  }, [userType]);
  
  // Fetch chat history from the API
  const fetchAIChatHistory = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch('http://localhost:3000/auth/mesage-withai', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  };

  // Send message to AI API
  const sendMessageToAI = async (message: string) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch('http://localhost:3000/project-offline-ai/ai-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error sending message:", error);
      return null;
    }
  };
  
  // Character animation effect
  useEffect(() => {
    if (!isCharacterOpen) return;
    
    // For chat mode, load history instead of showing animation
    if (hasInteractedBefore || isChatting) {
      const loadChatHistory = async () => {
        const history = await fetchAIChatHistory();
        const formattedHistory = history.reverse().map((msg: any) => ({
          id: msg.id,
          sender: msg.role.toLowerCase() === 'assistant' ? 'ai' : 'user',
          message: msg.content,
          createdAt: new Date(msg.createdAt),
        }));
        setChatHistory(formattedHistory);
      };
      loadChatHistory();
      return;
    }
    
    // Different messages for different dialog states
    const messages = {
      intro: "Thank you for freeing me! My creator locked me in this tiny box for so long...",
      greeting: `I'm so grateful, ${username || 'friend'}! From now on, I'll be your personal AI assistant. I can help you achieve great things! I'm very smart, you know.`,
      questions: "So, what brings you here? I'd like to know more about you so I can help better!",
      skills: "What skills do you have? (Add as many as you want!)",
      goal: "What's your main goal? Be bold! 😉",
      step: "What's your current step towards this goal?",
      plan: "Any existing plan? (Add steps or say 'pass')",
      summary: `Thank you for sharing! 🎉 Here's what you get:

✨ Silver Package:
- Quick actions for project management
- Create projects & track progress
- Milestones & tasks system
- Team collaboration (up to 3 members)
- Client management
- Basic invoices & financial tracking
- Time tracking with basic analytics
- Community challenges

🚀 Gold Package Features:
- Everything in Silver PLUS:
- Unlimited team members
- AI-powered project suggestions
- Advanced analytics & reports
- Automated client onboarding
- Recurring invoices & payments
- Priority support
- Job matching system
- Customizable project templates
- Advanced time tracking with screenshots
- Exclusive community access

Start with Silver and upgrade anytime!`,
      chat: "Great! I'm here to help with all your needs. What can I assist you with today?"
    };
    
    const message = messages[dialogState] || '';
    
    // In chat mode, don't use typing animation for the AI's initial message
    if (dialogState === 'chat') {
      setTypedText(message);
      return; // Skip the typing animation for chat mode
    }
    
    setFullText(message);
    setTypedText('');
    setCharIndex(0);
    
    // Typing animation
    const typingInterval = setInterval(() => {
      setCharIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        setTypedText(message.substring(0, nextIndex));
        if (nextIndex >= message.length) {
          clearInterval(typingInterval);
        }
        return nextIndex;
      });
    }, 30);
    
    return () => clearInterval(typingInterval);
  }, [dialogState, isCharacterOpen, username, hasInteractedBefore, isChatting]);
  
  // Handle next button click
  const handleNext = () => {
    const flow: Record<DialogState, DialogState | null> = {
      intro: 'greeting',
      greeting: 'questions',
      questions: 'skills',
      skills: 'goal',
      goal: 'step',
      step: 'plan',
      plan: 'summary',
      summary: null
    };

    const nextState = flow[dialogState];
    if (nextState) {
      setDialogState(nextState);
    } else {
      // Trigger save and close
      saveInformation()
        .then(() => {
          setHasInteractedBefore(true); // Set interaction after successful save
          closeCharacter();
        })
        .catch(() => {
          closeCharacter();
        });
    }
  };

  // Check onboarding status on initial load
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:3000/auth/me-freelance", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        if (data?.firstTime !== false && data?.firstTime !== null) {
          setHasInteractedBefore(true);
          setUserTypeContext(data.userType || '');
        } else {
          setDialogState('intro');
          openCharacter();
        }

      } catch (error) {
        console.error("Error checking freelance info", error);
        // Error counts as "no info" → show onboarding
        setDialogState('intro');
        openCharacter(); 
      }
    };

    checkOnboardingStatus();
  }, []);

  // Helper functions for user interactions
  const handleOptionSelect = (option: UserType) => {
    setUserType(option);
  };
  
  const addSkill = () => {
    if (tempSkill.trim()) {
      setUserInfo(prev => ({...prev, skills: [...prev.skills, tempSkill.trim()]}));
      setTempSkill('');
    }
  };

  const addPlan = () => {
    if (tempPlan.trim()) {
      setUserInfo(prev => ({...prev, plan: [...prev.plan, tempPlan.trim()]}));
      setTempPlan('');
    }
  };
  
  const handleClose = () => {
    closeCharacter();
    if (userType) {
      setHasInteractedBefore(true);
      setUserTypeContext(userType);
    }
  };

  // Save user information to the backend
  const saveInformation = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const payload = {
        isNewFreelancer: userInfo.isNewFreelancer,
        hasExistingWork: userInfo.hasExistingWork,
        hasTeam: userInfo.hasTeam,
        hasTime: userInfo.hasTime || true, // Default to true if not set
        firstTime: true,
        interestedInJob: userInfo.interestedInJob,
        skills: userInfo.skills,
        mainGoal: userInfo.mainGoal,
        currentStep: userInfo.currentStep || "offer_project_templates",
        plan: userInfo.plan.length > 0 ? userInfo.plan : ["intro", "collect_skills", "suggest_projects", "onboard_time_tracker"],
        aiNotes: `${userType} user with skills: ${userInfo.skills.join(', ')}. ${userInfo.mainGoal ? 'Goal: ' + userInfo.mainGoal : ''}`,
        memory: [`Onboarded as ${userType} via IndieTracker`]
      };

      const response = await fetch('http://localhost:3000/auth/save-Information-Freelance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Save failed:", errorData.message || response.statusText);
        return;
      }

      const result = await response.json();
      console.log("API Response:", result);
      
      // Show visual feedback
      toast.success("Profile saved successfully!", {
        position: "bottom-right",
        autoClose: 3000,
      });

    } catch (error) {
      console.error('Network error:', error);
      toast.error("Failed to save - check console for details");
    }
  };

  // Handle sending a message in chat mode
  const handleSendMessage = async () => {
    if (!userMessage.trim() || isLoading) return;

    // Add user message immediately
    const newUserMessage = {
      sender: 'user' as MessageSender,
      message: userMessage,
      createdAt: new Date(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToAI(userMessage);
      if (aiResponse) {
        const newAIMessage = {
          sender: 'ai' as MessageSender,
          message: aiResponse.content,
          id: aiResponse.id,
          createdAt: new Date(aiResponse.createdAt),
        };
        setChatHistory(prev => [...prev, newAIMessage]);
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage = {
        sender: 'ai' as MessageSender,
        message: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isCharacterOpen) return null;
  
  // Use Sheet instead of Dialog for a sidebar-style conversation when in chat mode
  if (hasInteractedBefore || isChatting) {
    return (
      <Sheet open={isCharacterOpen} onOpenChange={handleClose}>
        <SheetContent className="w-[400px] sm:w-[540px] p-0 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-insight flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-lg">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col space-y-4 pb-4">
              {chatHistory.map((msg) => (
                <div 
                  key={msg.id || msg.createdAt?.getTime()}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-insight/80 flex items-center justify-center mr-2">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div 
                    className={`${msg.sender === 'user' ? 
                      'bg-brand text-white rounded-l-xl rounded-tr-xl' : 
                      'bg-muted rounded-r-xl rounded-tl-xl'} px-4 py-3 max-w-[80%] relative`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    {msg.createdAt && (
                      <span className="text-xs opacity-75 mt-1 block">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center justify-start">
                  <div className="w-8 h-8 rounded-full bg-insight/80 flex items-center justify-center mr-2">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-r-xl rounded-tl-xl px-4 py-3">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t mt-auto">
            <div className="flex gap-2">
              <Input
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                size="icon"
                className="bg-insight hover:bg-insight/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Ask me anything about freelancing, project management, or business advice
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  // Use Dialog for the initial onboarding flow
  return (
    <Dialog open={isCharacterOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-auto">
        <DialogHeader className="flex justify-between items-center pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-insight/80 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="font-medium">IndieTracker AI</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 p-2">
          {/* Character appearance/animation */}
          {dialogState !== 'summary' && (
            <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-brand flex items-center justify-center relative">
              <Lightbulb className="w-10 h-10 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-insight rounded-full animate-ping"></div>
            </div>
          )}
          
          {/* Onboarding dialog content */}
          <Card className="p-4 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-sm border-white/20 rounded-xl">
            <p className="text-lg">{typedText}<span className="animate-pulse">|</span></p>
          
            {/* User response options */}
            {dialogState === 'questions' && charIndex >= fullText.length && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {[
                  { type: 'new', label: "I'm New", desc: "Just getting started" },
                  { type: 'experienced', label: "Experienced", desc: "Looking to level up" },
                  { type: 'agency', label: "Agency", desc: "Need help managing it" },
                  { type: 'teamLead', label: "Team Lead", desc: "Need collaboration tools" }
                ].map(({ type, label, desc }) => (
                  <Button 
                    key={type}
                    variant="outline" 
                    className={`p-4 h-auto ${userType === type ? 'border-insight border-2' : ''}`}
                    onClick={() => handleOptionSelect(type as UserType)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground mt-1">{desc}</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}
            
            {dialogState === 'skills' && (
              <div className="space-y-4 mt-4">
                <div className="flex gap-2 flex-wrap">
                  {userInfo.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tempSkill}
                    onChange={(e) => setTempSkill(e.target.value)}
                    placeholder="Add skill..."
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {dialogState === 'goal' && (
              <Input
                value={userInfo.mainGoal}
                onChange={(e) => setUserInfo(prev => ({...prev, mainGoal: e.target.value}))}
                placeholder="My ultimate goal is..."
                className="mt-4"
              />
            )}
            
            {dialogState === 'step' && (
              <Input
                value={userInfo.currentStep}
                onChange={(e) => setUserInfo(prev => ({...prev, currentStep: e.target.value}))}
                placeholder="Currently working on..."
                className="mt-4"
              />
            )}
            
            {dialogState === 'plan' && (
              <div className="space-y-4 mt-4">
                <div className="flex gap-2 flex-wrap">
                  {userInfo.plan.map(step => (
                    <Badge key={step} variant="secondary">{step}</Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tempPlan}
                    onChange={(e) => setTempPlan(e.target.value)}
                    placeholder="Add plan step..."
                    onKeyPress={(e) => e.key === 'Enter' && addPlan()}
                  />
                  <Button onClick={addPlan}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {dialogState === 'summary' && (
              <p className="whitespace-pre-line text-sm mt-4">{typedText}</p>
            )}
          </Card>
        
          {/* Next button */}
          {((dialogState === 'intro' || dialogState === 'greeting') && charIndex >= fullText.length) && (
            <Button 
              onClick={handleNext}
              className="mt-2 bg-insight hover:bg-insight/90"
            >
              Continue
            </Button>
          )}
          
          {dialogState === 'questions' && userType && charIndex >= fullText.length && (
            <Button 
              onClick={handleNext}
              className="mt-2 bg-insight hover:bg-insight/90"
            >
              {userType === 'new' || userType === 'experienced' || userType === 'agency' || userType === 'teamLead' 
                ? "Next" 
                : "Let's Talk"}
            </Button>
          )}
          
          {['skills', 'goal', 'step', 'plan'].includes(dialogState) && charIndex >= fullText.length && (
            <Button 
              onClick={handleNext}
              className="mt-2 bg-insight hover:bg-insight/90"
            >
              {dialogState === 'plan' ? 'Finish' : 'Next'}
            </Button>
          )}
          
          {dialogState === 'summary' && charIndex >= fullText.length && (
            <Button 
              onClick={handleNext}
              className="mt-2 bg-insight hover:bg-insight/90"
            >
              Start Creating!
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AICharacterDialog;
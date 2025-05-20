import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  day: DayOfWeek;
  timeOfDay?: TimeOfDay;
}

interface BundleItem {
  id: string;
  title: string;
  description: string;
  products: string[];
  price: number;
  discount: number;
  bestDay: DayOfWeek;
}

interface BakingItem {
  id: string;
  product: string;
  quantity: number;
  day: DayOfWeek;
  priority: 'high' | 'medium' | 'low';
}

interface KeyInsight {
  id: string;
  title: string;
  description: string;
  value?: string | number;
  change?: number;
  icon?: string;
}

interface WeeklyPlan {
  lastGenerated: Date;
  keyInsights: KeyInsight[];
  tasks: TaskItem[];
  bundles: BundleItem[];
  bakingPlan: BakingItem[];
  bestDay: DayOfWeek;
  bestTimeOfDay: TimeOfDay;
}

interface AIAssistantContextType {
  isAssistantOpen: boolean;
  toggleAssistant: () => void;
  weeklyPlan: WeeklyPlan | null;
  isLoading: boolean;
  regeneratePlan: () => Promise<void>;
  viewFullPlan: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export const AIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleAssistant = () => setIsAssistantOpen((prev) => !prev);
  const viewFullPlan = () => {
    // Implementation depends on your app navigation logic
    console.log('View full plan triggered');
  };

  const regeneratePlan = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch('http://localhost:3000/aiadvice/aisales-advice', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      const aiData = data[0]; // assuming the API returns an array

      // Transform API data to WeeklyPlan
      const tasks: TaskItem[] = aiData.weeklyCalendar.flatMap((day: any) =>
        day.tasks.map((task: any, index: number) => ({
          id: `${day.day}-${index}`,
          title: task.description.split(' ').slice(0, 3).join(' '),
          description: task.description,
          completed: false,
          day: day.day as DayOfWeek,
          timeOfDay:
            (task.time.includes('am') && 'Morning') ||
            (task.time.includes('pm') && 'Afternoon') ||
            'Evening'
        }))
      );

      const bundles: BundleItem[] = aiData.bundlesAndOffers.map((b: any, index: number) => ({
        id: `bundle-${index}`,
        title: b.name,
        description: `Save ${b.discount}`,
        products: b.items,
        price: b.bundlePrice,
        discount: parseFloat(b.discount),
        bestDay: 'Wednesday' // assume or infer from message
      }));

      const bakingPlan: BakingItem[] = aiData.bakingPlan.flatMap((entry: any, i: number) =>
        entry.products.map((p: any, j: number) => ({
          id: `baking-${i}-${j}`,
          product: p.name,
          quantity: p.quantity,
          day: (entry.day.replace(/s$/, '') as DayOfWeek) || 'Saturday',
          priority: 'high' // can adjust based on quantity logic
        }))
      );

      const keyInsights: KeyInsight[] = [
        {
          id: 'insight-1',
          title: 'Saturday Sales Strength',
          description: 'Saturday is responsible for 78% of monthly revenue',
          value: '78%',
          icon: '🔥'
        },
        {
          id: 'insight-2',
          title: 'Product Focus',
          description: 'كبوسن is 59% of total sales — make it the hero!',
          value: '59%',
          icon: '⭐'
        }
      ];

      const bestDay = 'Saturday';
      const bestTimeOfDay = 'Morning';

      setWeeklyPlan({
        lastGenerated: new Date(aiData.originalAdvice.createdAt),
        keyInsights,
        tasks,
        bundles,
        bakingPlan,
        bestDay,
        bestTimeOfDay
      });
    } catch (error) {
      console.error('Error fetching weekly AI sales plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    regeneratePlan();
  }, []);

  return (
    <AIAssistantContext.Provider
      value={{
        isAssistantOpen,
        toggleAssistant,
        weeklyPlan,
        isLoading,
        regeneratePlan,
        viewFullPlan
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
};

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (!context) throw new Error('useAIAssistant must be used within AIAssistantProvider');
  return context;
};

import React from 'react';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, RefreshCw, Printer, Calendar, ArrowRight } from 'lucide-react';
import InsightCard from '../insights/InsightCard';
import QuickBundleCard from '../bundles/QuickBundleCard';
import WeekMiniCalendar from '../calendar/WeekMiniCalendar';

const AIAssistantPanel: React.FC = () => {
  const { isAssistantOpen, toggleAssistant, weeklyPlan, isLoading, regeneratePlan, viewFullPlan } = useAIAssistant();

  if (!isAssistantOpen || !weeklyPlan) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in"
        onClick={toggleAssistant}
      />
      <div className={`fixed top-0 right-0 bottom-0 w-full sm:w-96 max-w-full bg-background z-50 shadow-xl border-l overflow-hidden animate-slide-in`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-brand to-brand-light text-white">
            <div>
              <h2 className="text-lg font-semibold">AI Weekly Plan</h2>
              <p className="text-xs opacity-80">Last updated: {formatDate(weeklyPlan.lastGenerated)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleAssistant} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <Tabs defaultValue="insights">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
                <TabsTrigger value="bundles" className="flex-1">Bundles</TabsTrigger>
                <TabsTrigger value="schedule" className="flex-1">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="space-y-4">
                <h3 className="text-md font-medium">Key Business Insights</h3>
                <div className="grid grid-cols-1 gap-3">
                  {weeklyPlan.keyInsights.slice(0, 3).map(insight => (
                    <InsightCard key={insight.id} insight={insight} compact />
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2">Top Recommendations</h3>
                  <Card className="p-3 space-y-2">
                    <p className="text-sm">● Focus on {weeklyPlan.bestDay} as your highest revenue opportunity</p>
                    <p className="text-sm">● Increase staff during {weeklyPlan.bestTimeOfDay} rush hours</p>
                    <p className="text-sm">● Prepare 40% more pastries for weekend demand</p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="bundles" className="space-y-4">
                <h3 className="text-md font-medium">Recommended Bundles</h3>
                <div className="grid grid-cols-1 gap-3">
                  {weeklyPlan.bundles.map(bundle => (
                    <QuickBundleCard key={bundle.id} bundle={bundle} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <h3 className="text-md font-medium">Weekly Task Calendar</h3>
                <WeekMiniCalendar tasks={weeklyPlan.tasks} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-muted/50">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                disabled={isLoading}
                onClick={regeneratePlan}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Plan
              </Button>
            </div>
            <Button 
              className="w-full bg-brand hover:bg-brand-dark"
              onClick={viewFullPlan}
            >
              <Calendar className="mr-2 h-4 w-4" />
              View Full Weekly Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistantPanel;

'use client'

import React, { useState } from 'react';
import Link from 'next/link'
import { useAIAssistant, WeeklyPlan } from '@/contexts/AIAssistantContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, RefreshCw, Printer, Calendar, Sun, Moon, Utensils, Coffee, Clock } from 'lucide-react';
import InsightCard from '@/components/insights/InsightCard';
import { Input } from '@/components/ui/input';
import Cookies from "js-cookie";

const WeeklyPlanPage: React.FC = () => {
  const { weeklyPlan, isLoading, regeneratePlan } = useAIAssistant();
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const handleRegenerate = async () => {
    if (!selectedDate) {
      alert('Please select a start date');
      return;
    }

    const token = Cookies.get("token");
    try {
      const response = await fetch(
        `http://localhost:3000/project-offline-ai/Aiadvice-ai-sales?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to generate plan');
      const newPlan = await response.json();
      regeneratePlan(newPlan);
    } catch (error) {
      console.error("Plan generation error:", error);
      alert('Failed to generate plan. Please try again.');
    }
  };

  if (!weeklyPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 w-full max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4">No Weekly Plan Found</h2>
          <div className="mb-4">
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full mb-4"
            />
            <p className="text-sm text-muted-foreground">
              Selected start date: {new Date(selectedDate).toLocaleDateString()}
            </p>
          </div>
          <Button 
            onClick={handleRegenerate}
            className="bg-brand hover:bg-brand-dark"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Creating Your Plan...' : 'Generate Plan Now'}
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group tasks by day
  const tasksByDay = weeklyPlan.tasks.reduce((acc, task) => {
    if (!acc[task.day]) {
      acc[task.day] = [];
    }
    acc[task.day].push(task);
    return acc;
  }, {} as Record<string, typeof weeklyPlan.tasks>);

  return (
    <div className="container py-8">
      {/* Back button and header */}
      <div className="mb-8">
        <Link href="/" passHref>
          <Button asChild variant="ghost">
            <a className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </a>
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">AI Weekly Plan</h1>
            <p className="text-muted-foreground">
              Plan generated for week starting {formatDate(new Date(selectedDate))}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                disabled={isLoading}
                onClick={handleRegenerate}
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
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Key Business Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {weeklyPlan.keyInsights.map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </section>

      {/* Main content tabs */}
      <Tabs defaultValue="weekly-calendar" className="mb-10">
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="weekly-calendar" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Weekly Calendar
          </TabsTrigger>
          <TabsTrigger value="bundles" className="flex items-center">
            <Coffee className="mr-2 h-4 w-4" />
            Bundles & Offers
          </TabsTrigger>
          <TabsTrigger value="baking-plan" className="flex items-center">
            <Utensils className="mr-2 h-4 w-4" />
            Baking Plan
          </TabsTrigger>
          <TabsTrigger value="time-strategy" className="flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            Time of Day
          </TabsTrigger>
        </TabsList>

        {/* Weekly Calendar Tab */}
        <TabsContent value="weekly-calendar">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Weekly Task Calendar</h3>
            
            {/* Day selector */}
            <div className="flex overflow-x-auto space-x-2 pb-4 mb-4">
              <Button
                variant={activeDay === null ? "default" : "outline"}
                onClick={() => setActiveDay(null)}
                className={activeDay === null ? "bg-brand hover:bg-brand-dark" : ""}
              >
                All Days
              </Button>
              {Object.keys(tasksByDay).map(day => (
                <Button
                  key={day}
                  variant={activeDay === day ? "default" : "outline"}
                  onClick={() => setActiveDay(day)}
                  className={activeDay === day ? "bg-brand hover:bg-brand-dark" : ""}
                >
                  {day}
                </Button>
              ))}
            </div>
            
            {/* Tasks listing */}
            <div className="space-y-6">
              {(activeDay ? [activeDay] : Object.keys(tasksByDay)).map(day => (
                <div key={day} className="border-l-4 border-l-time p-4 bg-background rounded-md">
                  <h4 className="text-lg font-medium mb-3">{day}</h4>
                  <div className="space-y-4">
                    {tasksByDay[day].map(task => (
                      <div key={task.id} className="pl-4 border-l-2 border-l-muted">
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium">{task.title}</h5>
                          <span className="text-xs bg-time/10 text-time-dark px-2 py-1 rounded-full">
                            {task.timeOfDay}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Bundles Tab */}
        <TabsContent value="bundles">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Recommended Bundles & Offers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklyPlan.bundles.map(bundle => (
                <div key={bundle.id} className="ai-bundle-card">
                  <div className="flex flex-col h-full">
                    <div className="mb-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-lg">{bundle.title}</h4>
                        <div className="flex flex-col items-end">
                          <span className="text-sm line-through text-muted-foreground">${bundle.price.toFixed(2)}</span>
                          <span className="text-lg font-bold">${(bundle.price - (bundle.price * bundle.discount / 100)).toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{bundle.description}</p>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bundle.products.map((product, idx) => (
                          <span key={idx} className="text-xs bg-bundle/5 text-bundle-dark px-2 py-1 rounded-full">
                            {product}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-bundle/20 text-bundle-dark px-2 py-1 rounded-full font-medium">
                          {bundle.discount}% Off
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Best on {bundle.bestDay}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Baking Plan Tab */}
        <TabsContent value="baking-plan">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Weekly Baking Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">Product</th>
                    <th className="py-3 px-4 text-left">Day</th>
                    <th className="py-3 px-4 text-left">Quantity</th>
                    <th className="py-3 px-4 text-left">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyPlan.bakingPlan.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                      <td className="py-3 px-4">{item.product}</td>
                      <td className="py-3 px-4">{item.day}</td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          item.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : item.priority === 'medium' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {item.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-baking/10 rounded-md">
              <h4 className="font-medium mb-2">Baking Recommendations</h4>
              <ul className="space-y-2 text-sm">
                <li>● Prepare 40% more inventory for Saturday</li>
                <li>● Start baking 1 hour earlier on weekends</li>
                <li>● Prioritize high-margin items on slow days</li>
              </ul>
            </div>
          </Card>
        </TabsContent>

        {/* Time of Day Strategy Tab */}
        <TabsContent value="time-strategy">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Time of Day Strategy</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="ai-time-card">
                <div className="flex items-center mb-2">
                  <Sun className="w-5 h-5 mr-2 text-time-dark" />
                  <h4 className="font-semibold">Morning Strategy</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>● Peak hours: 7am - 10am</li>
                  <li>● Focus: Breakfast bundles</li>
                  <li>● Staffing: Full coverage</li>
                  <li>● Best days: Weekdays + Saturday</li>
                </ul>
              </div>
              
              <div className="ai-time-card">
                <div className="flex items-center mb-2">
                  <Sun className="w-5 h-5 mr-2 text-time-dark" />
                  <h4 className="font-semibold">Afternoon Strategy</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>● Peak hours: 12pm - 2pm</li>
                  <li>● Focus: Lunch items & coffee</li>
                  <li>● Staffing: Medium coverage</li>
                  <li>● Promotion: 2-for-1 coffee after 2pm</li>
                </ul>
              </div>
              
              <div className="ai-time-card">
                <div className="flex items-center mb-2">
                  <Moon className="w-5 h-5 mr-2 text-time-dark" />
                  <h4 className="font-semibold">Evening Strategy</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>● Peak hours: 5pm - 7pm</li>
                  <li>● Focus: Take-home bundles</li>
                  <li>● Staffing: Reduced coverage</li>
                  <li>● Promotion: Bread discount at 6pm</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 border rounded-md">
              <h4 className="font-medium mb-3">Optimal Staffing Schedule</h4>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3 text-left">Day</th>
                      <th className="py-2 px-3 text-left">Morning (6am-11am)</th>
                      <th className="py-2 px-3 text-left">Afternoon (11am-4pm)</th>
                      <th className="py-2 px-3 text-left">Evening (4pm-9pm)</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="py-2 px-3">Monday-Thursday</td>
                      <td className="py-2 px-3">3 staff</td>
                      <td className="py-2 px-3">2 staff</td>
                      <td className="py-2 px-3">2 staff</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3">Friday</td>
                      <td className="py-2 px-3">3 staff</td>
                      <td className="py-2 px-3">3 staff</td>
                      <td className="py-2 px-3">3 staff</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3">Saturday</td>
                      <td className="py-2 px-3 font-medium text-time-dark">4 staff</td>
                      <td className="py-2 px-3 font-medium text-time-dark">4 staff</td>
                      <td className="py-2 px-3">2 staff</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">Sunday</td>
                      <td className="py-2 px-3">3 staff</td>
                      <td className="py-2 px-3">3 staff</td>
                      <td className="py-2 px-3">1 staff</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeeklyPlanPage;
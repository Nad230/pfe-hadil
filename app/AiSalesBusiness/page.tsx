"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartBar, FileText, TrendingUp, Briefcase, CalendarDays, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie"

interface AdviceData {
  id: string;
  message: string;
  date: string;
  createdAt: string;
  category: string;
  relatedPeriodType: string;
  relatedEntityId: string | null;
  userId: string;
}

const sectionConfig = {
  'DATA LIMITATIONS': { icon: ChartBar, color: 'yellow' },
  'BUSINESS FOUNDATIONS': { icon: FileText, color: 'blue' },
  'ESSENTIAL TRACKING': { icon: TrendingUp, color: 'green' },
  'DIGITAL SERVICE BUSINESS MODEL': { icon: Briefcase, color: 'purple' },
  '60-DAY BUSINESS ESTABLISHMENT PLAN': { icon: CalendarDays, color: 'orange' }
};

const BusinessInsights = () => {
  const [adviceData, setAdviceData] = useState<AdviceData[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvice = async () => {
      const token = Cookies.get("token");
      try {
        const response = await fetch('http://localhost:3000/aiadvice/digital', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch advice');
        const data = await response.json();
        setAdviceData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchAdvice();
  }, []);

  const handleRegeneratePlan = async () => {
    if (!selectedDate) {
      alert('Please select a start date');
      return;
    }

    const token = Cookies.get("token");
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/project-offline-ai/Aiadvice-ai-salesDigital?date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to regenerate plan');
      const newPlan = await response.json();
      setAdviceData(newPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const parseContent = (message: string) => {
    if (!message) return [];
    
    return message.split('\n\n').filter(section => 
      section.match(/^(📊|📝|📈|📆) [A-Z ]+:/)
    ).map(section => {
      const [header, ...content] = section.split('\n');
      const title = header?.replace(/^(📊|📝|📈|📆) /, '').replace(':', '').trim();
      const items = content.filter(line => line.trim());
      
      return { title, items };
    });
  };

  const renderSectionContent = (items: string[]) => {
    return items.map((item, index) => {
      if (item.match(/^\d+\. /)) {
        return <li key={index} className="list-decimal">{item.replace(/^\d+\. /, '')}</li>;
      }
      if (item.startsWith('- ')) {
        return <li key={index} className="list-disc">{item.replace('- ', '')}</li>;
      }
      return <p key={index} className="mb-3">{item}</p>;
    });
  };

  const parse60DayPlan = (message: string) => {
    const planSection = message.split('📆 60-DAY BUSINESS ESTABLISHMENT PLAN:')[1];
    if (!planSection) return [];

    return planSection
      .split('\n')
      .filter(line => line.trim())
      .reduce<Array<{ title: string; items: string[] }>>((acc, line) => {
        if (line.match(/^\d+-\d+ Days:/)) {
          acc.push({ title: line.replace(':', '').trim(), items: [] });
        } else if (line.startsWith('- ')) {
          acc[acc.length - 1].items.push(line.replace('- ', '').trim());
        }
        return acc;
      }, []);
  };

  if (loading) return <div className="text-center py-8">Loading business insights...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  const messageContent = adviceData[0]?.message || '';
  const parsedSections = parseContent(messageContent);
  const businessPlan = parse60DayPlan(messageContent);

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Business Insights</h1>
        <p className="text-muted-foreground">
          Analysis and recommendations for your digital services business
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {parsedSections.map((section, index) => {
          const config = sectionConfig[section.title as keyof typeof sectionConfig] || 
            { icon: ChartBar, color: 'gray' };
          
          return (
            <Card key={index} className={`border-l-4 border-l-${config.color}-500`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <config.icon className={`h-6 w-6 text-${config.color}-500`} />
                  <CardTitle>{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {renderSectionContent(section.items)}
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-orange-500" />
                <CardTitle>REGENERATE PLAN</CardTitle>
              </div>
              <div className="flex gap-2 items-center">
                <Input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
                <Button 
                  onClick={handleRegeneratePlan}
                  disabled={!selectedDate || loading}
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {loading ? 'Generating...' : 'Regenerate Plan'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {businessPlan.map((phase, index) => (
                <div key={index}>
                  <h3 className="font-semibold mb-2">{phase.title}</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessInsights;
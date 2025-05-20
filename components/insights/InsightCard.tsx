import React from 'react';
import { Card } from '@/components/ui/card';
import { KeyInsight } from '@/contexts/AIAssistantContext';

interface InsightCardProps {
  insight: KeyInsight;
  compact?: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, compact = false }) => {
  const { title, description, value, change, icon } = insight;

  // Determine if change is positive, negative, or neutral
  const getChangeColorClass = () => {
    if (!change) return 'text-muted-foreground';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const changeIndicator = change ? (change > 0 ? '↑' : '↓') : '';
  
  if (compact) {
    return (
      <div className="ai-insight-card">
        <div className="flex items-center">
          <div className="mr-3 text-2xl">{icon}</div>
          <div className="flex-1">
            <h3 className="font-medium text-sm">{title}</h3>
            <div className="flex items-baseline">
              <span className="text-lg font-semibold mr-2">{value}</span>
              {change && (
                <span className={`text-xs ${getChangeColorClass()}`}>
                  {changeIndicator} {Math.abs(change)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-5 border-l-4 border-l-insight">
      <div className="flex items-start">
        <div className="mr-4 text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-muted-foreground text-sm mb-1">{description}</p>
          <div className="flex items-baseline mt-2">
            <span className="text-2xl font-semibold mr-2">{value}</span>
            {change && (
              <span className={`text-sm ${getChangeColorClass()}`}>
                {changeIndicator} {Math.abs(change)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InsightCard;

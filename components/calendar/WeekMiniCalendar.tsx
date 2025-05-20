import React from 'react';
import { TaskItem, DayOfWeek } from '@/contexts/AIAssistantContext';
import { Card } from '@/components/ui/card';

interface WeekMiniCalendarProps {
  tasks: TaskItem[];
}

const days: DayOfWeek[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const WeekMiniCalendar: React.FC<WeekMiniCalendarProps> = ({ tasks }) => {
  const tasksByDay: Record<DayOfWeek, TaskItem[]> = days.reduce((acc, day) => {
    acc[day] = tasks.filter(task => task.day === day);
    return acc;
  }, {} as Record<DayOfWeek, TaskItem[]>);

  return (
    <div className="space-y-3">
      {days.map(day => (
        <Card key={day} className={`p-3 ${tasksByDay[day].length > 0 ? 'border-l-4 border-l-time' : ''}`}>
          <h4 className="font-medium text-sm mb-1">{day}</h4>
          {tasksByDay[day].length > 0 ? (
            <ul className="space-y-2">
              {tasksByDay[day].map(task => (
                <li key={task.id} className="text-xs">
                  <div className="flex items-baseline">
                    <span className="text-time-dark font-medium mr-1">{task.timeOfDay}:</span>
                    <span>{task.title}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No scheduled tasks</p>
          )}
        </Card>
      ))}
    </div>
  );
};

export default WeekMiniCalendar;

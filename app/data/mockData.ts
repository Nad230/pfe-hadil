import { User, UserRole, Activity, Event, EventStatus, Convenient, DashboardStats } from '../types';
import { addDays, subDays } from 'date-fns';

// Mock users
export const users: User[] = [
  {
    id: '1',
    name: 'Admin',
    lastName: 'User',
    cin: 'A123456',
    role: UserRole.Admin,
    phone: '123-456-7890',
  },
  {
    id: '2',
    name: 'John',
    lastName: 'Doe',
    cin: 'B123456',
    role: UserRole.Adherent,
    post: 'Developer',
    phone: '123-456-7891',
  },
  {
    id: '3',
    name: 'Jane',
    lastName: 'Smith',
    cin: 'C123456',
    role: UserRole.Responsable,
    post: 'Manager',
    phone: '123-456-7892',
  },
];

// Mock activities
export const activities: Activity[] = [
  {
    id: '1',
    title: 'Tech Workshop',
    organizer: 'IT Department',
    createdAt: new Date(),
    events: []
  },
  {
    id: '2',
    title: 'Team Building',
    organizer: 'HR Department',
    createdAt: subDays(new Date(), 5),
    events: []
  },
  {
    id: '3',
    title: 'Annual Conference',
    organizer: 'Executive Team',
    createdAt: subDays(new Date(), 10),
    events: []
  }
];

// Mock events
export const events: Event[] = [
  {
    id: '1',
    title: 'Introduction to AI',
    startDate: addDays(new Date(), 3),
    endDate: addDays(new Date(), 4),
    status: EventStatus.Open,
    participantsCapacity: 50,
    currentParticipants: 20,
    description: 'Learn about the basics of Artificial Intelligence',
    activityId: '1',
    createdBy: '3'
  },
  {
    id: '2',
    title: 'Outdoor Team Challenge',
    startDate: addDays(new Date(), 7),
    endDate: addDays(new Date(), 7),
    status: EventStatus.Open,
    participantsCapacity: 30,
    currentParticipants: 15,
    description: 'A fun day of outdoor team challenges',
    activityId: '2',
    createdBy: '3'
  },
  {
    id: '3',
    title: 'Industry Insights Panel',
    startDate: addDays(new Date(), 14),
    endDate: addDays(new Date(), 15),
    status: EventStatus.Open,
    participantsCapacity: 100,
    currentParticipants: 75,
    description: 'Industry leaders share insights about the future',
    activityId: '3',
    createdBy: '3'
  },
  {
    id: '4',
    title: 'Web Development Workshop',
    startDate: addDays(new Date(), 5),
    endDate: addDays(new Date(), 6),
    status: EventStatus.Open,
    participantsCapacity: 40,
    currentParticipants: 25,
    description: 'Hands-on workshop for web development',
    activityId: '1',
    createdBy: '3'
  }
];

// Link events to activities
activities.forEach(activity => {
  activity.events = events.filter(event => event.activityId === activity.id);
});

// Mock convenients
export const convenients: Convenient[] = [
  {
    id: '1',
    title: 'Lunch Discount',
    description: '30% off at the cafeteria',
    usageCount: 150,
    rating: 4.5,
    type: 'coupon'
  },
  {
    id: '2',
    title: 'Gym Access',
    description: 'Free access to the company gym',
    usageCount: 220,
    rating: 4.8,
    type: 'ticket'
  },
  {
    id: '3',
    title: 'Concert Tickets',
    description: 'VIP tickets to the annual concert',
    usageCount: 80,
    rating: 4.9,
    type: 'vip'
  },
  {
    id: '4',
    title: 'Office Supplies',
    description: 'Special discount on office supplies',
    usageCount: 120,
    rating: 4.2,
    type: 'coupon'
  }
];

// Mock dashboard stats
export const dashboardStats: DashboardStats = {
  totalAdherents: 45,
  totalResponsables: 12,
  totalEvents: 8,
  activeEvents: 5,
  participantsToday: 23,
  convenientUsage: 87
};

export const getUser = (username: string, password: string): User | null => {
  // In a real app, this would validate credentials against a database
  // For demo purposes, we'll use these hardcoded credentials
  if (username === 'admin' && password === 'admin123') {
    return users.find(u => u.role === UserRole.Admin) || null;
  } else if (username === 'adherent' && password === 'adherent123') {
    return users.find(u => u.role === UserRole.Adherent) || null;
  } else if (username === 'responsable' && password === 'responsable123') {
    return users.find(u => u.role === UserRole.Responsable) || null;
  }
  return null;
};
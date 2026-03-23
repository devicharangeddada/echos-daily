import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  time: string | null; // HH:mm format or null
  category: 'work' | 'personal' | 'health' | 'learning';
  subcategory: string;
  completed: boolean;
}

export interface FocusSession {
  isActive: boolean;
  timeLeft: number; // seconds
  mode: 'work' | 'break';
}

export interface Settings {
  timeFormat: '24h' | '12h';
  sounds: boolean;
}

interface StoreState {
  tasks: Task[];
  focusSession: FocusSession;
  settings: Settings;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  setFocusSession: (session: Partial<FocusSession>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

const defaultTasks: Task[] = [
  { id: '1', title: 'Morning meditation', time: '07:00', category: 'health', subcategory: 'Mindfulness', completed: false },
  { id: '2', title: 'Review sprint backlog', time: '09:00', category: 'work', subcategory: 'Planning', completed: false },
  { id: '3', title: 'Deep work — feature build', time: '10:00', category: 'work', subcategory: 'Engineering', completed: false },
  { id: '4', title: 'Lunch break & walk', time: '12:30', category: 'health', subcategory: 'Recovery', completed: false },
  { id: '5', title: 'Design review sync', time: '14:00', category: 'work', subcategory: 'Meetings', completed: false },
  { id: '6', title: 'Read 30 pages', time: '18:00', category: 'learning', subcategory: 'Reading', completed: false },
  { id: '7', title: 'Evening workout', time: '19:00', category: 'health', subcategory: 'Fitness', completed: false },
  { id: '8', title: 'Journal & reflect', time: null, category: 'personal', subcategory: 'Reflection', completed: false },
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      tasks: defaultTasks,
      focusSession: { isActive: false, timeLeft: 25 * 60, mode: 'work' },
      settings: { timeFormat: '24h', sounds: false },

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: crypto.randomUUID(), completed: false }],
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      setFocusSession: (session) =>
        set((state) => ({
          focusSession: { ...state.focusSession, ...session },
        })),

      updateSettings: (s) =>
        set((state) => ({
          settings: { ...state.settings, ...s },
        })),
    }),
    { name: 'echos-storage' }
  )
);

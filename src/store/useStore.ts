import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  time: string | null;
  date: string | null; // YYYY-MM-DD or null (means "today")
  category: 'work' | 'personal' | 'health' | 'learning';
  subcategory: string;
  completed: boolean;
  // Education-specific
  eduType?: 'study' | 'homework';
  resourceLinks?: string[];
  quickNotes?: string;
}

export interface FocusSession {
  isActive: boolean;
  timeLeft: number;
  mode: 'work' | 'break';
  assignedTaskId: string | null;
}

export interface FocusLog {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  taskId: string | null;
}

export interface Settings {
  timeFormat: '24h' | '12h';
  sounds: boolean;
}

interface StoreState {
  tasks: Task[];
  focusSession: FocusSession;
  focusLogs: FocusLog[];
  settings: Settings;
  selectedDate: string; // YYYY-MM-DD
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setFocusSession: (session: Partial<FocusSession>) => void;
  addFocusLog: (log: Omit<FocusLog, 'id'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setSelectedDate: (date: string) => void;
}

const toDateStr = (d: Date) => d.toISOString().split('T')[0];
const today = toDateStr(new Date());

const defaultTasks: Task[] = [
  { id: '1', title: 'Morning meditation', time: '07:00', date: today, category: 'health', subcategory: 'Mindfulness', completed: false },
  { id: '2', title: 'Review sprint backlog', time: '09:00', date: today, category: 'work', subcategory: 'Planning', completed: false },
  { id: '3', title: 'Deep work — feature build', time: '10:00', date: today, category: 'work', subcategory: 'Engineering', completed: false },
  { id: '4', title: 'Lunch break & walk', time: '12:30', date: today, category: 'health', subcategory: 'Recovery', completed: false },
  { id: '5', title: 'Design review sync', time: '14:00', date: today, category: 'work', subcategory: 'Meetings', completed: false },
  { id: '6', title: 'Read 30 pages', time: '18:00', date: today, category: 'learning', subcategory: 'Reading', completed: false, eduType: 'study', resourceLinks: ['https://example.com/book'], quickNotes: 'Chapter 4-6' },
  { id: '7', title: 'Evening workout', time: '19:00', date: today, category: 'health', subcategory: 'Fitness', completed: false },
  { id: '8', title: 'Journal & reflect', time: null, date: today, category: 'personal', subcategory: 'Reflection', completed: false },
  { id: '9', title: 'Math homework Ch.5', time: '16:00', date: today, category: 'learning', subcategory: 'Mathematics', completed: false, eduType: 'homework', quickNotes: 'Problems 1-20' },
  { id: '10', title: 'Physics lab report', time: null, date: today, category: 'learning', subcategory: 'Physics', completed: false, eduType: 'homework', resourceLinks: ['https://example.com/lab-guide'] },
];

const defaultFocusLogs: FocusLog[] = [
  { id: 'fl1', date: toDateStr(new Date(Date.now() - 6 * 86400000)), durationMinutes: 50, taskId: null },
  { id: 'fl2', date: toDateStr(new Date(Date.now() - 5 * 86400000)), durationMinutes: 25, taskId: null },
  { id: 'fl3', date: toDateStr(new Date(Date.now() - 4 * 86400000)), durationMinutes: 75, taskId: null },
  { id: 'fl4', date: toDateStr(new Date(Date.now() - 3 * 86400000)), durationMinutes: 50, taskId: null },
  { id: 'fl5', date: toDateStr(new Date(Date.now() - 2 * 86400000)), durationMinutes: 100, taskId: null },
  { id: 'fl6', date: toDateStr(new Date(Date.now() - 1 * 86400000)), durationMinutes: 25, taskId: null },
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      tasks: defaultTasks,
      focusSession: { isActive: false, timeLeft: 25 * 60, mode: 'work', assignedTaskId: null },
      focusLogs: defaultFocusLogs,
      settings: { timeFormat: '24h', sounds: false },
      selectedDate: today,

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

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      setFocusSession: (session) =>
        set((state) => ({
          focusSession: { ...state.focusSession, ...session },
        })),

      addFocusLog: (log) =>
        set((state) => ({
          focusLogs: [...state.focusLogs, { ...log, id: crypto.randomUUID() }],
        })),

      updateSettings: (s) =>
        set((state) => ({
          settings: { ...state.settings, ...s },
        })),

      setSelectedDate: (date) => set({ selectedDate: date }),
    }),
    { name: 'echos-storage' }
  )
);

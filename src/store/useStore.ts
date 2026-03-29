import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NodeStatus = 'not_started' | 'learning' | 'mastered' | 'failed';

export interface InfiniteNode {
  id: string;
  parentId: string | null;
  title: string;
  notes?: string;
  color?: string;
  type: 'subject' | 'chapter' | 'topic' | 'task';
  status: NodeStatus;
  mastery: number;
  failureCount: number;
  weightage: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  time: string | null;
  date: string;
  category: 'work' | 'personal' | 'health' | 'learning' | 'education';
  subcategory?: string;
  type: string;
  estimatedMinutes: number;
  dueDate?: string;
  notes?: string;
  quickNotes?: string;
  eduType?: 'study' | 'homework';
  subCategory?: string;
  links?: string[];
}

export interface SoundSettings {
  enabled: boolean;
  volume: number;
  taskComplete: boolean;
  focusStart: boolean;
  focusEnd: boolean;
  levelUp: boolean;
  streakMilestone: boolean;
  uiClick: boolean;
}

export interface ReminderSettings {
  taskReminders: boolean;
  focusReminders: boolean;
  revisionReminders: boolean;
  reminderMinutesBefore: number;
}

export interface Settings {
  timeFormat: '12h' | '24h';
  focusDuration: number;
  sounds: boolean;
  theme: 'light' | 'dark' | 'system';
  soundSettings: SoundSettings;
  reminders: ReminderSettings;
  pomodoroWork: number;
  pomodoroBreak: number;
  autoStartBreak: boolean;
  showXPAnimations: boolean;
  hapticFeedback: boolean;
  compactMode: boolean;
}

export interface FocusLog {
  id: string;
  date: string;
  duration: number;
  topicId?: string;
}

export interface FocusSession {
  topicId: string | null;
  duration: number;
  mode: 'work' | 'break';
}

export interface WeeklyStats {
  date: string;
  tasksCompleted: number;
  focusMinutes: number;
}

const defaultSettings: Settings = {
  timeFormat: '24h',
  focusDuration: 25,
  sounds: false,
  theme: 'dark',
  soundSettings: {
    enabled: false,
    volume: 0.5,
    taskComplete: false,
    focusStart: false,
    focusEnd: false,
    levelUp: false,
    streakMilestone: false,
    uiClick: false,
  },
  reminders: {
    taskReminders: false,
    focusReminders: false,
    revisionReminders: false,
    reminderMinutesBefore: 15,
  },
  pomodoroWork: 25,
  pomodoroBreak: 5,
  autoStartBreak: false,
  showXPAnimations: true,
  hapticFeedback: true,
  compactMode: false,
};

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

interface StoreState {
  // Nodes
  nodes: InfiniteNode[];
  selectedNodeId: string | null;
  addNode: (node: Partial<InfiniteNode>) => void;
  updateNode: (id: string, updates: Partial<InfiniteNode>) => void;
  deleteNode: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  recordFailure: (id: string) => void;
  recordSuccess: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;

  // Focus
  focusSession: FocusSession;
  setFocusSession: (session: Partial<FocusSession>) => void;
  activeSession: boolean;
  setActiveSession: (active: boolean) => void;
  focusLogs: FocusLog[];
  addFocusLog: (log: Omit<FocusLog, 'id'>) => void;
  addSessionToHistory: (session: { duration: number; topicId?: string }) => void;

  // Calendar
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Settings
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;

  // Exam
  examDate: string;
  setExamDate: (date: string) => void;

  // Stats
  weeklyStats: WeeklyStats[];
  xp: number;
  streak: number;
  level: number;
}

export const useStore = create<StoreState>()(
  persist((set) => ({
    // Nodes
    nodes: [],
    selectedNodeId: null,
    xp: 0,
    streak: 0,
    level: 1,

    addNode: (node) =>
      set((state) => ({
        nodes: [
          ...state.nodes,
          {
            id: crypto.randomUUID(),
            parentId: node.parentId || null,
            title: node.title || 'New Section',
            type: node.type || 'topic',
            status: 'not_started',
            mastery: 0,
            failureCount: 0,
            weightage: 5,
            ...node,
          } as InfiniteNode,
        ],
      })),

    updateNode: (id, updates) =>
      set((state) => ({
        nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
      })),

    deleteNode: (id) =>
      set((state) => ({
        nodes: state.nodes.filter((n) => n.id !== id && n.parentId !== id),
      })),

    setSelectedNodeId: (id) => set({ selectedNodeId: id }),

    recordFailure: (id) =>
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id
            ? { ...n, failureCount: n.failureCount + 1, mastery: Math.max(0, n.mastery - 15), status: 'failed' as const }
            : n,
        ),
      })),

    recordSuccess: (id) =>
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id
            ? { ...n, mastery: Math.min(100, n.mastery + 10), status: n.mastery + 10 >= 100 ? 'mastered' as const : 'learning' as const }
            : n,
        ),
      })),

    // Tasks
    tasks: [],
    addTask: (task) =>
      set((state) => ({
        tasks: [
          ...state.tasks,
          {
            id: crypto.randomUUID(),
            title: task.title || 'New Task',
            completed: false,
            time: task.time || null,
            date: task.date || toDateStr(new Date()),
            category: task.category || 'personal',
            type: task.type || 'task',
            estimatedMinutes: task.estimatedMinutes || 30,
            ...task,
          } as Task,
        ],
      })),

    updateTask: (id, updates) =>
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),

    toggleTask: (id) =>
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      })),

    // Focus
    focusSession: { topicId: null, duration: 25 * 60, mode: 'work' },
    setFocusSession: (session) =>
      set((state) => ({ focusSession: { ...state.focusSession, ...session } })),
    activeSession: false,
    setActiveSession: (active) => set({ activeSession: active }),
    focusLogs: [],
    addFocusLog: (log) =>
      set((state) => ({
        focusLogs: [...state.focusLogs, { ...log, id: crypto.randomUUID() }],
      })),
    addSessionToHistory: (session) =>
      set((state) => ({
        focusLogs: [
          ...state.focusLogs,
          { id: crypto.randomUUID(), date: toDateStr(new Date()), duration: session.duration, topicId: session.topicId },
        ],
      })),

    // Calendar
    selectedDate: toDateStr(new Date()),
    setSelectedDate: (date) => set({ selectedDate: date }),

    // Settings
    settings: defaultSettings,
    updateSettings: (updates) =>
      set((state) => ({ settings: { ...state.settings, ...updates } })),

    // Exam
    examDate: '',
    setExamDate: (date) => set({ examDate: date }),

    // Stats
    weeklyStats: [],
  }), { name: 'echos-unified-storage' }),
);

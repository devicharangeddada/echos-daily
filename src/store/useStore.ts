import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateNextReview } from '@/lib/srs-logic';
import { compareRecall } from '@/lib/ai-recall';
import { addReview } from '@/store/vaultDB';

export interface ResourceLink {
  id: string;
  label: string;
  url: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;
  time: string | null;
  date: string | null; // YYYY-MM-DD or null (means "today")
  category: 'work' | 'personal' | 'health' | 'learning' | 'education';
  subcategory: string;
  subCategory?: 'study' | 'homework';
  completed: boolean;
  // Education-specific
  eduType?: 'study' | 'homework';
  resourceLinks?: string[];
  resources?: ResourceLink[];
  quickNotes?: string;
  notes?: string;
  stability?: number; // 0-100 for mastery
}

export interface FocusSession {
  isActive: boolean;
  timeLeft: number;
  mode: 'work' | 'break';
  assignedTaskId: string | null;
}

export interface ActiveSession {
  taskId: string | null;
  startTime: number | null;
  timeLeft: number;
  isPaused: boolean;
  mode: 'work' | 'break';
}

export interface SessionHistory {
  date: string;
  duration: number;
  taskId: string | null;
  completed: boolean;
}

export interface FocusLog {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  taskId: string | null;
}

export interface WeeklyStats {
  focusHours: number;
  tasksCompleted: number;
  consistencyScore: number;
}

export interface ReminderSettings {
  taskReminders: boolean;
  focusReminders: boolean;
  revisionReminders: boolean;
  reminderMinutesBefore: number;
}

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0-100
  taskComplete: boolean;
  focusStart: boolean;
  focusEnd: boolean;
  levelUp: boolean;
  streakMilestone: boolean;
  uiClick: boolean;
}

export interface Settings {
  timeFormat: '24h' | '12h';
  sounds: boolean;
  theme: 'dark' | 'light' | 'system';
  soundSettings: SoundSettings;
  reminders: ReminderSettings;
  focusDuration: number; // minutes
  pomodoroWork: number; // minutes
  pomodoroBreak: number; // minutes
  autoStartBreak: boolean;
  showXPAnimations: boolean;
  hapticFeedback: boolean;
  compactMode: boolean;
}

interface StoreState {
  tasks: Task[];
  focusSession: FocusSession;
  activeSession: ActiveSession;
  focusLogs: FocusLog[];
  sessionHistory: SessionHistory[];
  weeklyStats: WeeklyStats;
  xp: number;
  level: number;
  streak: number;
  lockdown: boolean;
  examDate: string;
  settings: Settings;
  selectedDate: string; // YYYY-MM-DD
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setFocusSession: (session: Partial<FocusSession>) => void;
  setActiveSession: (session: Partial<ActiveSession>) => void;
  addFocusLog: (log: Omit<FocusLog, 'id'>) => void;
  addSessionToHistory: (entry: Omit<SessionHistory, 'date'> & { date?: string }) => void;
  updateWeeklyStats: () => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setSelectedDate: (date: string) => void;
  reviewTask: (taskId: string, quality: number) => Promise<void>;
  brainDump: (taskId: string, userRecall: string, extractedText: string) => Promise<{ similarityScore: number; suggestedQuality: number }>;
  setLockdown: (enabled: boolean) => void;
  setExamDate: (date: string) => void;
  grantXP: (amount: number) => void;
  awardFocusChest: () => void;
  updateTaskStability: (id: string, stability: number) => void;
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

const initialWeeklyStats: WeeklyStats = {
  focusHours: 0,
  tasksCompleted: 0,
  consistencyScore: 0,
};

const calculateWeeklyStats = (tasks: Task[], focusLogs: FocusLog[]): WeeklyStats => {
  const now = new Date();
  const last7 = new Set<string>();
  let focusMinutes = 0;
  let completed = 0;
  for (let i = 0; i < 7; i += 1) {
    const d = toDateStr(new Date(Date.now() - i * 86400000));
    last7.add(d);
  }

  focusLogs.forEach((log) => {
    if (last7.has(log.date)) focusMinutes += log.durationMinutes;
  });

  const daysWithActivity = new Set<string>();
  tasks.forEach((t) => {
    const d = t.date || toDateStr(now);
    if (last7.has(d)) {
      if (t.completed) {
        completed += 1;
        daysWithActivity.add(d);
      }
    }
  });

  focusLogs.forEach((log) => {
    if (last7.has(log.date) && log.durationMinutes > 0) daysWithActivity.add(log.date);
  });

  return {
    focusHours: Number((focusMinutes / 60).toFixed(1)),
    tasksCompleted: completed,
    consistencyScore: Number(((daysWithActivity.size / 7) * 100).toFixed(0)),
  };
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      tasks: defaultTasks,
      focusSession: { isActive: false, timeLeft: 25 * 60, mode: 'work', assignedTaskId: null },
      activeSession: { taskId: null, startTime: null, timeLeft: 25 * 60, isPaused: true, mode: 'work' },
      focusLogs: defaultFocusLogs,
      sessionHistory: [],
      weeklyStats: initialWeeklyStats,
      xp: 0,
      level: 1,
      streak: 0,
      lockdown: false,
      examDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      settings: {
        timeFormat: '24h',
        focusDuration: 25,
        sounds: false,
        theme: 'dark',
        soundSettings: {
          enabled: false,
          volume: 0.5,
          taskComplete: true,
          focusStart: true,
          focusEnd: true,
          levelUp: true,
          streakMilestone: true,
          uiClick: false,
        },
        reminders: {
          taskReminders: true,
          focusReminders: true,
          revisionReminders: true,
          reminderMinutesBefore: 15,
        },
        pomodoroWork: 25,
        pomodoroBreak: 5,
        autoStartBreak: false,
        showXPAnimations: true,
        hapticFeedback: true,
        compactMode: false,
      },
      selectedDate: today,

      addTask: (task) =>
        set((state) => {
          const nextTasks = [...state.tasks, { ...task, id: crypto.randomUUID(), completed: false }];
          return {
            tasks: nextTasks,
            weeklyStats: calculateWeeklyStats(nextTasks, state.focusLogs),
          };
        }),

      toggleTask: (id) =>
        set((state) => {
          const nextTasks = state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
          return {
            tasks: nextTasks,
            weeklyStats: calculateWeeklyStats(nextTasks, state.focusLogs),
          };
        }),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          weeklyStats: calculateWeeklyStats(state.tasks.filter((t) => t.id !== id), state.focusLogs),
        })),

      updateTask: (id, updates) =>
        set((state) => {
          const nextTasks = state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
          return {
            tasks: nextTasks,
            weeklyStats: calculateWeeklyStats(nextTasks, state.focusLogs),
          };
        }),

      setFocusSession: (session) =>
        set((state) => ({
          focusSession: { ...state.focusSession, ...session },
        })),

      setActiveSession: (session) =>
        set((state) => ({
          activeSession: { ...state.activeSession, ...session },
        })),

      addFocusLog: (log) =>
        set((state) => {
          const nextLogs = [...state.focusLogs, { ...log, id: crypto.randomUUID() }];
          const xpGain = Math.round(log.durationMinutes / 25 * 100);
          const nextXP = state.xp + xpGain;
          const nextLevel = Math.floor(nextXP / 1000) + 1;
          return {
            focusLogs: nextLogs,
            weeklyStats: calculateWeeklyStats(state.tasks, nextLogs),
            xp: nextXP,
            level: nextLevel,
            streak: state.streak + 1,
          };
        }),

      addSessionToHistory: (entry) =>
        set((state) => {
          const date = entry.date || toDateStr(new Date());
          const nextHistory = [...state.sessionHistory, { date, duration: entry.duration, taskId: entry.taskId, completed: entry.completed }];
          const nextLogs = [...state.focusLogs, { id: crypto.randomUUID(), date, durationMinutes: entry.duration, taskId: entry.taskId }];
          const xpGain = Math.round(entry.duration / 25 * 100);
          const nextXP = state.xp + xpGain;
          const nextLevel = Math.floor(nextXP / 1000) + 1;
          return {
            sessionHistory: nextHistory,
            focusLogs: nextLogs,
            weeklyStats: calculateWeeklyStats(state.tasks, nextLogs),
            xp: nextXP,
            level: nextLevel,
            streak: state.streak + 1,
          };
        }),

      updateWeeklyStats: () =>
        set((state) => ({
          weeklyStats: calculateWeeklyStats(state.tasks, state.focusLogs),
        })),

      setLockdown: (enabled) => set({ lockdown: enabled }),

      setExamDate: (date) => set({ examDate: date }),

      grantXP: (amount) =>
        set((state) => {
          const bonus = Math.floor(Math.random() * 71) + 80; // 80-150
          const totalGain = Math.round(amount * (1 + bonus / 100));
          const nextXP = state.xp + totalGain;
          const nextLevel = Math.floor(nextXP / 1000) + 1;
          const earned = nextLevel > state.level;
          return {
            xp: nextXP,
            level: nextLevel,
            streak: earned ? state.streak + 1 : state.streak,
            weeklyStats: { ...state.weeklyStats },
          };
        }),

      awardFocusChest: () =>
        set((state) => {
          const base = 100;
          const mega = Math.floor(Math.random() * 71) + 80;
          const xpGain = base + mega;
          const nextXP = state.xp + xpGain;
          const nextLevel = Math.floor(nextXP / 1000) + 1;
          return {
            xp: nextXP,
            level: nextLevel,
            streak: state.streak + 1,
            weeklyStats: { ...state.weeklyStats },
          };
        }),

      updateTaskStability: (id, stability) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, stability } : t)),
        })),

      updateSettings: (s) =>
        set((state) => ({
          settings: { ...state.settings, ...s },
        })),

      setSelectedDate: (date) => set({ selectedDate: date }),

      reviewTask: async (taskId, quality) => {
        // Get existing reviews for this task to calculate SM2 parameters
        const { getReviewsByTask } = await import('@/store/vaultDB');
        const existingReviews = await getReviewsByTask(taskId);

        // Calculate current SM2 state from review history
        let easiness = 2.5;
        let interval = 1;
        let reps = 0;

        if (existingReviews.length > 0) {
          // Use the most recent review to get current state
          const lastReview = existingReviews[existingReviews.length - 1];
          easiness = lastReview.easiness;
          interval = lastReview.interval;
          reps = existingReviews.filter(r => r.quality >= 3).length;
        }

        // Create mock flashcard for SM2 calculation
        const mockCard: Partial<FlashcardItem> = {
          easiness,
          interval,
          reps,
          lastReview: Date.now(),
          dueDate: Date.now(),
          stability: 0,
        };

        const updates = calculateNextReview(mockCard, quality);

        // Store the review in IndexedDB
        await addReview({
          taskId,
          quality,
          nextReview: updates.dueDate || Date.now() + (updates.interval || 1) * 24 * 60 * 60 * 1000,
          interval: updates.interval || 1,
          easiness: updates.easiness || 2.5,
        });

        // Update task stability
        set((state) => ({
          tasks: state.tasks.map(t =>
            t.id === taskId
              ? { ...t, stability: updates.stability || 0 }
              : t
          ),
        }));
      },

      brainDump: async (taskId, userRecall, extractedText) => {
        const result = await compareRecall(userRecall, extractedText);

        // Automatically review the task with the suggested quality
        await new Promise<void>((resolve) => {
          set((state) => {
            state.reviewTask(taskId, result.suggestedQuality);
            resolve();
            return state;
          });
        });

        return result;
      },
    }),
    { name: 'echos-storage' }
  )
);

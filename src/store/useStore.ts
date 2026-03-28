import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateNextReview } from '@/lib/srs-logic';
import { compareRecall } from '@/lib/ai-recall';
import { addReview } from '@/store/vaultDB';
import type { FlashcardItem } from '@/store/vaultDB';

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
  date: string | null;
  dueDate?: string | null;
  category: 'work' | 'personal' | 'health' | 'learning' | 'education';
  subcategory: string;
  subCategory?: 'study' | 'homework';
  completed: boolean;
  eduType?: 'study' | 'homework';
  resourceLinks?: string[];
  resources?: ResourceLink[];
  quickNotes?: string;
  notes?: string;
  stability?: number;
}

export type NodeStatus = 'not_started' | 'learning' | 'mastered' | 'failed' | 'retrying';
export type ActionType = 'study' | 'practice' | 'recall' | 'revision' | 'test';
export type NodeType = 'subject' | 'chapter' | 'topic' | 'task';
export type TaskType = 'study' | 'revision' | 'test' | 'recall';

export interface InfiniteNode {
  id: string;
  parentId: string | null;
  title: string;
  type: NodeType;
  description?: string;
  notes?: string;
  color?: string;
  icon?: string;
  weightage: number;
  mastery: number;
  failureCount: number;
  nextDueDate?: number;
  lastSessionDate?: number;
  completed: boolean;
  status: NodeStatus;
  progress: number;
}

export interface NodeAction {
  id: string;
  nodeId: string;
  type: ActionType;
  completed: boolean;
  repeat: boolean;
  energyLevel: 'low' | 'medium' | 'high';
}

export interface StructuredTask extends Task {
  nodeId: string;
  type: TaskType;
  energyLevel: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  dueDate: string | null;
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
  date: string;
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
  volume: number;
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
  focusDuration: number;
  pomodoroWork: number;
  pomodoroBreak: number;
  autoStartBreak: boolean;
  showXPAnimations: boolean;
  hapticFeedback: boolean;
  compactMode: boolean;
}

interface StoreState {
  nodes: InfiniteNode[];
  actions: NodeAction[];
  selectedNodeId: string | null;
  tasks: StructuredTask[];
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
  selectedDate: string;
  addNode: (node: Partial<Omit<InfiniteNode, 'id' | 'completed' | 'progress' | 'mastery' | 'failureCount' | 'status' | 'weightage'>> & { title: string; parentId: string | null }) => void;
  updateNode: (id: string, updates: Partial<InfiniteNode>) => void;
  deleteNode: (id: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  recordFailure: (nodeId: string) => void;
  recordSuccess: (nodeId: string) => void;
  addAction: (action: Omit<NodeAction, 'id' | 'completed'>) => void;
  resolveAction: (nodeId: string, success: boolean) => void;
  updateNodeStatus: (id: string, status: NodeStatus) => void;
  updateNodeProgress: (id: string, progress: number) => void;
  calculateAutoPriority: (nodeId: string) => number;
  addTask: (task: Omit<StructuredTask, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<StructuredTask>) => void;
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

const defaultTasks: StructuredTask[] = [
  { id: '1', title: 'Morning meditation', time: '07:00', date: today, dueDate: today, category: 'health', subcategory: 'Mindfulness', completed: false, nodeId: 'subject-1', type: 'study', energyLevel: 'low', estimatedMinutes: 15 },
  { id: '2', title: 'Review sprint backlog', time: '09:00', date: today, dueDate: today, category: 'work', subcategory: 'Planning', completed: false, nodeId: 'chapter-1', type: 'revision', energyLevel: 'medium', estimatedMinutes: 25 },
  { id: '3', title: 'Deep work — feature build', time: '10:00', date: today, dueDate: today, category: 'work', subcategory: 'Engineering', completed: false, nodeId: 'topic-3', type: 'study', energyLevel: 'high', estimatedMinutes: 90 },
  { id: '4', title: 'Lunch break & walk', time: '12:30', date: today, dueDate: today, category: 'health', subcategory: 'Recovery', completed: false, nodeId: 'subject-1', type: 'recall', energyLevel: 'low', estimatedMinutes: 30 },
  { id: '5', title: 'Design review sync', time: '14:00', date: today, dueDate: today, category: 'work', subcategory: 'Meetings', completed: false, nodeId: 'chapter-2', type: 'revision', energyLevel: 'medium', estimatedMinutes: 45 },
  { id: '6', title: 'Read 30 pages', time: '18:00', date: today, dueDate: today, category: 'learning', subcategory: 'Reading', completed: false, eduType: 'study', resourceLinks: ['https://example.com/book'], quickNotes: 'Chapter 4-6', nodeId: 'topic-4', type: 'study', energyLevel: 'high', estimatedMinutes: 40 },
  { id: '7', title: 'Evening workout', time: '19:00', date: today, dueDate: today, category: 'health', subcategory: 'Fitness', completed: false, nodeId: 'subject-1', type: 'recall', energyLevel: 'medium', estimatedMinutes: 40 },
  { id: '8', title: 'Journal & reflect', time: null, date: today, dueDate: today, category: 'personal', subcategory: 'Reflection', completed: false, nodeId: 'chapter-3', type: 'revision', energyLevel: 'low', estimatedMinutes: 20 },
  { id: '9', title: 'Math homework Ch.5', time: '16:00', date: today, dueDate: today, category: 'learning', subcategory: 'Mathematics', completed: false, eduType: 'homework', quickNotes: 'Problems 1-20', nodeId: 'topic-2', type: 'test', energyLevel: 'high', estimatedMinutes: 50 },
  { id: '10', title: 'Physics lab report', time: null, date: today, dueDate: today, category: 'learning', subcategory: 'Physics', completed: false, eduType: 'homework', resourceLinks: ['https://example.com/lab-guide'], nodeId: 'topic-5', type: 'study', energyLevel: 'medium', estimatedMinutes: 60 },
];

const defaultNodes: InfiniteNode[] = [
  {
    id: 'subject-1',
    parentId: null,
    type: 'subject',
    title: 'Math',
    weightage: 9,
    mastery: 55,
    failureCount: 0,
    status: 'learning',
    progress: 55,
    color: '#3b82f6',
    icon: '📘',
    completed: false,
  },
  {
    id: 'chapter-1',
    parentId: 'subject-1',
    type: 'chapter',
    title: 'Algebra',
    weightage: 8,
    mastery: 45,
    failureCount: 0,
    status: 'learning',
    progress: 45,
    color: '#10b981',
    icon: '📗',
    completed: false,
  },
  {
    id: 'topic-1',
    parentId: 'chapter-1',
    type: 'topic',
    title: 'Linear equations',
    weightage: 7,
    mastery: 60,
    failureCount: 0,
    status: 'learning',
    progress: 60,
    color: '#f59e0b',
    icon: '🔢',
    completed: false,
  },
  {
    id: 'topic-2',
    parentId: 'chapter-1',
    type: 'topic',
    title: 'Quadratic equations',
    weightage: 9,
    mastery: 15,
    failureCount: 0,
    status: 'not_started',
    progress: 15,
    color: '#ef4444',
    icon: '📐',
    completed: false,
  },
  {
    id: 'chapter-2',
    parentId: 'subject-1',
    type: 'chapter',
    title: 'Calculus',
    weightage: 9,
    mastery: 35,
    failureCount: 0,
    status: 'learning',
    progress: 35,
    color: '#8b5cf6',
    icon: '∫',
    completed: false,
  },
  {
    id: 'topic-3',
    parentId: 'chapter-2',
    type: 'topic',
    title: 'Derivatives',
    weightage: 8,
    mastery: 40,
    failureCount: 0,
    status: 'learning',
    progress: 40,
    color: '#6366f1',
    icon: '⚡',
    completed: false,
  },
  {
    id: 'topic-4',
    parentId: 'chapter-2',
    type: 'topic',
    title: 'Integrals',
    weightage: 7,
    mastery: 55,
    failureCount: 0,
    status: 'learning',
    progress: 55,
    color: '#14b8a6',
    icon: '∑',
    completed: false,
  },
  {
    id: 'chapter-3',
    parentId: 'subject-1',
    type: 'chapter',
    title: 'Statistics',
    weightage: 6,
    mastery: 25,
    failureCount: 0,
    status: 'learning',
    progress: 25,
    color: '#f97316',
    icon: '📊',
    completed: false,
  },
  {
    id: 'topic-5',
    parentId: 'chapter-3',
    type: 'topic',
    title: 'Probability',
    weightage: 8,
    mastery: 20,
    failureCount: 0,
    status: 'not_started',
    progress: 20,
    color: '#ec4899',
    icon: '🎲',
    completed: false,
  },
];

const defaultFocusLogs: FocusLog[] = [
  { id: 'fl1', date: toDateStr(new Date(Date.now() - 6 * 86400000)), durationMinutes: 50, taskId: null },
  { id: 'fl2', date: toDateStr(new Date(Date.now() - 5 * 86400000)), durationMinutes: 25, taskId: null },
  { id: 'fl3', date: toDateStr(new Date(Date.now() - 4 * 86400000)), durationMinutes: 75, taskId: null },
  { id: 'fl4', date: toDateStr(new Date(Date.now() - 3 * 86400000)), durationMinutes: 50, taskId: null },
  { id: 'fl5', date: toDateStr(new Date(Date.now() - 2 * 86400000)), durationMinutes: 100, taskId: null },
  { id: 'fl6', date: toDateStr(new Date(Date.now() - 1 * 86400000)), durationMinutes: 25, taskId: null },
];

const initialWeeklyStats: WeeklyStats = { focusHours: 0, tasksCompleted: 0, consistencyScore: 0 };

const calculateWeeklyStats = (tasks: StructuredTask[], focusLogs: FocusLog[]): WeeklyStats => {
  const last7 = new Set<string>();
  let focusMinutes = 0;
  let completed = 0;
  for (let i = 0; i < 7; i += 1) {
    last7.add(toDateStr(new Date(Date.now() - i * 86400000)));
  }

  focusLogs.forEach((log) => {
    if (last7.has(log.date)) focusMinutes += log.durationMinutes;
  });

  const daysWithActivity = new Set<string>();
  const now = new Date();
  tasks.forEach((t) => {
    const d = t.date || toDateStr(now);
    if (last7.has(d) && t.completed) {
      completed += 1;
      daysWithActivity.add(d);
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
    (set, get) => ({
      nodes: defaultNodes,
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
      selectedNodeId: null,
      actions: [],

      addTask: (task) =>
        set((state) => {
          const nextTasks = [...state.tasks, { ...task, id: crypto.randomUUID(), completed: false }];
          return { tasks: nextTasks, weeklyStats: calculateWeeklyStats(nextTasks, state.focusLogs) };
        }),

      toggleTask: (id) =>
        set((state) => {
          const nextTasks = state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
          return { tasks: nextTasks, weeklyStats: calculateWeeklyStats(nextTasks, state.focusLogs) };
        }),

      removeTask: (id) =>
        set((state) => {
          const nextTasks = state.tasks.filter((t) => t.id !== id);
          return { tasks: nextTasks, weeklyStats: calculateWeeklyStats(nextTasks, state.focusLogs) };
        }),

      updateTask: (id, updates) =>
        set((state) => {
          const nextTasks = state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
          return { tasks: nextTasks, weeklyStats: calculateWeeklyStats(nextTasks, state.focusLogs) };
        }),

      setFocusSession: (session) => set((state) => ({ focusSession: { ...state.focusSession, ...session } })),
      setActiveSession: (session) => set((state) => ({ activeSession: { ...state.activeSession, ...session } })),

      addFocusLog: (log) =>
        set((state) => {
          const nextLogs = [...state.focusLogs, { ...log, id: crypto.randomUUID() }];
          const xpGain = Math.round((log.durationMinutes / 25) * 100);
          const nextXP = state.xp + xpGain;
          return {
            focusLogs: nextLogs,
            weeklyStats: calculateWeeklyStats(state.tasks, nextLogs),
            xp: nextXP,
            level: Math.floor(nextXP / 1000) + 1,
            streak: state.streak + 1,
          };
        }),

      addSessionToHistory: (entry) =>
        set((state) => {
          const date = entry.date || toDateStr(new Date());
          const nextHistory = [...state.sessionHistory, { date, duration: entry.duration, taskId: entry.taskId, completed: entry.completed }];
          const nextLogs = [...state.focusLogs, { id: crypto.randomUUID(), date, durationMinutes: entry.duration, taskId: entry.taskId }];
          const xpGain = Math.round((entry.duration / 25) * 100);
          const nextXP = state.xp + xpGain;
          return {
            sessionHistory: nextHistory,
            focusLogs: nextLogs,
            weeklyStats: calculateWeeklyStats(state.tasks, nextLogs),
            xp: nextXP,
            level: Math.floor(nextXP / 1000) + 1,
            streak: state.streak + 1,
          };
        }),

      updateWeeklyStats: () => set((state) => ({ weeklyStats: calculateWeeklyStats(state.tasks, state.focusLogs) })),

      setLockdown: (enabled) => set({ lockdown: enabled }),
      setExamDate: (date) => set({ examDate: date }),

      grantXP: (amount) =>
        set((state) => {
          const bonus = Math.floor(Math.random() * 71) + 80;
          const totalGain = Math.round(amount * (1 + bonus / 100));
          const nextXP = state.xp + totalGain;
          const nextLevel = Math.floor(nextXP / 1000) + 1;
          return { xp: nextXP, level: nextLevel, streak: nextLevel > state.level ? state.streak + 1 : state.streak };
        }),

      awardFocusChest: () =>
        set((state) => {
          const xpGain = 100 + Math.floor(Math.random() * 71) + 80;
          const nextXP = state.xp + xpGain;
          return { xp: nextXP, level: Math.floor(nextXP / 1000) + 1, streak: state.streak + 1 };
        }),

      updateTaskStability: (id, stability) =>
        set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, stability } : t)) })),

      updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
      setSelectedDate: (date) => set({ selectedDate: date }),

      addNode: (node) =>
        set((state) => ({
          nodes: [
            ...state.nodes,
            {
              id: crypto.randomUUID(),
              title: node.title,
              parentId: node.parentId ?? null,
              description: node.description ?? '',
              notes: node.notes ?? '',
              type: node.type ?? 'topic',
              color: node.color ?? '#3b82f6',
              icon: node.icon ?? '📘',
              weightage: node.weightage ?? 5,
              mastery: node.mastery ?? 0,
              failureCount: node.failureCount ?? 0,
              nextDueDate: node.nextDueDate,
              lastSessionDate: node.lastSessionDate,
              completed: node.completed ?? false,
              status: node.status ?? 'not_started',
              progress: node.progress ?? 0,
            },
          ],
        })),

      setSelectedNodeId: (nodeId) =>
        set(() => ({ selectedNodeId: nodeId })),

      updateNode: (id, updates) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, ...updates } : node,
          ),
        })),

      deleteNode: (id) =>
        set((state) => {
          const collectTree = (nodeId: string, allNodes: InfiniteNode[]): Set<string> => {
            const ids = new Set<string>([nodeId]);
            for (const node of allNodes) {
              if (node.parentId && ids.has(node.parentId)) {
                ids.add(node.id);
              }
            }
            return ids;
          };

          const pruned = collectTree(id, state.nodes);
          return {
            nodes: state.nodes.filter((node) => !pruned.has(node.id)),
            actions: state.actions.filter((action) => !pruned.has(action.nodeId)),
            selectedNodeId: pruned.has(state.selectedNodeId ?? '') ? null : state.selectedNodeId,
          };
        }),

      addAction: (action) =>
        set((state) => ({
          actions: [
            ...state.actions,
            {
              id: crypto.randomUUID(),
              completed: false,
              ...action,
            },
          ],
        })),

      recordFailure: (nodeId) =>
        set((state) => {
          const node = state.nodes.find((candidate) => candidate.id === nodeId);
          if (!node) return state;

          const nextMastery = Math.max(0, node.mastery - 12);
          const updatedNode = {
            ...node,
            status: 'failed',
            failureCount: node.failureCount + 1,
            mastery: nextMastery,
            nextDueDate: Date.now() + 2 * 3600000,
            progress: nextMastery,
          };

          return {
            nodes: state.nodes.map((current) => (current.id === nodeId ? updatedNode : current)),
            selectedNodeId: state.selectedNodeId === nodeId ? nodeId : state.selectedNodeId,
          };
        }),

      recordSuccess: (nodeId) =>
        set((state) => {
          const node = state.nodes.find((candidate) => candidate.id === nodeId);
          if (!node) return state;

          const delta = node.status === 'failed' ? 22 : 16;
          const nextMastery = Math.min(100, node.mastery + delta);
          const updatedNode = {
            ...node,
            status: nextMastery >= 90 ? 'mastered' : 'learning',
            failureCount: Math.max(0, node.failureCount - 1),
            mastery: nextMastery,
            nextDueDate: Date.now() + 24 * 3600000,
            progress: nextMastery,
            lastSessionDate: Date.now(),
            completed: nextMastery >= 100 ? true : node.completed,
          };

          return {
            nodes: state.nodes.map((current) => (current.id === nodeId ? updatedNode : current)),
            selectedNodeId: state.selectedNodeId === nodeId ? nodeId : state.selectedNodeId,
          };
        }),

      resolveAction: (nodeId, success) =>
        set((state) => {
          const node = state.nodes.find((candidate) => candidate.id === nodeId);
          if (!node) return state;

          const masteryDelta = success ? 15 : -10;
          const nextDue = Date.now() + (success ? 24 * 3600000 : 1 * 3600000);
          const updatedNode = {
            ...node,
            status: success ? 'learning' : 'failed',
            failureCount: node.failureCount + (success ? 0 : 1),
            mastery: Math.min(100, Math.max(0, node.mastery + masteryDelta)),
            nextDueDate: nextDue,
            lastSessionDate: Date.now(),
            progress: Math.min(100, Math.max(0, node.mastery + masteryDelta)),
          };

          return {
            nodes: state.nodes.map((current) => (current.id === nodeId ? updatedNode : current)),
            actions: state.actions.map((action) =>
              action.nodeId === nodeId
                ? { ...action, completed: success, repeat: !success }
                : action,
            ),
            selectedNodeId: state.selectedNodeId === nodeId ? nodeId : state.selectedNodeId,
          };
        }),

      updateNodeStatus: (id, status) =>
        set((state) => ({ nodes: state.nodes.map((node) => (node.id === id ? { ...node, status } : node)) })),

      updateNodeProgress: (id, progress) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  progress,
                  mastery: Math.min(100, Math.max(0, progress)),
                  status: progress >= 90 ? 'mastered' : node.status,
                }
              : node,
          ),
        })),

      calculateAutoPriority: (nodeId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (!node) return 0;
        const incompleteTasks = get().tasks.filter((task) => task.nodeId === nodeId && !task.completed).length;
        const urgency = Math.max(0, 100 - node.mastery) / 10;
        const overdue = node.nextDueDate && node.nextDueDate <= Date.now() ? 1 : 0;
        return Math.round(node.weightage * 1.3 + urgency * 8 + node.failureCount * 3 + incompleteTasks * 6 + overdue * 10);
      },

      reviewTask: async (taskId, quality) => {
        const { getReviewsByTask } = await import('@/store/vaultDB');
        const existingReviews = await getReviewsByTask(taskId);

        let easiness = 2.5;
        let interval = 1;
        let reps = 0;

        if (existingReviews.length > 0) {
          const lastReview = existingReviews[existingReviews.length - 1];
          easiness = lastReview.easiness;
          interval = lastReview.interval;
          reps = existingReviews.filter((r) => r.quality >= 3).length;
        }

        const mockCard: FlashcardItem = {
          id: taskId,
          topicId: taskId,
          easiness,
          interval,
          reps,
          lastReview: Date.now(),
          dueDate: Date.now(),
          stability: 0,
        };

        const updates = calculateNextReview(mockCard, quality);

        await addReview({
          taskId,
          quality,
          nextReview: updates.dueDate || Date.now() + (updates.interval || 1) * 24 * 60 * 60 * 1000,
          interval: updates.interval || 1,
          easiness: updates.easiness || 2.5,
        });

        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, stability: updates.stability || 0 } : t)),
        }));
      },

      brainDump: async (taskId, userRecall, extractedText) => {
        const result = await compareRecall(userRecall, extractedText);
        await get().reviewTask(taskId, result.suggestedQuality);
        return result;
      },
    }),
    { name: 'echos-storage' },
  ),
);

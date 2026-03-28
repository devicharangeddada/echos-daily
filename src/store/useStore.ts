import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NodeStatus = 'not_started' | 'learning' | 'mastered' | 'failed';

export interface InfiniteNode {
  id: string;
  parentId: string | null; // Infinite nesting logic
  title: string;
  notes?: string;
  type: 'subject' | 'chapter' | 'topic' | 'task';
  status: NodeStatus;
  mastery: number; // 0-100 for infographics
  failureCount: number; // Idea 3: Logic
  weightage: number; // 1-10 importance
}

interface StoreState {
  nodes: InfiniteNode[];
  selectedNodeId: string | null;
  addNode: (node: Partial<InfiniteNode>) => void;
  updateNode: (id: string, updates: Partial<InfiniteNode>) => void;
  deleteNode: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  recordFailure: (id: string) => void;
  xp: number;
  streak: number;
  level: number;
}

export const useStore = create<StoreState>()(
  persist((set) => ({
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
          },
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
            ? {
                ...n,
                failureCount: n.failureCount + 1,
                mastery: Math.max(0, n.mastery - 15),
                status: 'failed',
              }
            : n,
        ),
      })),
  }), { name: 'echos-unified-storage' }),
);

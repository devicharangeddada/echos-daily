import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { useStore, InfiniteNode } from '@/store/useStore';
import NodeInspector from './NodeInspector';

const getChildType = (parentType: InfiniteNode['type']) => {
  if (parentType === 'subject') return 'chapter';
  if (parentType === 'chapter') return 'topic';
  if (parentType === 'topic') return 'task';
  return 'topic';
};

const TreeNode = ({ node, depth = 0 }: { node: InfiniteNode; depth: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { nodes, addNode, setSelectedNodeId } = useStore();

  const children = nodes.filter((n) => n.parentId === node.id);
  const mastery = Math.round(node.mastery ?? node.progress ?? 0);

  return (
    <div className="w-full">
      <div
        className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-foreground/5 transition-all cursor-pointer apple-glass mb-1"
        style={{ marginLeft: `${depth * 1.2}rem` }}
        onClick={() => setSelectedNodeId(node.id)}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsExpanded((current) => !current);
          }}
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary transition-colors"
        >
          {children.length > 0 ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="h-4 w-4" />
          )}
        </button>

        <div className="flex-1 flex items-center justify-between min-w-0 gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{node.title}</p>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-1">
              {node.status.replace('_', ' ')}
            </p>
          </div>

          <div className="relative h-6 w-6">
            <svg viewBox="0 0 24 24" className="h-6 w-6">
              <circle cx="12" cy="12" r="10" className="stroke-border fill-transparent" strokeWidth="2" />
              <circle
                cx="12"
                cy="12"
                r="10"
                className="stroke-primary fill-transparent"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={Math.PI * 2 * 10}
                strokeDashoffset={Math.PI * 2 * 10 * (1 - mastery / 100)}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
          </div>
        </div>

        <button
          type="button"
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded-full transition-all"
          onClick={(event) => {
            event.stopPropagation();
            setIsAdding(true);
          }}
        >
          <Plus size={14} className="text-primary" />
        </button>
      </div>

      {isAdding && (
        <div className="ml-10 mb-2">
          <input
            autoFocus
            className="w-full bg-transparent border-b border-primary px-2 py-1 text-sm outline-none"
            placeholder="Name your section..."
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                const value = event.currentTarget.value.trim();
                if (value) {
                  addNode({ title: value, parentId: node.id, type: getChildType(node.type) });
                }
                setIsAdding(false);
              }
              if (event.key === 'Escape') {
                setIsAdding(false);
              }
            }}
          />
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {isExpanded && children.map((child) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <TreeNode node={child} depth={depth + 1} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function SyllabusTree() {
  const { nodes, addNode } = useStore();
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const rootNodes = nodes.filter((n) => n.parentId === null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-bold">The Unbreakable Tree</h2>
          <p className="text-sm text-muted-foreground mt-1">Infinite nesting with inline quick add and deep edit side-panel support.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddingRoot(true)}
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary/10 px-4 text-primary transition-colors hover:bg-primary/20"
        >
          <Plus size={18} />
        </button>
      </div>

      {isAddingRoot && (
        <div className="mb-2 px-2">
          <input
            autoFocus
            className="w-full bg-transparent border-b border-primary px-2 py-2 text-sm outline-none"
            placeholder="Create a top-level section..."
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                const value = event.currentTarget.value.trim();
                if (value) {
                  addNode({ title: value, parentId: null, type: 'subject' });
                }
                setIsAddingRoot(false);
              }
              if (event.key === 'Escape') {
                setIsAddingRoot(false);
              }
            }}
          />
        </div>
      )}

      <div className="space-y-2">
        {rootNodes.map((node) => (
          <TreeNode key={node.id} node={node} depth={0} />
        ))}
      </div>

      <NodeInspector />
    </div>
  );
}

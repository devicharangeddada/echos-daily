import { useState } from 'react';
import { useStore, InfiniteNode } from '@/store/useStore';
import { ChevronRight, ChevronDown, Plus, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NodeItem = ({ node, depth = 0 }: { node: InfiniteNode; depth: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { nodes, addNode, setSelectedNodeId } = useStore();
  const children = nodes.filter((n) => n.parentId === node.id);

  return (
    <div className="mb-1">
      <div
        className="group apple-glass flex items-center gap-3 p-3 rounded-2xl hover:bg-foreground/5 transition-all cursor-pointer"
        style={{ marginLeft: `${depth * 1.5}rem` }}
        onClick={() => setSelectedNodeId(node.id)}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary transition-colors"
        >
          {children.length > 0 ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <div className="w-4" />}
        </button>
        <span className="flex-1 text-sm font-semibold">{node.title}</span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAdding(true);
            }}
            className="p-1 hover:bg-primary/20 rounded-lg"
          >
            <Plus size={14} className="text-primary" />
          </button>
          <MoreHorizontal size={14} className="text-muted-foreground" />
        </div>
      </div>

      {isAdding && (
        <div className="ml-8 mt-2 mb-2">
          <input
            autoFocus
            className="bg-transparent border-b border-primary text-sm w-full outline-none"
            placeholder="Name this section..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addNode({ title: e.currentTarget.value, parentId: node.id });
                setIsAdding(false);
              }
            }}
          />
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children.map((child) => (
              <NodeItem key={child.id} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
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
          <NodeItem key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}

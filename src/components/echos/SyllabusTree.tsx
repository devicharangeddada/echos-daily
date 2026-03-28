import { useState } from 'react';
import { useStore, SyllabusNode } from '@/store/useStore';
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

const NodeItem = ({ node, depth = 0 }: { node: SyllabusNode; depth: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { nodes, tasks } = useStore();

  const children = nodes.filter((n) => n.parentId === node.id);
  const nodeTasks = tasks.filter((t) => t.nodeId === node.id);
  const hasContent = children.length > 0 || nodeTasks.length > 0;

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => set        onClick={() => set        onClick={() => set        onClick={() => set        onClick={() => set        onClick={() => set        onClick={() => set        onClick={() => set        onClick={() => set        onClick={() => set    >
        {hasContent ? (
          isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        ) : (
          <div className="w-4" />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold tracking-tight">{node.title}</span>
            <span className="text-[10px] font-bold opacity-50 uppercase">{node.type}</span>
          </div>
          <Progress value={node.progress} className="h-1 bg-secondary" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {children.map((child) => (
              <NodeItem key={child.id} node={child} depth={depth + 1} />
            ))}
            {nodeTasks.map((task) => (
              <div
                key={task.id}
                className="ml-12 p-2 text-xs text-muted-foreground border-l border-border mt-1"
              >
                • {task.title} ({task.type})
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function SyllabusTree() {
  const { nodes } = useStore();
  const subjects = nodes.filter((n) => n.type === 'subject');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold">Knowledge Vault</h2>
        <button className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
          <Plus size={20} />
        </button>
      </div>
      <div className="space-y-2">
        {subjects.map((subject) => (
          <NodeItem key={subject.id} node={subject} depth={0} />
        ))}
      </div>
    </div>
  );
}

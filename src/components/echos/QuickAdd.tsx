import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { echosTransition } from '@/lib/motion';
import { useStore } from '@/store/useStore';

const QuickAdd = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const addTask = useStore((s) => s.addTask);
  const selectedDate = useStore((s) => s.selectedDate);

  const handleSubmit = () => {
    if (!title.trim()) return;
    addTask({ title: title.trim(), time: null, date: selectedDate, category: 'personal', subcategory: 'Quick' });
    setTitle('');
    setIsOpen(false);
  };

  return (
    <div className="glass-card overflow-hidden">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: echosTransition }}
            exit={{ opacity: 0, transition: echosTransition }}
            onClick={() => setIsOpen(true)}
            className="flex w-full items-center gap-3 px-5 py-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[15px] font-medium">Add a task…</span>
          </motion.button>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, height: 56 }}
            animate={{ opacity: 1, height: 'auto', transition: echosTransition }}
            exit={{ opacity: 0, height: 56, transition: echosTransition }}
            className="p-4"
          >
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
                if (e.key === 'Escape') { setIsOpen(false); setTitle(''); }
              }}
              placeholder="What needs to be done?"
              className="w-full bg-transparent text-[15px] font-medium text-foreground placeholder:text-muted-foreground outline-none"
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => { setIsOpen(false); setTitle(''); }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickAdd;

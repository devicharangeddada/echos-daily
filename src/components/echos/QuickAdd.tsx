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

  const isDesktop = window.innerWidth > 768;

  if (isDesktop) {
    // Desktop version - inline at top of task list
    return (
      <div className="w-full rounded-[2rem] p-5 md:p-6 shadow-sm border border-border/50 bg-card/50 backdrop-blur-md overflow-hidden">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.button
              key="trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: echosTransition }}
              exit={{ opacity: 0, transition: echosTransition }}
              onClick={() => setIsOpen(true)}
              className="flex w-full items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
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
  }

  // Mobile version - FAB
  return (
    <>
      <motion.button
        className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-foreground text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm rounded-[2rem] p-6 shadow-sm border border-border/50 bg-card/50 backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
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
              <div className="mt-4 flex items-center justify-end gap-2">
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickAdd;

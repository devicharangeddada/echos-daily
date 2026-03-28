import { Command } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigationState } from '@/hooks/use-navigation-state';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { tasks, nodes } = useStore((state) => ({ tasks: state.tasks, nodes: state.nodes }));
  const { setActiveTab } = useNavigationState();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  const taskSuggestions = tasks.slice(0, 5);
  const nodeSuggestions = nodes.slice(0, 5);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-md">
      <div className="w-full max-w-xl apple-glass rounded-3xl overflow-hidden shadow-2xl scale-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Command className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            placeholder="Find tasks or settings..."
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="p-2 max-h-96 overflow-y-auto">
          <p className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-bold">Tasks</p>
          {taskSuggestions.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => setActiveTab('education')}
              className="w-full text-left px-4 py-3 rounded-3xl hover:bg-foreground/10 transition-colors"
            >
              <p className="font-semibold">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.type} · {task.estimatedMinutes} min</p>
            </button>
          ))}
          <p className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-bold">Syllabus</p>
          {nodeSuggestions.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => setActiveTab('syllabus')}
              className="w-full text-left px-4 py-3 rounded-3xl hover:bg-foreground/10 transition-colors"
            >
              <p className="font-semibold">{node.title}</p>
              <p className="text-xs text-muted-foreground">{node.type} · {node.progress}% mastery</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { hoverLift, fadeInUp, echosTransition } from '@/lib/motion';
import type { Task } from '@/store/useStore';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  isMissed?: boolean;
}

const categoryColors: Record<Task['category'], string> = {
  work: 'bg-accent/10 text-accent',
  personal: 'bg-orange-500/10 text-orange-500',
  health: 'bg-emerald-500/10 text-emerald-500',
  learning: 'bg-violet-500/10 text-violet-500',
  education: 'bg-violet-500/10 text-violet-500',
};

const TaskCard = ({ task, onToggle, isMissed }: TaskCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const success  const success  const success  const success  const success  const success  const success  const success  const success  const success  const success  ctype = 'triangle';
      osc.frequency.value = 660;
      gain.gain.value = 0.09;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  };

  return (
    <motion.div
      layout
      {...fadeInUp}
      {...hoverLift}
      className={`group relative apple-glass p-5 rounded-[2.5rem] transition-all hover:scale-[1.01] ${task.completed ? 'opacity-60' : ''}`}
      onClick={() => {
        onToggle(task.id);
        if (!task.completed) successChime();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowDetails((current) => !current);
      }}
    >
      <div className="flex items-start gap-4">
        <Checkbox checked={task.completed} onCheckedChange={() => onToggle(task.id)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">{task.title}</h3>
              {task.quickNotes && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{task.quickNotes}</p>
              )}
            </div>
            <span className={`text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full uppercase font-bold`}>{task.category}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.24em] font-semibold text-muted-foreground">
            <span className="rounded-full bg-secondary/10 px-3 py-1 text-foreground">{task.type}</span>
            <span className="rounded-full bg-secondary/10 px-3 py-1 text-foreground">{task.estimatedMinutes} min</span>
            {task.dueDate && <span className="rounded-full bg-secondary/10 px-3 py-1 text-foreground">Due {task.dueDate}</span>}
          </div>
        </div>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-white/10 space-y-3"
        >
          <p className="text-[10px] font-medium uppercase opacity-70">Detailed Notes</p>
          <p className="text-sm text-foreground">{task.notes || 'No additional description added.'}</p>
          <div className="flex flex-wrap gap-2">
            <button className="text-[10px] bg-secondary px-3 py-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors">
              Delete
            </button>
            <button className="text-[10px] bg-secondary px-3 py-2 rounded-xl hover:bg-secondary/80 transition-colors">
              Edit Time
            </button>
          </div>
        </motion.div>
      )}

      {task.time && (
        <div className="absolute right-5 top-5 flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{task.time}</span>
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;

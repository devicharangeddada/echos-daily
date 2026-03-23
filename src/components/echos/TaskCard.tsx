import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { hoverLift, fadeInUp, echosTransition } from '@/lib/motion';
import type { Task } from '@/store/useStore';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  isMissed?: boolean;
}

const categoryColors: Record<Task['category'], string> = {
  work: 'bg-accent/10 text-accent',
  personal: 'bg-orange-500/10 text-orange-600',
  health: 'bg-emerald-500/10 text-emerald-600',
  learning: 'bg-violet-500/10 text-violet-600',
};

const TaskCard = ({ task, onToggle, isMissed }: TaskCardProps) => {
  const successChime = () => {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 660;
    gain.gain.value = 0.09;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.stop(ctx.currentTime + 0.18);
  };

  return (
    <motion.div
      layout
      {...fadeInUp}
      {...hoverLift}
      className={`glass-card flex items-center gap-4 px-5 py-4 cursor-pointer select-none ${
        task.completed ? 'opacity-50' : ''
      }`}
      onClick={() => {
        onToggle(task.id);
        if (!task.completed) {
          successChime();
        }
      }}
    >
      <motion.div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.completed
            ? 'border-foreground bg-foreground'
            : 'border-border'
        }`}
        animate={task.completed ? { scale: [1, 1.2, 1] } : {}}
        transition={echosTransition}
      >
        {task.completed && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
      </motion.div>

      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-medium leading-tight ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${categoryColors[task.category]}`}>
            {task.subcategory}
          </span>
          {isMissed && !task.completed && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive">
              Missed
            </span>
          )}
        </div>
      </div>

      {task.time && (
        <div className="flex items-center gap-1 text-muted-foreground shrink-0">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{task.time}</span>
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;

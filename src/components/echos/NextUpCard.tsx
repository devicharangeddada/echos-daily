import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { hoverLift, fadeInUp } from '@/lib/motion';
import type { Task } from '@/store/useStore';

interface NextUpCardProps {
  task: Task | null;
}

const NextUpCard = ({ task }: NextUpCardProps) => {
  if (!task) return null;

  return (
    <motion.div
      {...fadeInUp}
      {...hoverLift}
      className="rounded-2xl bg-foreground p-5 text-primary-foreground shadow-xl shadow-primary/10"
    >
      <div className="flex items-center gap-2 text-primary-foreground/60">
        <Zap className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-widest">Next Up</span>
      </div>
      <h3 className="mt-2 text-lg font-semibold tracking-tight">{task.title}</h3>
      <div className="mt-1 flex items-center gap-2">
        {task.time && (
          <span className="text-sm font-medium text-primary-foreground/70">{task.time}</span>
        )}
        <span className="text-sm text-primary-foreground/50">·</span>
        <span className="text-sm text-primary-foreground/50">{task.subcategory}</span>
      </div>
    </motion.div>
  );
};

export default NextUpCard;

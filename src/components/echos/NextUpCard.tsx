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
      className="w-full rounded-[2rem] p-5 md:p-6 shadow-sm border border-border/50 bg-card/50 backdrop-blur-md"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Zap className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-widest">Next Up</span>
      </div>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">{task.title}</h3>
      <div className="mt-1 flex items-center gap-2">
        {task.time && (
          <span className="text-sm font-medium text-muted-foreground">{task.time}</span>
        )}
        <span className="text-sm text-muted-foreground">·</span>
        <span className="text-sm text-muted-foreground">{task.subcategory}</span>
      </div>
    </motion.div>
  );
};

export default NextUpCard;

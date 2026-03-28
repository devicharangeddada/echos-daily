import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Flame, Zap, Target, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion';

export default function TodayScreen() {
  const { nodes, streak, level, xp } = useStore();

  const priorityNodes = useMemo(() => {
    return [...nodes]
      .filter((n) => n.status === 'failed' || n.weightage > 7)
      .sort((a, b) => b.failureCount * b.weightage - a.failureCount * a.weightage)
      .slice(0, 5);
  }, [nodes]);

  return (
    <div className="space-y-8 pb-32">
      <header className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="apple-glass p-6 rounded-[2.5rem] flex flex-col items-center">
          <Flame className="text-orange-500 mb-2" />
          <span className="text-2xl font-bold">{streak}</span>
          <p className="text-[10px] uppercase font-bold opacity-40">Streak</p>
        </div>
        <div className="apple-glass p-6 rounded-[2.5rem] flex flex-col items-center">
          <Zap className="text-emerald-500 mb-2" />
          <span className="text-2xl font-bold">{xp}</span>
          <p className="text-[10px] uppercase font-bold opacity-40">XP</p>
        </div>
        <div className="apple-glass p-6 rounded-[2.5rem] flex flex-col items-center">
          <Target className="text-sky-500 mb-2" />
          <span className="text-2xl font-bold">{level}</span>
          <p className="text-[10px] uppercase font-bold opacity-40">Level</p>
        </div>
        <div className="apple-glass p-6 rounded-[2.5rem] flex flex-col items-center">
          <Clock className="text-violet-500 mb-2" />
          <span className="text-2xl font-bold">{priorityNodes.length}</span>
          <p className="text-[10px] uppercase font-bold opacity-40">Priority Hits</p>
        </div>
      </header>

      <motion.section {...fadeInUp} className="space-y-4">
        <h2 className="text-xl font-bold px-2">System Flow: Weakness Resolution</h2>
        <div className="space-y-3">
          {priorityNodes.map((node) => (
            <div key={node.id} className="apple-glass p-5 rounded-[2.5rem] flex items-center justify-between border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-4">
                <AlertCircle className="text-red-500" />
                <div>
                  <h3 className="font-semibold">{node.title}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase">Failed {node.failureCount} times</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-foreground text-background rounded-full text-xs font-bold">Retry Focus</button>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

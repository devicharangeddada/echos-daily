import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import NextUpCard from './NextUpCard';
import TaskCard from './TaskCard';
import QuickAdd from './QuickAdd';

const getTimeGroup = (time: string | null): 'Morning' | 'Afternoon' | 'Evening' | 'Unscheduled' => {
  if (!time) return 'Unscheduled';
  const hour = parseInt(time.split(':')[0], 10);
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

const now = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const TodayScreen = () => {
  const tasks = useStore((s) => s.tasks);
  const toggleTask = useStore((s) => s.toggleTask);

  const currentMinutes = now();

  const nextUp = useMemo(() => {
    return tasks
      .filter((t) => !t.completed && t.time && timeToMinutes(t.time) >= currentMinutes)
      .sort((a, b) => timeToMinutes(a.time!) - timeToMinutes(b.time!))[0] || null;
  }, [tasks, currentMinutes]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof tasks> = { Morning: [], Afternoon: [], Evening: [], Unscheduled: [] };
    tasks.forEach((t) => {
      groups[getTimeGroup(t.time)].push(t);
    });
    // Sort timed tasks within each group
    ['Morning', 'Afternoon', 'Evening'].forEach((g) => {
      groups[g].sort((a, b) => timeToMinutes(a.time!) - timeToMinutes(b.time!));
    });
    return groups;
  }, [tasks]);

  const date = new Date();
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const groupOrder = ['Morning', 'Afternoon', 'Evening', 'Unscheduled'];

  return (
    <div className="mx-auto max-w-lg px-5 pb-28 pt-14">
      {/* Header */}
      <motion.div {...fadeInUp} className="mb-8">
        <p className="text-subhead uppercase tracking-widest">{dateStr}</p>
        <h1 className="text-headline mt-1">Today</h1>
      </motion.div>

      {/* Next Up */}
      <div className="mb-6">
        <NextUpCard task={nextUp} />
      </div>

      {/* Task Groups */}
      <motion.div {...staggerContainer} className="space-y-8">
        {groupOrder.map((group) => {
          const groupTasks = grouped[group];
          if (groupTasks.length === 0) return null;
          return (
            <motion.section key={group} {...fadeInUp}>
              <h2 className="text-caption mb-3 uppercase tracking-widest">{group}</h2>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {groupTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      isMissed={!!task.time && timeToMinutes(task.time) < currentMinutes}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          );
        })}
      </motion.div>

      {/* Quick Add */}
      <div className="mt-6">
        <QuickAdd />
      </div>
    </div>
  );
};

export default TodayScreen;

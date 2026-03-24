import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import NextUpCard from './NextUpCard';
import TaskCard from './TaskCard';
import QuickAdd from './QuickAdd';
import WeeklyStrip from './WeeklyStrip';

const getTimeGroup = (time: string | null): 'Morning' | 'Afternoon' | 'Evening' | 'Unscheduled' => {
  if (!time) return 'Unscheduled';
  const hour = parseInt(time.split(':')[0], 10);
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  return 'Evening';
};

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const TodayScreen = () => {
  const tasks = useStore((s) => s.tasks);
  const toggleTask = useStore((s) => s.toggleTask);
  const selectedDate = useStore((s) => s.selectedDate);

  const today = toDateStr(new Date());
  const isToday = selectedDate === today;
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => (t.date || today) === selectedDate);
  }, [tasks, selectedDate, today]);

  const nextUp = useMemo(() => {
    if (!isToday) return null;
    return filteredTasks
      .filter((t) => !t.completed && t.time && timeToMinutes(t.time) >= nowMinutes)
      .sort((a, b) => timeToMinutes(a.time!) - timeToMinutes(b.time!))[0] || null;
  }, [filteredTasks, nowMinutes, isToday]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredTasks> = { Morning: [], Afternoon: [], Evening: [], Unscheduled: [] };
    filteredTasks.forEach((t) => groups[getTimeGroup(t.time)].push(t));
    ['Morning', 'Afternoon', 'Evening'].forEach((g) => {
      groups[g].sort((a, b) => timeToMinutes(a.time!) - timeToMinutes(b.time!));
    });
    return groups;
  }, [filteredTasks]);

  const displayDate = new Date(selectedDate + 'T12:00:00');
  const dateStr = displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const groupOrder = ['Morning', 'Afternoon', 'Evening', 'Unscheduled'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div {...fadeInUp} className="mb-6">
        <p className="text-subhead uppercase tracking-widest">{dateStr}</p>
        <h1 className="text-headline mt-1">{isToday ? 'Today' : displayDate.toLocaleDateString('en-US', { weekday: 'long' })}</h1>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Tasks */}
        <div className="space-y-6">
          {/* Weekly Strip */}
          <motion.div {...fadeInUp}>
            <WeeklyStrip />
          </motion.div>

          {/* Next Up */}
          {nextUp && (
            <motion.div {...fadeInUp}>
              <NextUpCard task={nextUp} />
            </motion.div>
          )}

          {/* Task Groups */}
          <motion.div {...staggerContainer} className="space-y-6">
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
                          isMissed={isToday && !!task.time && timeToMinutes(task.time) < nowMinutes}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.section>
              );
            })}
          </motion.div>

          {/* Quick Add */}
          <motion.div {...fadeInUp}>
            <QuickAdd />
          </motion.div>
        </div>

        {/* Right Column - Progress & Stats (Desktop only) */}
        <div className="hidden lg:block space-y-6">
          {/* Progress Overview */}
          <motion.div {...fadeInUp} className="glass-card p-6">
            <h3 className="text-subhead mb-4">Progress Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                <span className="text-sm font-medium">{filteredTasks.filter(t => t.completed).length}/{filteredTasks.length}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-300" 
                  style={{ width: `${filteredTasks.length > 0 ? (filteredTasks.filter(t => t.completed).length / filteredTasks.length) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </motion.div>

          {/* Streak & Level */}
          <motion.div {...fadeInUp} className="glass-card p-6">
            <h3 className="text-subhead mb-4">Achievements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{useStore.getState().streak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{useStore.getState().level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
            </div>
          </motion.div>

          {/* Exam Countdown */}
          <motion.div {...fadeInUp} className="glass-card p-6">
            <h3 className="text-subhead mb-4">Exam Countdown</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive">{Math.max(0, new Date(useStore.getState().examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24) | 0}</div>
              <div className="text-xs text-muted-foreground">Days Remaining</div>
            </div>
          </motion.div>
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <motion.div {...fadeInUp} className="glass-card p-8 text-center">
          <p className="text-muted-foreground text-sm">No tasks scheduled</p>
        </motion.div>
      )}
    </div>
  );
};

export default TodayScreen;

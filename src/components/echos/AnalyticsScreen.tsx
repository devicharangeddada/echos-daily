import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Flame, BarChart3 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fadeInUp, hoverLift } from '@/lib/motion';

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const AnalyticsScreen = () => {
  const { tasks, focusLogs, weeklyStats } = useStore();

  const last7Days = useMemo(() => {
    const days: { dateStr: string; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days.push({
        dateStr: toDateStr(d),
        label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
      });
    }
    return days;
  }, []);

  const completionData = useMemo(() => {
    return last7Days.map((day) => {
      const dayTasks = tasks.filter((t) => (t.date || toDateStr(new Date())) === day.dateStr);
      const completed = dayTasks.filter((t) => t.completed).length;
      return { ...day, completed, total: dayTasks.length };
    });
  }, [last7Days, tasks]);

  const focusData = useMemo(() => {
    return last7Days.map((day) => {
      const mins = focusLogs
        .filter((l) => l.date === day.dateStr)
        .reduce((sum, l) => sum + l.durationMinutes, 0);
      return { ...day, minutes: mins };
    });
  }, [last7Days, focusLogs]);

  const totalDeepWorkHours = useMemo(() => {
    const totalMins = focusLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
    return (totalMins / 60).toFixed(1);
  }, [focusLogs]);

  const totalCompleted = tasks.filter((t) => t.completed).length;
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const d = toDateStr(new Date(Date.now() - i * 86400000));
      const dayTasks = tasks.filter((t) => (t.date || toDateStr(new Date())) === d);
      if (dayTasks.length > 0 && dayTasks.some((t) => t.completed)) {
        count++;
      } else if (i > 0) break; // skip today if nothing yet
    }
    return count;
  }, [tasks]);

  const maxCompleted = Math.max(...completionData.map((d) => d.completed), 1);
  const maxFocus = Math.max(...focusData.map((d) => d.minutes), 1);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-28 pt-14">
      <motion.div {...fadeInUp} className="mb-8">
        <p className="text-subhead uppercase tracking-widest">Insights</p>
        <h1 className="text-headline mt-1">Analytics</h1>
      </motion.div>

      {/* Stats bento */}
      <motion.div {...fadeInUp} className="grid grid-cols-3 gap-3 mb-6">
        <motion.div {...hoverLift} className="glass-card p-4 flex flex-col items-center justify-center">
          <Clock className="h-4 w-4 text-muted-foreground mb-2" />
          <span className="text-2xl font-light text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{weeklyStats?.focusHours ?? totalDeepWorkHours}h</span>
          <span className="text-caption mt-0.5">Focus Hours</span>
        </motion.div>
        <motion.div {...hoverLift} className="glass-card p-4 flex flex-col items-center justify-center">
          <TrendingUp className="h-4 w-4 text-muted-foreground mb-2" />
          <span className="text-2xl font-light text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{weeklyStats?.tasksCompleted ?? totalCompleted}</span>
          <span className="text-caption mt-0.5">Tasks Completed</span>
        </motion.div>
        <motion.div {...hoverLift} className="glass-card p-4 flex flex-col items-center justify-center">
          <Flame className="h-4 w-4 text-muted-foreground mb-2" />
          <span className="text-2xl font-light text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{weeklyStats?.consistencyScore ?? streak}%</span>
          <span className="text-caption mt-0.5">Consistency Score</span>
        </motion.div>
      </motion.div>

      {/* Consistency chart */}
      <motion.div {...fadeInUp} className="glass-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-caption uppercase tracking-widest">Consistency — Last 7 Days</h2>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {completionData.map((d) => (
            <div key={d.dateStr} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full flex items-end justify-center h-24">
                <motion.div
                  className="w-full max-w-[32px] rounded-lg bg-foreground/15"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((d.completed / maxCompleted) * 100, 4)}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <motion.div
                    className="w-full rounded-lg bg-foreground"
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  />
                </motion.div>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">{d.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Focus volume chart */}
      <motion.div {...fadeInUp} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-caption uppercase tracking-widest">Focus Volume</h2>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {focusData.map((d) => (
            <div key={d.dateStr} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full flex items-end justify-center h-24">
                <motion.div
                  className="w-full max-w-[32px] rounded-lg bg-accent"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((d.minutes / maxFocus) * 100, 4)}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
              </div>
              <div className="text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">{d.label}</span>
                {d.minutes > 0 && (
                  <span className="text-[9px] text-muted-foreground">{d.minutes}m</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsScreen;

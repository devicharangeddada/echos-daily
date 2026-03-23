import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { echosTransition } from '@/lib/motion';

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const WeeklyStrip = () => {
  const { selectedDate, setSelectedDate, tasks } = useStore();
  const today = new Date();
  const todayStr = toDateStr(today);

  const days = useMemo(() => {
    const result: { date: Date; dateStr: string; label: string; dayNum: number }[] = [];
    // Show 3 days before and 3 after today
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push({
        date: d,
        dateStr: toDateStr(d),
        label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
        dayNum: d.getDate(),
      });
    }
    return result;
  }, []);

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      const d = t.date || todayStr;
      counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [tasks, todayStr]);

  return (
    <div className="flex items-center justify-between gap-1">
      {days.map((d) => {
        const isSelected = d.dateStr === selectedDate;
        const isToday = d.dateStr === todayStr;
        const count = taskCounts[d.dateStr] || 0;

        return (
          <motion.button
            key={d.dateStr}
            onClick={() => setSelectedDate(d.dateStr)}
            whileTap={{ scale: 0.92, transition: echosTransition }}
            className={`relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2.5 transition-colors flex-1 ${
              isSelected
                ? 'bg-foreground text-primary-foreground'
                : isToday
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase">{d.label}</span>
            <span className="text-lg font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>{d.dayNum}</span>
            {count > 0 && !isSelected && (
              <div className="absolute bottom-1.5 h-1 w-1 rounded-full bg-accent" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default WeeklyStrip;

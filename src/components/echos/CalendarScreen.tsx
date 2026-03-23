import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fadeInUp, hoverLift, echosTransition } from '@/lib/motion';
import TaskCard from './TaskCard';

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const getTimeGroup = (time: string | null): string => {
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

const CalendarScreen = () => {
  const { tasks, toggleTask, selectedDate, setSelectedDate } = useStore();

  const viewDate = new Date(selectedDate + 'T12:00:00');
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  const today = toDateStr(new Date());
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDow, daysInMonth]);

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setSelectedDate(toDateStr(d));
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setSelectedDate(toDateStr(d));
  };

  const filteredTasks = tasks.filter((t) => (t.date || today) === selectedDate);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredTasks> = { Morning: [], Afternoon: [], Evening: [], Unscheduled: [] };
    filteredTasks.forEach((t) => groups[getTimeGroup(t.time)].push(t));
    ['Morning', 'Afternoon', 'Evening'].forEach((g) => {
      groups[g].sort((a, b) => timeToMinutes(a.time!) - timeToMinutes(b.time!));
    });
    return groups;
  }, [filteredTasks]);

  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Count tasks per day for dots
  const taskCountByDay = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      const d = t.date || today;
      counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [tasks, today]);

  return (
    <div className="mx-auto max-w-lg px-5 pb-28 pt-14">
      <motion.div {...fadeInUp} className="mb-6">
        <p className="text-subhead uppercase tracking-widest">Schedule</p>
        <h1 className="text-headline mt-1">Calendar</h1>
      </motion.div>

      {/* Month grid */}
      <motion.div {...fadeInUp} className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <motion.button {...hoverLift} onClick={prevMonth} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </motion.button>
          <span className="text-sm font-semibold text-foreground">{monthName}</span>
          <motion.button {...hoverLift} onClick={nextMonth} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={i} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today;
            const hasTask = (taskCountByDay[dateStr] || 0) > 0;

            return (
              <motion.button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                whileTap={{ scale: 0.9, transition: echosTransition }}
                className={`relative flex flex-col items-center justify-center rounded-xl py-2 text-sm transition-colors ${
                  isSelected
                    ? 'bg-foreground text-primary-foreground font-semibold'
                    : isToday
                    ? 'bg-secondary text-foreground font-medium'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {day}
                {hasTask && !isSelected && (
                  <div className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Filtered tasks */}
      {filteredTasks.length === 0 ? (
        <motion.div {...fadeInUp} className="glass-card p-8 text-center">
          <p className="text-muted-foreground text-sm">No tasks for this day</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {['Morning', 'Afternoon', 'Evening', 'Unscheduled'].map((group) => {
            const groupTasks = grouped[group];
            if (groupTasks.length === 0) return null;
            return (
              <motion.section key={group} {...fadeInUp}>
                <h2 className="text-caption mb-3 uppercase tracking-widest">{group}</h2>
                <div className="space-y-2">
                  {groupTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      isMissed={selectedDate === today && !!task.time && timeToMinutes(task.time) < nowMinutes}
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarScreen;

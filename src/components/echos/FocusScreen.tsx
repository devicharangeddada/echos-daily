import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fadeInUp, echosTransition, hoverLift } from '@/lib/motion';

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const FocusScreen = () => {
  const { focusSession, setFocusSession, tasks, addFocusLog, toggleTask } = useStore();
  const [showPicker, setShowPicker] = useState(false);

  const { isActive, timeLeft, mode, assignedTaskId } = focusSession;
  const assignedTask = tasks.find((t) => t.id === assignedTaskId) || null;
  const incompleteTasks = tasks.filter((t) => !t.completed);

  // Timer tick
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    const id = setInterval(() => {
      setFocusSession({ timeLeft: timeLeft - 1 });
    }, 1000);
    return () => clearInterval(id);
  }, [isActive, timeLeft, setFocusSession]);

  // Session complete
  useEffect(() => {
    if (timeLeft <= 0 && isActive) {
      if (mode === 'work') {
        addFocusLog({
          date: new Date().toISOString().split('T')[0],
          durationMinutes: WORK_DURATION / 60,
          taskId: assignedTaskId,
        });
        if (assignedTask && !assignedTask.completed) {
          toggleTask(assignedTask.id);
        }
        setFocusSession({ isActive: false, timeLeft: BREAK_DURATION, mode: 'break' });
      } else {
        setFocusSession({ isActive: false, timeLeft: WORK_DURATION, mode: 'work' });
      }
    }
  }, [timeLeft, isActive, mode, assignedTaskId, assignedTask, setFocusSession, addFocusLog, toggleTask]);

  const toggle = useCallback(() => {
    setFocusSession({ isActive: !isActive });
  }, [isActive, setFocusSession]);

  const reset = useCallback(() => {
    setFocusSession({
      isActive: false,
      timeLeft: mode === 'work' ? WORK_DURATION : BREAK_DURATION,
    });
  }, [mode, setFocusSession]);

  const progress = mode === 'work'
    ? 1 - timeLeft / WORK_DURATION
    : 1 - timeLeft / BREAK_DURATION;

  const circumference = 2 * Math.PI * 120;

  return (
    <>
      {/* Zen Mode Overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          >
            {/* Breathing background */}
            <motion.div
              className="absolute inset-0 bg-background"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 flex flex-col items-center">
              {/* Mode label */}
              <motion.p {...fadeInUp} className="text-caption mb-8 uppercase tracking-[0.3em]">
                {mode === 'work' ? 'Deep Focus' : 'Break Time'}
              </motion.p>

              {/* Ring + Timer */}
              <motion.div {...fadeInUp} className="relative mb-10">
                <svg width="280" height="280" className="rotate-[-90deg]">
                  <circle cx="140" cy="140" r="120" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
                  <motion.circle
                    cx="140" cy="140" r="120" fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: circumference * (1 - progress) }}
                    transition={echosTransition}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-light tracking-tight text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatTime(timeLeft)}
                  </span>
                  {assignedTask && (
                    <span className="mt-2 max-w-[200px] truncate text-center text-sm text-muted-foreground">
                      {assignedTask.title}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <motion.button {...hoverLift} onClick={reset} className="rounded-full p-3 text-muted-foreground hover:text-foreground transition-colors">
                  <RotateCcw className="h-5 w-5" />
                </motion.button>
                <motion.button
                  {...hoverLift}
                  onClick={toggle}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-primary-foreground"
                >
                  <Pause className="h-6 w-6" />
                </motion.button>
                <motion.button {...hoverLift} onClick={() => { reset(); setFocusSession({ isActive: false }); }}
                  className="rounded-full p-3 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-zen UI */}
      <div className="mx-auto max-w-lg px-5 pb-28 pt-14">
        <motion.div {...fadeInUp} className="mb-8">
          <p className="text-subhead uppercase tracking-widest">Deep Work</p>
          <h1 className="text-headline mt-1">Focus</h1>
        </motion.div>

        {/* Timer card */}
        <motion.div {...fadeInUp} className="glass-card p-8 flex flex-col items-center mb-6">
          <p className="text-caption uppercase tracking-[0.2em] mb-6">
            {mode === 'work' ? '25 min session' : '5 min break'}
          </p>

          <div className="relative mb-8">
            <svg width="200" height="200" className="rotate-[-90deg]">
              <circle cx="100" cy="100" r="85" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
              <motion.circle
                cx="100" cy="100" r="85" fill="none"
                stroke="hsl(var(--foreground))"
                strokeWidth="2" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 85}
                animate={{ strokeDashoffset: 2 * Math.PI * 85 * (1 - progress) }}
                transition={echosTransition}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-light text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button {...hoverLift} onClick={reset} className="rounded-full p-3 text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="h-5 w-5" />
            </motion.button>
            <motion.button
              {...hoverLift}
              onClick={toggle}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-primary-foreground"
            >
              {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Assign task */}
        <motion.div {...fadeInUp} className="glass-card overflow-hidden">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex w-full items-center justify-between px-5 py-4"
          >
            <div>
              <p className="text-caption uppercase tracking-widest">Assigned Task</p>
              <p className="mt-1 text-[15px] font-medium text-foreground">
                {assignedTask ? assignedTask.title : 'None — tap to assign'}
              </p>
            </div>
            <motion.div animate={{ rotate: showPicker ? 180 : 0 }} transition={echosTransition}>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1, transition: echosTransition }}
                exit={{ height: 0, opacity: 0, transition: echosTransition }}
                className="border-t border-border"
              >
                <div className="max-h-48 overflow-y-auto p-2">
                  {assignedTaskId && (
                    <button
                      onClick={() => { setFocusSession({ assignedTaskId: null }); setShowPicker(false); }}
                      className="w-full rounded-xl px-4 py-3 text-left text-sm text-destructive hover:bg-secondary transition-colors"
                    >
                      Remove assignment
                    </button>
                  )}
                  {incompleteTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setFocusSession({ assignedTaskId: t.id }); setShowPicker(false); }}
                      className={`w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-secondary transition-colors ${
                        t.id === assignedTaskId ? 'bg-secondary font-medium' : 'text-foreground'
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default FocusScreen;

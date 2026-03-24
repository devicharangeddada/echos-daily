import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, ChevronDown, Check } from 'lucide-react';
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
  const {
    focusSession,
    activeSession,
    setFocusSession,
    setActiveSession,
    tasks,
    addFocusLog,
    addSessionToHistory,
    toggleTask,
    settings,
    xp,
  } = useStore();

  const [showPicker, setShowPicker] = useState(false);
  const [hum, setHum] = useState(false);
  const [whiteNoise, setWhiteNoise] = useState(false);
  const [brainDumpMode, setBrainDumpMode] = useState(false);
  const [brainDumpText, setBrainDumpText] = useState('');
  const [brainDumpTimeLeft, setBrainDumpTimeLeft] = useState(120); // 2 minutes
  const [brainDumpResults, setBrainDumpResults] = useState<string[]>([]);
  const tickRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(Date.now());

  const { isActive, timeLeft, mode, assignedTaskId } = focusSession;
  const assignedTask = tasks.find((t) => t.id === assignedTaskId) || null;
  const incompleteTasks = tasks.filter((t) => !t.completed);

  const startChime = useCallback(() => {
    if (!settings.sounds || typeof window === 'undefined' || !window.AudioContext) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 660;
      gain.gain.value = 0.1;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.stop(now + 0.25);
    } catch {
      // no-op
    }
  }, [settings.sounds]);

  useEffect(() => {
    if (hum) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 66;
      gain.gain.value = 0.015;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return () => {
        osc.stop();
        ctx.close();
      };
    }
    if (whiteNoise) {
      const ctx = new AudioContext();
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.025;
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      return () => {
        noise.stop();
        ctx.close();
      };
    }

    if (!isActive) {
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    lastTimestampRef.current = Date.now();
    tickRef.current = window.setInterval(() => {
      if (!focusSession.isActive) return;
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - lastTimestampRef.current) / 1000));
      if (diff > 0) {
        lastTimestampRef.current += diff * 1000;
        const remaining = Math.max(0, focusSession.timeLeft - diff);
        setFocusSession({ timeLeft: remaining, isActive: remaining > 0 });
        setActiveSession({ timeLeft: remaining, isPaused: false });
      }
    }, 250);

    return () => {
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [isActive, focusSession.isActive, focusSession.timeLeft, setFocusSession, setActiveSession]);

  useEffect(() => {
    if (timeLeft > 0 || !isActive) return;

    startChime();

    if (mode === 'work') {
      // Enter Brain Dump mode instead of completing immediately
      setBrainDumpMode(true);
      setBrainDumpTimeLeft(120);
      setBrainDumpText('');
      setBrainDumpResults([]);
      setFocusSession({ isActive: false });
      setActiveSession({ isPaused: true, startTime: null });
      return;
    }

    // For break mode, complete normally
    addFocusLog({
      date: new Date().toISOString().split('T')[0],
      durationMinutes: BREAK_DURATION / 60,
      taskId: assignedTaskId,
    });

    addSessionToHistory({
      date: new Date().toISOString().split('T')[0],
      duration: BREAK_DURATION / 60,
      taskId: assignedTaskId,
      completed: false,
    });

    setFocusSession({
      isActive: false,
      timeLeft: WORK_DURATION,
      mode: 'work',
    });

    setActiveSession({
      isPaused: true,
      timeLeft: WORK_DURATION,
      mode: 'work',
      startTime: null,
    });
  }, [timeLeft, isActive, mode, assignedTask, assignedTaskId, addFocusLog, addSessionToHistory, setFocusSession, setActiveSession, toggleTask, startChime]);

  // Brain Dump Timer
  useEffect(() => {
    if (!brainDumpMode || brainDumpTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setBrainDumpTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up, analyze recall
          analyzeBrainDump();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [brainDumpMode, brainDumpTimeLeft]);

  const analyzeBrainDump = useCallback(() => {
    if (!assignedTask) return;

    const originalText = (assignedTask.notes || '') + ' ' + (assignedTask.quickNotes || '');
    const recallText = brainDumpText.toLowerCase();
    const originalWords = originalText.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    const missedConcepts: string[] = [];
    originalWords.forEach(word => {
      if (!recallText.includes(word)) {
        missedConcepts.push(word);
      }
    });

    setBrainDumpResults(missedConcepts.slice(0, 10)); // Top 10 missed

    // Complete the session after analysis
    addFocusLog({
      date: new Date().toISOString().split('T')[0],
      durationMinutes: WORK_DURATION / 60,
      taskId: assignedTaskId,
    });

    addSessionToHistory({
      date: new Date().toISOString().split('T')[0],
      duration: WORK_DURATION / 60,
      taskId: assignedTaskId,
      completed: true,
    });

    if (assignedTask && !assignedTask.completed) {
      toggleTask(assignedTask.id);
    }

    setFocusSession({
      isActive: false,
      timeLeft: BREAK_DURATION,
      mode: 'break',
    });

    setActiveSession({
      isPaused: true,
      timeLeft: BREAK_DURATION,
      mode: 'break',
      startTime: null,
    });

    // Exit brain dump mode after a delay
    setTimeout(() => {
      setBrainDumpMode(false);
    }, 5000);
  }, [assignedTask, brainDumpText, addFocusLog, addSessionToHistory, setFocusSession, setActiveSession, toggleTask, assignedTaskId]);

  const toggle = useCallback(() => {
    if (!focusSession.isActive) {
      const now = Date.now();
      setActiveSession({
        taskId: assignedTaskId,
        startTime: now,
        isPaused: false,
        timeLeft: focusSession.timeLeft || WORK_DURATION,
        mode: focusSession.mode,
      });
      setFocusSession({ isActive: true });
    } else {
      setFocusSession({ isActive: false });
      setActiveSession({ isPaused: true, startTime: null });
    }
  }, [focusSession.isActive, focusSession.timeLeft, focusSession.mode, setActiveSession, setFocusSession, assignedTaskId]);

  const reset = useCallback(() => {
    const initial = focusSession.mode === 'work' ? WORK_DURATION : BREAK_DURATION;
    setFocusSession({ isActive: false, timeLeft: initial });
    setActiveSession({ isPaused: true, timeLeft: initial, startTime: null });
  }, [focusSession.mode, setActiveSession, setFocusSession]);

  const progress = focusSession.mode === 'work'
    ? 1 - focusSession.timeLeft / WORK_DURATION
    : 1 - focusSession.timeLeft / BREAK_DURATION;

  const deepWorkLevel = Math.min(8, Math.max(1, Math.floor(xp / 250) + 1));
  const cosmicHue = 220 + (deepWorkLevel * 4);
  const cosmicStyle = {
    background: `radial-gradient(circle at 50% 20%, hsla(${cosmicHue}, 100%, 65%, 0.22), transparent 50%), radial-gradient(circle at 70% 80%, hsla(${cosmicHue + 40}, 100%, 45%, 0.14), transparent 40%)`,
  };

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

      {/* Brain Dump Overlay */}
      <AnimatePresence>
        {brainDumpMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6"
          >
            <div className="w-full max-w-2xl">
              <motion.div {...fadeInUp} className="mb-6 text-center">
                <p className="text-caption uppercase tracking-[0.3em] mb-2">Brain Dump</p>
                <h2 className="text-headline">Recall Everything</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Type everything you remember from your study session. No peeking at notes!
                </p>
                <p className="text-2xl font-mono mt-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(brainDumpTimeLeft)}
                </p>
              </motion.div>

              <motion.textarea
                {...fadeInUp}
                value={brainDumpText}
                onChange={(e) => setBrainDumpText(e.target.value)}
                placeholder="Start typing your recall..."
                className="w-full h-64 p-4 glass-card resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />

              {brainDumpTimeLeft === 0 && brainDumpResults.length > 0 && (
                <motion.div {...fadeInUp} className="mt-6 p-4 glass-card">
                  <p className="text-caption uppercase tracking-widest mb-2">Key Concepts Missed</p>
                  <div className="flex flex-wrap gap-2">
                    {brainDumpResults.map((concept, i) => (
                      <span key={i} className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm">
                        {concept}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {brainDumpTimeLeft === 0 && (
                <motion.button
                  {...hoverLift}
                  onClick={() => setBrainDumpMode(false)}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 glass-card hover:bg-accent/10 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Continue
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-zen UI */}
      <div className="mx-auto max-w-2xl px-5 pb-28 pt-14" style={cosmicStyle}>
        <motion.div {...fadeInUp} className="mb-8">
          <p className="text-subhead uppercase tracking-widest">Deep Work</p>
          <h1 className="text-headline mt-1">Focus</h1>
          <p className="text-xs text-muted-foreground mt-1">Deep Work Level: {deepWorkLevel} / 8</p>
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

        <motion.div {...fadeInUp} className="glass-card p-4 mb-6 rounded-[2rem] bg-black/40 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Audio Ambience</span>
            <div className="flex gap-2">
              <button
                onClick={() => setHum((v) => !v)}
                className={`rounded-full px-3 py-1 text-xs ${hum ? 'bg-accent text-foreground dark:text-white' : 'bg-white/10 dark:bg-white/20 text-foreground dark:text-white'}`}
              >Transformer Hum</button>
              <button
                onClick={() => setWhiteNoise((v) => !v)}
                className={`rounded-full px-3 py-1 text-xs ${whiteNoise ? 'bg-accent text-foreground dark:text-white' : 'bg-white/10 dark:bg-white/20 text-foreground dark:text-white'}`}
              >White Noise</button>
            </div>
          </div>
        </motion.div>

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

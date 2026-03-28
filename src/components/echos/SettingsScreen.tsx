import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Monitor, Volume2, VolumeX, Bell, BellOff, Clock, Timer,
  Zap, Sparkles, ChevronRight, Play, RotateCcw, Eye, Vibrate, LayoutGrid,
} from 'lucide-react';
import { useStore, Settings, SoundSettings, ReminderSettings } from '@/store/useStore';
import { fadeInUp, hoverLift, echosTransition } from '@/lib/motion';
import { playSound, previewAllSounds } from '@/lib/sounds';

const defaultSettings: Settings = {
  timeFormat: '24h',
  focusDuration: 25,
  sounds: false,
  theme: 'dark',
  soundSettings: {
    enabled: false,
    volume: 0.5,
    taskComplete: false,
    focusStart: false,
    focusEnd: false,
    levelUp: false,
    streakMilestone: false,
    uiClick: false,
  },
  reminders: {
    taskReminders: false,
    focusReminders: false,
    revisionReminders: false,
    reminderMinutesBefore: 15,
  },
  pomodoroWork: 25,
  pomodoroBreak: 5,
  autoStartBreak: false,
  showXPAnimations: true,
  hapticFeedback: true,
  compactMode: false,
};

const SettingsScreen = () => {
  const hasHydrated = useStore.persist.hasHydrated();
  const { settings: rawSettings, updateSettings } = useStore();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-2xl px-3 sm:px-5 pb-28 pt-10 sm:pt-14 space-y-4">
        <div className="h-10 w-48 rounded-2xl bg-muted/20 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full rounded-3xl bg-muted/15 animate-pulse" />
        ))}
      </div>
    );
  }

  const settings: Settings = {
    ...defaultSettings,
    ...rawSettings,
    soundSettings: {
      ...defaultSettings.soundSettings,
      ...rawSettings?.soundSettings,
    },
    reminders: {
      ...defaultSettings.reminders,
      ...rawSettings?.reminders,
    },
  };

  const toggleSection = (id: string) => setExpandedSection(expandedSection === id ? null : id);

  const updateSoundSetting = (key: keyof SoundSettings, value: any) => {
    updateSettings({
      soundSettings: { ...settings.soundSettings, [key]: value },
    });
  };

  const updateReminderSetting = (key: keyof ReminderSettings, value: any) => {
    updateSettings({
      reminders: { ...settings.reminders, [key]: value },
    });
  };

  const applyTheme = (theme: Settings['theme']) => {
    updateSettings({ theme });
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light-theme');
    } else if (theme === 'dark') {
      root.classList.remove('light-theme');
      root.classList.add('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light-theme');
      } else {
        root.classList.remove('dark');
        root.classList.add('light-theme');
      }
    }
  };

  const Section = ({
    id, icon: Icon, title, subtitle, children,
  }: {
    id: string; icon: any; title: string; subtitle: string; children: React.ReactNode;
  }) => {
    const isOpen = expandedSection === id;
    return (
      <motion.div layout className="glass-card overflow-hidden">
        <motion.button
          onClick={() => toggleSection(id)}
          className="flex w-full items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15">
            <Icon className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{title}</p>
            <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
          </div>
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={echosTransition}>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </motion.div>
        </motion.button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1, transition: echosTransition }}
              exit={{ height: 0, opacity: 0, transition: echosTransition }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-4 sm:p-5 space-y-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const Toggle = ({ label, value, onChange, description }: {
    label: string; value: boolean; onChange: (v: boolean) => void; description?: string;
  }) => (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{label}</p>
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      </div>
      <motion.button
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${value ? 'bg-accent' : 'bg-secondary'}`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-0.5 h-6 w-6 rounded-full bg-card shadow-md"
          animate={{ left: value ? 22 : 2 }}
          transition={echosTransition}
        />
      </motion.button>
    </div>
  );

  const Slider = ({ label, value, onChange, min, max, step, unit }: {
    label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string;
  }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-foreground">{label}</p>
        <span className="text-xs text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}{unit || ''}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step || 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-5 pb-28 pt-10 sm:pt-14 scroll-smooth-container max-h-[calc(100vh-4rem)] md:max-h-none overflow-y-auto">
      <motion.div {...fadeInUp} className="mb-6 sm:mb-8">
        <p className="text-subhead uppercase tracking-widest">Preferences</p>
        <h1 className="text-headline mt-1">Settings</h1>
      </motion.div>

      <div className="space-y-3">
        {/* ─── APPEARANCE ─── */}
        <Section id="appearance" icon={Sun} title="Appearance" subtitle="Theme, layout, animations">
          <div>
            <p className="text-caption uppercase tracking-widest mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'dark' as const, icon: Moon, label: 'Dark' },
                { id: 'light' as const, icon: Sun, label: 'Light' },
                { id: 'system' as const, icon: Monitor, label: 'System' },
              ]).map((t) => (
                <motion.button
                  key={t.id}
                  {...hoverLift}
                  onClick={() => applyTheme(t.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl py-3 sm:py-4 transition-colors ${
                    settings.theme === t.id
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  <t.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{t.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <Toggle
            label="Compact Mode"
            value={settings?.compactMode ?? defaultSettings.compactMode}
            onChange={(v) => updateSettings({ compactMode: v })}
            description="Reduce whitespace for denser layouts"
          />
          <Toggle
            label="XP Animations"
            value={settings?.showXPAnimations ?? defaultSettings.showXPAnimations}
            onChange={(v) => updateSettings({ showXPAnimations: v })}
            description="Show particle effects on achievements"
          />
          <Toggle
            label="Haptic Feedback"
            value={settings?.hapticFeedback ?? defaultSettings.hapticFeedback}
            onChange={(v) => updateSettings({ hapticFeedback: v })}
            description="Vibration on interactions (mobile)"
          />
        </Section>

        {/* ─── SOUNDS ─── */}
        <Section id="sounds" icon={settings?.soundSettings?.enabled ? Volume2 : VolumeX} title="Sounds & Dopamine" subtitle="Reward sounds, volume, triggers">
          <Toggle
            label="Enable Sounds"
            value={settings?.soundSettings?.enabled ?? false}
            onChange={(v) => {
              updateSoundSetting('enabled', v);
              updateSettings({ sounds: v });
            }}
          />

          {settings?.soundSettings?.enabled && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Slider
                label="Volume"
                value={settings?.soundSettings?.volume ?? 0.5}
                onChange={(v) => updateSoundSetting('volume', v)}
                min={0} max={100} unit="%"
              />

              <div className="border-t border-border pt-4">
                <p className="text-caption uppercase tracking-widest mb-3">Sound Triggers</p>
                <div className="space-y-3">
                  <Toggle
                    label="Task Complete"
                    value={settings?.soundSettings?.taskComplete ?? false}
                    onChange={(v) => updateSoundSetting('taskComplete', v)}
                    description="Satisfying ding when you finish a task"
                  />
                  <Toggle
                    label="Focus Start"
                    value={settings?.soundSettings?.focusStart ?? false}
                    onChange={(v) => updateSoundSetting('focusStart', v)}
                    description="Calming tone when session begins"
                  />
                  <Toggle
                    label="Focus End"
                    value={settings?.soundSettings?.focusEnd ?? false}
                    onChange={(v) => updateSoundSetting('focusEnd', v)}
                    description="Triumphant arpeggio on completion"
                  />
                  <Toggle
                    label="Level Up"
                    value={settings?.soundSettings?.levelUp ?? false}
                    onChange={(v) => updateSoundSetting('levelUp', v)}
                    description="Epic power chord on level gains"
                  />
                  <Toggle
                    label="Streak Milestone"
                    value={settings?.soundSettings?.streakMilestone ?? false}
                    onChange={(v) => updateSoundSetting('streakMilestone', v)}
                    description="Warm pulse on streak achievements"
                  />
                  <Toggle
                    label="UI Clicks"
                    value={settings?.soundSettings?.uiClick ?? false}
                    onChange={(v) => updateSoundSetting('uiClick', v)}
                    description="Subtle tap on button presses"
                  />
                </div>
              </div>

              {/* Sound preview */}
              <div className="border-t border-border pt-4">
                <p className="text-caption uppercase tracking-widest mb-3">Preview Sounds</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {([
                    { type: 'taskComplete' as const, label: '✅ Task' },
                    { type: 'focusStart' as const, label: '🎯 Focus' },
                    { type: 'focusEnd' as const, label: '🏁 Done' },
                    { type: 'levelUp' as const, label: '⬆️ Level' },
                    { type: 'streakMilestone' as const, label: '🔥 Streak' },
                    { type: 'uiClick' as const, label: '👆 Click' },
                  ]).map((s) => (
                    <motion.button
                      key={s.type}
                      {...hoverLift}
                      onClick={() => playSound(s.type, settings?.soundSettings?.volume ?? 0.5)}
                      className="rounded-xl bg-secondary py-3 text-xs font-medium text-foreground hover:bg-accent/20 transition-colors"
                    >
                      {s.label}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  {...hoverLift}
                  onClick={() => previewAllSounds(settings?.soundSettings?.volume ?? 0.5)}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent/15 py-3 text-xs font-semibold text-accent"
                >
                  <Play className="h-3.5 w-3.5" />
                  Play All Sounds
                </motion.button>
              </div>
            </motion.div>
          )}
        </Section>

        {/* ─── REMINDERS ─── */}
        <Section id="reminders" icon={settings?.reminders?.taskReminders ? Bell : BellOff} title="Reminders" subtitle="Task, focus, and revision alerts">
          <Toggle
            label="Task Reminders"
            value={settings?.reminders?.taskReminders ?? defaultSettings.reminders.taskReminders}
            onChange={(v) => updateReminderSetting('taskReminders', v)}
            description="Get notified before scheduled tasks"
          />
          <Toggle
            label="Focus Reminders"
            value={settings?.reminders?.focusReminders ?? defaultSettings.reminders.focusReminders}
            onChange={(v) => updateReminderSetting('focusReminders', v)}
            description="Daily focus session prompts"
          />
          <Toggle
            label="Revision Reminders"
            value={settings?.reminders?.revisionReminders ?? defaultSettings.reminders.revisionReminders}
            onChange={(v) => updateReminderSetting('revisionReminders', v)}
            description="Spaced repetition review alerts"
          />
          <Slider
            label="Remind Before"
            value={settings?.reminders?.reminderMinutesBefore ?? defaultSettings.reminders.reminderMinutesBefore}
            onChange={(v) => updateReminderSetting('reminderMinutesBefore', v)}
            min={5} max={60} step={5} unit=" min"
          />
        </Section>

        {/* ─── FOCUS TIMER ─── */}
        <Section id="timer" icon={Timer} title="Focus Timer" subtitle="Pomodoro durations and behavior">
          <Slider
            label="Work Duration"
            value={settings?.pomodoroWork ?? defaultSettings.pomodoroWork}
            onChange={(v) => updateSettings({ pomodoroWork: v })}
            min={5} max={90} step={5} unit=" min"
          />
          <Slider
            label="Break Duration"
            value={settings?.pomodoroBreak ?? defaultSettings.pomodoroBreak}
            onChange={(v) => updateSettings({ pomodoroBreak: v })}
            min={1} max={30} step={1} unit=" min"
          />
          <Toggle
            label="Auto-Start Break"
            value={settings?.autoStartBreak ?? defaultSettings.autoStartBreak}
            onChange={(v) => updateSettings({ autoStartBreak: v })}
            description="Automatically begin break after work session"
          />
        </Section>

        {/* ─── TIME FORMAT ─── */}
        <Section id="time" icon={Clock} title="Time & Format" subtitle="Clock format preferences">
          <div>
            <p className="text-caption uppercase tracking-widest mb-3">Time Format</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: '24h' as const, label: '24 Hour', example: '14:30' },
                { id: '12h' as const, label: '12 Hour', example: '2:30 PM' },
              ]).map((f) => (
                <motion.button
                  key={f.id}
                  {...hoverLift}
                  onClick={() => updateSettings({ timeFormat: f.id })}
                  className={`flex flex-col items-center gap-1 rounded-2xl py-4 transition-colors ${
                    settings?.timeFormat === f.id
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  <span className="text-sm font-medium">{f.label}</span>
                  <span className="text-[10px] opacity-70">{f.example}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── DANGER ZONE ─── */}
        <motion.div layout className="glass-card p-4 sm:p-5">
          <p className="text-caption uppercase tracking-widest mb-3 text-destructive">Reset</p>
          <p className="text-xs text-muted-foreground mb-3">
            Clear all stored data and return to defaults. This cannot be undone.
          </p>
          <motion.button
            {...hoverLift}
            onClick={() => {
              if (window.confirm('Are you sure? This will erase all your data.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="rounded-xl bg-destructive/15 px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/25 transition-colors"
          >
            <RotateCcw className="inline h-3.5 w-3.5 mr-1.5" />
            Reset All Data
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsScreen;

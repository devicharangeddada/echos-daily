import { useMemo } from 'react';
import { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motion } from 'framimport { motipb-32">
      <motion.header {...fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="apple-glass p-6 rounded-[2.5rem] flex flex-col items-center gap-3 text-center">
          <Flame className="text-orange-500 h-6 w-6" />
          <span className="text-3xl font-bold">{streak}</span>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Streak</p>
        </div>
        <div className="apple-glass p-6 rounded-[2.5rem] flex flex-col items-center gap-3 text-center bg-primary/5">
          <Zap className="text-primary h-6 w-6" />
          <span className="text-3xl font-bold">{level}</span>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Level</p>
        </div>
        <div className="apple-glass p-6 rounded-[2.5rem] flex flex-col items-center gap-3 text-center">
          <Target className="text-emerald-500 h-6 w-6" />
          <span className="text-3xl font-bold">{xp}</span>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">XP</p>
        </div>
        <div className="apple-glass p-6 rounded-[2.5rem] flex flex-col items-center gap-3 text-center">
          <Clock className="text-slate-500 h-6 w-6" />
          <span className="text-3xl font-bold">{weeklyStats.focusHours}</span>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Focus Hours</p>
        </div>
      </motion.header>

      <motion.section {...fadeInUp} className="space-y-4">
        <div className="px-2">
          <h2 className="text-lg font-bold">System Flow: Deep Work</h2>
          <p className="text-sm text-muted-foreground">{guidance}</p>
        </div>

        <div className="space-y-3">
          {highEnergyTasks.length > 0 ? (
            highEnergyTasks.map((task) => (
              <motion.div
                key={task.id}
                className="apple-glass p-5 rounded-[2.5rem] flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                {...fadeInUp}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{task.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      <span className="rounded-full bg-secondary/10 px-2 py-1">{task.type}</span>
                      <span className="rounded-full bg-secondary/10 px-2 py-1">{task.estimatedMinutes} min</span>
                      <span className="rounded-full bg-secondary/10 px-2 py-1">{task.dueDate ?? task.date ?? 'No due date'}</span>
                    </div>
                  </div>
                </div>
                <button className="rounded-full bg-foreground px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90">
                  Start Focus
                </button>
              </motion.div>
            ))
          ) : (
            <div className="apple-glass p-8 rounded-[2.5rem] text-center text-muted-foreground">
              <p className="text-sm">No high energy work is queued. Use this moment to review your syllabus or close low-priority loops.</p>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}

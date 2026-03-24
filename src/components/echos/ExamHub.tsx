import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, BookOpen, TrendingUp } from 'lucide-react';
import { useStudyStore } from '@/store/studyStore';
import { useStore } from '@/store/useStore';
import { fadeInUp, hoverLift, echosTransition } from '@/lib/motion';

const ExamHub = () => {
  const { getStudyTodayTopics, getOverallProgress, subjects } = useStudyStore();
  const { examDate, xp, level, streak } = useStore();

  const studyToday = useMemo(() => getStudyTodayTopics(), [subjects]);
  const progress = useMemo(() => getOverallProgress(), [subjects]);
  const nextTopic = studyToday[0] || null;

  const daysLeft = useMemo(() => {
    const delta = Math.max(0, new Date(examDate).getTime() - Date.now());
    return Math.floor(delta / 86400000);
  }, [examDate]);

  const totalFlashcardsDue = useMemo(() => {
    let count = 0;
    for (const s of subjects) {
      for (const c of s.chapters) {
        for (const t of c.topics) {
          count += t.flashcards.filter((fc) => fc.nextReview <= Date.now()).length;
        }
      }
    }
    return count;
  }, [subjects]);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-28 pt-14">
      <motion.div {...fadeInUp} className="mb-6">
        <p className="text-subhead uppercase tracking-widest">Exam Prep</p>
        <h1 className="text-headline mt-1">Study Hub</h1>
      </motion.div>

      {/* Overall progress */}
      <motion.div {...fadeInUp} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption uppercase tracking-widest">Syllabus Progress</span>
          <span className="text-xs text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${progress}%` }}
            transition={echosTransition}
          />
        </div>
      </motion.div>

      {/* Stats strip */}
      <motion.div {...fadeInUp} className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-light text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{daysLeft}</p>
          <p className="text-caption mt-1">Days Left</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-light text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalFlashcardsDue}</p>
          <p className="text-caption mt-1">Cards Due</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-light text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{streak}</p>
          <p className="text-caption mt-1">Streak</p>
        </div>
      </motion.div>

      {/* What to Study Today */}
      <motion.div {...fadeInUp} className="mb-6">
        <h2 className="text-caption uppercase tracking-widest mb-3">What to Study Today</h2>

        {nextTopic ? (
          <motion.div {...hoverLift} className="glass-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/20">
                <Brain className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-medium text-foreground">{nextTopic.topic.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {nextTopic.subject.name} · {nextTopic.chapter.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${nextTopic.topic.masteryScore}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{nextTopic.topic.masteryScore}%</span>
                </div>
                {nextTopic.topic.status === 'completed' && nextTopic.topic.completedAt && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-semibold uppercase">
                    Revision Due
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-muted-foreground">All caught up! 🎉</p>
          </div>
        )}
      </motion.div>

      {/* More topics to review */}
      {studyToday.length > 1 && (
        <motion.div {...fadeInUp} className="mb-6">
          <h2 className="text-caption uppercase tracking-widest mb-3">Up Next</h2>
          <div className="space-y-2">
            {studyToday.slice(1, 5).map((item) => (
              <motion.div key={item.topic.id} {...hoverLift} className="glass-card px-4 py-3 flex items-center gap-3">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: `hsl(${item.subject.color})` }}
                />
                <span className="flex-1 text-sm text-foreground">{item.topic.name}</span>
                <span className="text-[10px] text-muted-foreground">{item.topic.masteryScore}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* XP card */}
      <motion.div {...fadeInUp} className="glass-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="h-4 w-4 text-accent" />
          <span className="text-caption uppercase tracking-widest">Progress</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-secondary/50 p-3 text-center">
            <p className="text-xl font-light text-foreground">{xp}</p>
            <p className="text-[10px] text-muted-foreground uppercase">XP</p>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-3 text-center">
            <p className="text-xl font-light text-foreground">Lv. {level}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Level</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExamHub;

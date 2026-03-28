import { useMemo } from 'react';
import { useStudyStore } from '@/store/studyStore';
import { useStore } from '@/store/useStore';
import { fadeInUp } from '@/lib/motion';

const MetricCard = ({ label, value, sub, color = 'text-foreground' }: { label: string; value: number | string; sub: string; color?: string }) => (
  <div className="apple-glass p-6 rounded-[2rem] flex flex-col items-center justify-center border border-white/10 text-center">
    <span className={`text-3xl font-bold ${color}`}>{value}</span>
    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-2">{label}</p>
    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">{sub}</p>
  </div>
);

const CircularProgress = ({ value, size = 60, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(171, 100%, 35%)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className="mt-2 text-sm font-semibold text-foreground">{value}%</span>
    </div>
  );
};

const ChapterRow = ({ chapter }: { chapter: { id: string; name: string; topics: { masteryScore: number }[] } }) => {
  const totalTopics = chapter.topics.length;
  const chapterProgress = totalTopics === 0
    ? 0
    : Math.round(chapter.topics.reduce((sum, topic) => sum + topic.masteryScore, 0) / totalTopics);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center rounded-3xl bg-background/50 p-4 border border-white/10">
      <div>
        <p className="text-sm font-semibold text-foreground">{chapter.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{totalTopics} topics</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${chapterProgress}%` }} />
        </div>
        <span className="text-xs font-semibold text-foreground">{chapterProgress}%</span>
      </div>
    </div>
  );
};

const ExamHub = () => {
  const { subjects, getOverallProgress } = useStudyStore();
  const { examDate } = useStore();

  const metrics = useMemo(() => {
    const days = Math.max(0, Math.floor((new Date(examDate).getTime() - Date.now()) / 86400000));
    const totalChapters = subjects.reduce((acc, subject) => acc + subject.chapters.length, 0);
    const overallCompletion = getOverallProgress();

    return {
      days,
      subjectCount: subjects.length,
      totalChapters,
      overallCompletion,
    };
  }, [subjects, examDate, getOverallProgress]);

  return (
    <div className="mx-auto max-w-3xl px-6 pb-32 pt-12 space-y-8">
      <header>
        <p className="text-subhead uppercase tracking-[0.3em] text-primary font-bold">Exam Readiness</p>
        <h1 className="text-4xl font-bold tracking-tight">Strategy Dashboard</h1>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Days Left" value={metrics.days} sub="Countdown" color="text-orange-500" />
        <MetricCard label="Subjects" value={metrics.subjectCount} sub="Enrolled" />
        <MetricCard label="Chapters" value={metrics.totalChapters} sub="Total Volume" />
        <div className="apple-glass p-6 rounded-[2rem] flex flex-col items-center justify-center border border-primary/20">
          <CircularProgress value={metrics.overallCompletion} size={72} strokeWidth={8} />
          <p className="text-[10px] uppercase font-bold mt-2 opacity-50">Syllabus %</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold px-2">Subject Breakdown</h2>
        {subjects.map((subject) => (
          <div key={subject.id} className="apple-glass p-6 rounded-[2.5rem] space-y-4 border border-white/10">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-bold text-lg" style={{ color: `hsl(${subject.color})` }}>{subject.name}</h3>
              <span className="text-xs font-mono uppercase opacity-50">{subject.chapters.length} Chapters</span>
            </div>
            <div className="grid gap-3">
              {subject.chapters.map((chapter) => (
                <ChapterRow key={chapter.id} chapter={chapter} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ExamHub;

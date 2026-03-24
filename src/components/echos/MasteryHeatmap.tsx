import { Subject } from '@/store/studyStore';

type MasteryHeatmapProps = {
  subjects: Subject[];
};

const getColor = (value: number) => {
  if (value >= 90) return 'bg-amber-400 text-amber-800 border-amber-300';
  if (value >= 50) return 'bg-emerald-400 text-emerald-900 border-emerald-300';
  if (value >= 21) return 'bg-cyan-400 text-cyan-900 border-cyan-300';
  return 'bg-blue-400 text-blue-900 border-blue-300';
};

const getMastery = (subject: Subject) => {
  const totals: { sum: number; count: number } = { sum: 0, count: 0 };
  subject.chapters.forEach((chapter) => {
    chapter.topics.forEach((topic) => {
      totals.sum += topic.masteryScore;
      totals.count += 1;
    });
  });
  return totals.count === 0 ? 0 : Math.round(totals.sum / totals.count);
};

const getChapterMastery = (topicGroup: Subject['chapters'][0]) => {
  const sums = topicGroup.topics.reduce((sum, t) => sum + t.masteryScore, 0);
  return topicGroup.topics.length ? Math.round(sums / topicGroup.topics.length) : 0;
};

const MasteryHeatmap = ({ subjects }: MasteryHeatmapProps) => {
  const totalTopics = subjects.reduce((total, subject) => total + subject.chapters.reduce((ct, c) => ct + c.topics.length, 0), 0);
  const totalMastery = subjects.reduce((total, subject) => total + getMastery(subject), 0);
  const mapPercent = totalTopics === 0 ? 0 : Math.round(totalMastery / subjects.length);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-secondary p-4">
        <p className="text-caption uppercase tracking-widest">Mastery Map</p>
        <p className="text-xs text-muted-foreground mt-1">
          Average confidence: <strong>{mapPercent}%</strong>
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] text-blue-800">0–20 cold</span>
          <span className="rounded-md bg-cyan-100 px-2 py-1 text-[10px] text-cyan-800">21–49 warming</span>
          <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] text-emerald-800">50–89 neutral</span>
          <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] text-amber-800">90+ hot</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {subjects.map((subject) => {
          const subjectMastery = getMastery(subject);
          return (
            <div key={subject.id} className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{subject.name}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getColor(subjectMastery)}`}>
                  {subjectMastery}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {subject.chapters.map((chapter) => {
                  const mastery = getChapterMastery(chapter);
                  return (
                    <div key={chapter.id} className="rounded-lg border border-border p-2">
                      <p className="text-xs font-medium text-foreground truncate">{chapter.name}</p>
                      <div className="mt-1 h-2.5 rounded-full bg-neutral-200">
                        <div style={{ width: `${mastery}%` }} className={`${getColor(mastery)} h-2.5 rounded-full`} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{mastery}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MasteryHeatmap;

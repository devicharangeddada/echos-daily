import { Subject } from '@/store/studyStore';
import { motion } from 'framer-motion';
import { useState } from 'react';

type MasteryHeatmapProps = {
  subjects: Subject[];
};

const getColor = (mastery: number) => {
  if (mastery <= 20) return 'bg-accent/20 border-accent/30';
  if (mastery <= 70) return 'bg-emerald-500/40 border-emerald-500/50';
  return 'bg-orange-500/60 border-orange-500/70';
};

const getNextReviewDate = (topic: { id: string; name: string }) => {
  return new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
};

const MasteryHeatmap = ({ subjects }: MasteryHeatmapProps) => {
  const [hoveredTopic, setHoveredTopic] = useState<{ name: string; mastery: number; nextReview: string } | null>(null);

  const allTopics = subjects.flatMap(subject =>
    subject.chapters.flatMap(chapter =>
      chapter.topics.map(topic => ({
        ...topic,
        subjectName: subject.name,
        chapterName: chapter.name,
      }))
    )
  );

  const totalTopics = allTopics.length;
  const averageMastery = totalTopics > 0
    ? Math.round(allTopics.reduce((sum, topic) => sum + topic.masteryScore, 0) / totalTopics)
    : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-secondary/50 p-4">
        <p className="text-caption uppercase tracking-widest">Syllabus Map</p>
        <p className="text-xs text-muted-foreground mt-1">
          Average mastery: <strong className="text-foreground">{averageMastery}%</strong> across {totalTopics} topics
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <span className="rounded-md bg-accent/20 px-2 py-1 text-accent-foreground border border-accent/30">0–20% Cold</span>
          <span className="rounded-md bg-emerald-500/40 px-2 py-1 text-foreground border border-emerald-500/50">21–70% Neutral</span>
          <span className="rounded-md bg-orange-500/60 px-2 py-1 text-foreground border border-orange-500/70">71–100% Hot</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-8 gap-1">
          {allTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              className={`aspect-square rounded border cursor-pointer ${getColor(topic.masteryScore)}`}
              whileHover={{ scale: 1.1 }}
              onHoverStart={() => setHoveredTopic({
                name: topic.name,
                mastery: topic.masteryScore,
                nextReview: getNextReviewDate(topic)
              })}
              onHoverEnd={() => setHoveredTopic(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
            />
          ))}
        </div>

        {hoveredTopic && (
          <motion.div
            className="mt-4 p-3 bg-secondary rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-medium text-sm text-foreground">{hoveredTopic.name}</p>
            <p className="text-xs text-muted-foreground">
              Mastery: {hoveredTopic.mastery}% • Next review: {hoveredTopic.nextReview}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MasteryHeatmap;

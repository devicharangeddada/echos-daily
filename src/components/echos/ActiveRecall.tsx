import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStudyStore } from '@/store/studyStore';
import { useStore } from '@/store/useStore';
import { playSound } from '@/lib/sounds';
import { RotateCcw, CheckCircle2, ThumbsUp, ThumbsDown, ImageIcon } from 'lucide-react';

interface ActiveRecallProps {
  subjectId: string;
  chapterId: string;
  topicId: string;
}

const ActiveRecall = ({ subjectId, chapterId, topicId }: ActiveRecallProps) => {
  const topic = useStudyStore((s) =>
    s.subjects
      .find((sub) => sub.id === subjectId)
      ?.chapters
      .find((ch) => ch.id === chapterId)
      ?.topics
      .find((t) => t.id === topicId)
  );
  const reviewCard = useStudyStore((s) => s.reviewTopicVaultFlashcard);
  const settings = useStore((s) => s.settings);

  const cards = useMemo(() => topic?.vault.flashcards ?? [], [topic]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showBack, setShowBack] = useState(false);

  if (!topic || cards.length === 0) {
    return <p className="text-sm text-muted-foreground">No flashcards available. Generate some first.</p>;
  }

  const card = cards[index];
  const media = topic.vault.media.find((m) => m.id === card.sourceMediaId);

  const handleFlip = () => {
    setShowBack(!showBack);
    if (settings.soundSettings?.enabled) {
      playSound('uiClick', settings.soundSettings?.volume ?? 0.5);
    }
  };

  const handleResult = (isEasy: boolean) => {
    reviewCard(subjectId, chapterId, topicId, card.id, isEasy);
    if (settings.soundSettings?.enabled && isEasy) {
      playSound('taskComplete', settings.soundSettings?.volume ?? 0.5);
    }

    const nextIndex = (index + 1) % cards.length;
    setIndex(nextIndex);
    setAnswer('');
    setShowBack(false);
  };

  const stabilityLabel = () => {
    if (card.stability >= 80) return 'Easy';
    if (card.stability >= 40) return 'Medium';
    return 'Hard';
  };

  return (
    <div className="rounded-xl border border-border bg-secondary p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">Active Recall</p>
        <p className="text-xs text-muted-foreground">{index + 1}/{cards.length}</p>
      </div>

      <motion.div
        className="relative h-40 w-full perspective"
        onClick={handleFlip}
      >
        <motion.div
          className="absolute inset-0 h-full w-full rounded-xl border border-border bg-background p-5 text-left shadow-lg"
          animate={{ rotateY: showBack ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div style={{ backfaceVisibility: 'hidden' }}>
            <p className="text-sm font-medium">{card.q}</p>
            <textarea
              value={answer}
              placeholder="Type your answer here"
              onChange={(e) => setAnswer(e.target.value)}
              className="mt-3 h-20 w-full resize-none rounded-md border border-border bg-transparent p-2 text-sm"
            />
          </div>

          <div
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
            }}
            className="h-full"
          >
            <p className="text-sm font-medium">{card.a}</p>
            <p className="mt-2 text-[11px] uppercase text-muted-foreground">Reference</p>
            {media ? (
              media.type === 'image' ? (
                <img src={media.data} alt={media.label} className="mt-2 h-20 w-20 object-cover rounded" />
              ) : (
                <div className="mt-2 w-20 rounded border border-border p-2 text-[11px]">
                  <ImageIcon className="mb-1 h-4 w-4" /> {media.label}
                </div>
              )
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">No source media found</p>
            )}
          </div>
        </motion.div>
      </motion.div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => handleResult(false)}
          className="flex items-center gap-1 rounded-lg border border-destructive px-3 py-2 text-sm text-destructive"
        >
          <ThumbsDown className="h-4 w-4" /> Hard
        </button>
        <button
          type="button"
          onClick={() => handleResult(true)}
          className="flex items-center gap-1 rounded-lg bg-primary/15 px-3 py-2 text-sm text-primary"
        >
          <ThumbsUp className="h-4 w-4" /> Easy
        </button>
      </div>

      <div className="mt-2 text-[11px] text-muted-foreground">
        Mastery: {stabilityLabel()} • Next review: {new Date(card.dueDate).toLocaleString()}
      </div>
    </div>
  );
};

export default ActiveRecall;

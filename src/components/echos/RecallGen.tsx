import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Pencil, PlusSquare, RotateCcw } from 'lucide-react';
import { useStudyStore } from '@/store/studyStore';
import { textToEmbedding, cosineSimilarity } from '@/lib/semantic-utils';

interface RecallGenProps {
  subjectId: string;
  chapterId: string;
  topicId: string;
}

const parseExtractedText = (text: string): { q: string; a: string }[] => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const cards: { q: string; a: string }[] = [];

  for (const line of lines) {
    if (cards.length >= 5) break;
    const colonIndex = line.indexOf(':');
    if (colonIndex > 2) {
      const q = line.slice(0, colonIndex).trim();
      const a = line.slice(colonIndex + 1).trim();
      if (q && a) cards.push({ q, a });
      continue;
    }

    const dashIndex = line.indexOf('-');
    if (dashIndex > 2) {
      const q = line.slice(0, dashIndex).trim();
      const a = line.slice(dashIndex + 1).trim();
      if (q && a) cards.push({ q, a });
      continue;
    }

    if (line.length < 120 && line.split(' ').length <= 8 && /\b(is|are|means|refers to)\b/i.test(line)) {
      cards.push({ q: line, a: '' });
    }
  }

  if (cards.length === 0 && text.length > 0) {
    const context = text.slice(0, 500).split(/[.\n]/).filter(Boolean);
    for (let i = 0; i < Math.min(5, context.length - 1); i += 2) {
      cards.push({ q: context[i].trim(), a: context[i + 1]?.trim() ?? '' });
    }
  }

  return cards.slice(0, 5);
};

const RecallGen = ({ subjectId, chapterId, topicId }: RecallGenProps) => {
  const topic = useStudyStore((s) =>
    s.subjects
      .find((sub) => sub.id === subjectId)
      ?.chapters
      .find((ch) => ch.id === chapterId)
      ?.topics
      .find((t) => t.id === topicId)
  );
  const addTopicVaultFlashcards = useStudyStore((s) => s.addTopicVaultFlashcards);
  const [drafts, setDrafts] = useState<{ id: string; q: string; a: string; sourceMediaId: string }[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [brainDump, setBrainDump] = useState('');
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const extractedText = topic?.vault.extractedText ?? '';

  const regenerate = () => {
    if (!extractedText.trim()) return;
    const parsed = parseExtractedText(extractedText);
    const mapped = parsed.map((c) => ({
      id: crypto.randomUUID(),
      q: c.q,
      a: c.a,
      sourceMediaId: topic?.vault.media[0]?.id ?? '',
    }));
    setDrafts(mapped);
    setIsReviewing(true);
  };

  const saveDrafts = () => {
    if (!drafts.length) return;
    addTopicVaultFlashcards(subjectId, chapterId, topicId, drafts.map((d) => ({
      q: d.q,
      a: d.a,
      sourceMediaId: d.sourceMediaId,
      easiness: 2.5,
      interval: 1,
      reps: 0,
    })));
    setIsReviewing(false);
    setDrafts([]);
  };

  const updatedCard = (id: string, field: 'q' | 'a', value: string) => {
    setDrafts((old) => old.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const hasCards = extractedText.trim().length > 0;

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-base font-semibold">Smart Recall Generator</h3>
        <div className="flex flex-wrap items-center gap-2">
          <textarea
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            placeholder="Describe the concept in your own words..."
            className="w-full min-h-[72px] rounded-md border border-border bg-background p-2 text-sm text-foreground md:w-80"
          />
          <button
            type="button"
            onClick={async () => {
              setIsComparing(true);
              try {
                const [topicEmb, dumpEmb] = await Promise.all([
                  textToEmbedding(extractedText || ' '),
                  textToEmbedding(brainDump || ' '),
                ]);
                const score = cosineSimilarity(topicEmb, dumpEmb);
                setSimilarity(Math.round(score * 100));
              } catch (error) {
                console.error('Semantic similarity failed', error);
                setSimilarity(null);
              } finally {
                setIsComparing(false);
              }
            }}
            disabled={!brainDump.trim() || !extractedText.trim()}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
          >
            {isComparing ? 'Comparing...' : 'Evaluate Recall'}
          </button>
        </div>
      </div>
      {similarity !== null && (
        <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm">
          <strong>Semantic match:</strong> {similarity}%
          <span className="ml-2 text-xs text-muted-foreground">
            {similarity >= 90 ? 'Excellent alignment!' : similarity >= 70 ? 'Good, keep refining.' : 'Distill your understanding more.'}
          </span>
        </div>
      )}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={regenerate}
          className="inline-flex items-center gap-2 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25 transition"
          disabled={!hasCards}
        >
          <RotateCcw className="h-4 w-4" />
          Regenerate
        </button>
      </div>

      {!hasCards && (
        <p className="text-sm text-muted-foreground">Upload notes or run OCR first to generate recall prompts.</p>
      )}

      {hasCards && !isReviewing && (
        <button
          type="button"
          onClick={regenerate}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition"
        >
          <Sparkles className="mr-1 inline h-4 w-4" /> Generate Draft Flashcards
        </button>
      )}

      {isReviewing && drafts.length > 0 && (
        <div className="space-y-3">
          {drafts.map((card, idx) => (
            <div key={card.id} className="rounded-xl border border-secondary p-3">
              <div className="text-[11px] text-muted-foreground">Draft #{idx + 1}</div>
              <input
                className="mt-1 w-full rounded-md border border-border px-2 py-1 text-sm bg-background text-foreground"
                value={card.q}
                onChange={(e) => updatedCard(card.id, 'q', e.target.value)}
                placeholder="Question"
              />
              <textarea
                className="mt-2 w-full min-h-[70px] rounded-md border border-border px-2 py-1 text-sm bg-background text-foreground"
                value={card.a}
                onChange={(e) => updatedCard(card.id, 'a', e.target.value)}
                placeholder="Answer"
              />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveDrafts}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
            >
              <PlusSquare className="h-4 w-4" /> Add to My Deck
            </button>
            <button
              type="button"
              onClick={() => setIsReviewing(false)}
              className="text-xs text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecallGen;

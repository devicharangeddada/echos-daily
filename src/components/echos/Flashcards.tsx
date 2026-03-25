import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { echosTransition, fadeInUp, hoverLift } from '@/lib/motion';
import { getDueFlashcards, addFlashcard, updateFlashcard } from '@/store/vaultDB';
import { calculateNextReview, getStabilityScore } from '@/lib/srs-logic';

const Flashcards = () => {
  const { settings } = useStore();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [interleavedCard, setInterleavedCard] = useState<any | null>(null);

  const loadCards = async () => {
    const due = await getDueFlashcards(30);
    setCards(due);

    if (Math.random() < 0.2 && due.length > 0) {
      const { vaultDB } = await import('@/store/vaultDB');
      const allCards = await vaultDB.flashcards.toArray();
      const nonDue = allCards.filter(c => c.dueDate > Date.now() && !due.find(d => d.id === c.id));
      if (nonDue.length > 0) {
        const randomCard = nonDue[Math.floor(Math.random() * nonDue.length)];
        setInterleavedCard(randomCard);
      }
    } else {
      setInterleavedCard(null);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const generateFromNote = async () => {
    if (!noteInput.trim()) return;
    setLoading(true);
    try {
      const lines = noteInput.split('\n').filter(Boolean).slice(0, 3);
      await Promise.all(lines.map((line) => addFlashcard({
        topicId: 'general',
        front: line.slice(0, 80),
        back: line,
        easiness: 2.5,
        interval: 1,
        reps: 0,
        lastReview: 0,
        dueDate: Date.now(),
        stability: 0,
      })));
      setNoteInput('');
      await loadCards();
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (card: any, quality: number) => {
    const updates = calculateNextReview(card, quality);
    await updateFlashcard(card.id, updates);
    setCards(cards.filter((c) => c.id !== card.id));
    if (settings.sounds) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 400 + quality * 40;
        gain.gain.value = 0.05;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch {}
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pb-28 pt-14 text-foreground">
      <motion.div {...fadeInUp} className="glass-card rounded-[2rem] bg-card/75 border border-border p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-accent" /><h2 className="text-xl font-semibold">Flashcards</h2></div>

        <div className="mb-4">
          <textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            rows={3}
            className="w-full rounded-[1rem] bg-secondary p-3 text-sm text-foreground outline-none"
            placeholder="Paste notes here..."
          />
          <div className="mt-2 flex gap-2">
            <button onClick={generateFromNote} className="rounded-full bg-accent px-4 py-2 text-xs text-accent-foreground" disabled={loading}>
              {loading ? 'Generating...' : 'Generate from Note'}
            </button>
            <button onClick={() => loadCards()} className="rounded-full bg-secondary px-4 py-2 text-xs text-foreground">Refresh</button>
          </div>
        </div>

        <div className="space-y-3">
          {interleavedCard && (
            <motion.div {...hoverLift} className="rounded-[1.5rem] bg-accent/20 border border-accent/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-accent">Interleaved Practice</span>
              </div>
              <p className="text-sm font-semibold">{interleavedCard.front || interleavedCard.question}</p>
              <p className="mt-2 text-xs">{interleavedCard.back || interleavedCard.answer}</p>
              <div className="mt-3 flex gap-2">
                {[5, 4, 3, 2, 1].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleReview(interleavedCard, q)}
                    className="rounded-full bg-accent/80 px-2 py-1 text-[10px] text-accent-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {cards.length === 0 && !interleavedCard && <p className="text-sm text-muted-foreground">No due flashcards.</p>}
          {cards.map((card) => (
            <motion.div key={card.id} {...hoverLift} className="rounded-[1.5rem] bg-secondary p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{card.front || card.question}</p>
                <span className="text-[10px] text-muted-foreground">Due: {new Date(card.dueDate).toLocaleDateString()}</span>
              </div>
              <p className="mt-2 text-xs">{card.back || card.answer}</p>
              <div className="mt-3 flex gap-2">
                {[5, 4, 3, 2, 1].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleReview(card, q)}
                    className="rounded-full bg-accent/80 px-2 py-1 text-[10px] text-accent-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Flashcards;

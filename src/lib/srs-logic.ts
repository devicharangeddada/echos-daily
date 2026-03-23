import { FlashcardItem } from '@/store/vaultDB';

// SM2 Algorithm Implementation
export const calculateNextReview = (card: FlashcardItem, quality: number): Partial<FlashcardItem> => {
  // quality: 0-5 (0=complete blackout, 5=perfect response)
  let { easiness, interval, reps, lastReview } = card;

  if (quality >= 3) {
    // Correct response
    if (reps === 0) {
      interval = 1;
    } else if (reps === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
    reps += 1;
  } else {
    // Incorrect response
    reps = 0;
    interval = 1;
  }

  // Update easiness factor
  easiness = Math.max(1.3, easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const now = Date.now();
  const dueDate = now + interval * 24 * 60 * 60 * 1000; // days to ms
  const stability = getStabilityScore({ ...card, easiness, interval, reps });

  return {
    easiness,
    interval,
    reps,
    lastReview: now,
    dueDate,
    stability,
  };
};

// Get due cards for recall session
export const getRecallSessionCards = async (limit = 20) => {
  // This will be called from components, assuming vaultDB is imported
  const { getDueFlashcards } = await import('@/store/vaultDB');
  return getDueFlashcards(limit);
};

// Stability percentage (0-100) based on interval and reps
export const getStabilityScore = (card: FlashcardItem): number => {
  const baseScore = Math.min(100, card.interval * 10 + card.reps * 5);
  return Math.min(100, Math.max(0, baseScore));
};
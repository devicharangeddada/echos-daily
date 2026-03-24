import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateNextReview, getStabilityScore } from '@/lib/srs-logic';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'link';
}

export interface VaultMedia {
  id: string;
  type: 'image' | 'pdf';
  data: string; // dataURL/base64 PDF data
  label: string;
  createdAt: number;
}

export interface VaultFlashcard {
  id: string;
  q: string;
  a: string;
  sourceMediaId: string;
  easiness: number;
  interval: number;
  reps: number;
  lastReview: number;
  dueDate: number;
  stability: number;
}

export interface Flashcard {
  id: string;
  q: string;
  a: string;
  ease: number;
  nextReview: number; // timestamp
  interval: number;
  reps: number;
  stability: number;
}

export interface PQP {
  id: string;
  question: string;
  solution: string;
  status: 'unattempted' | 'mastered';
}

export interface Topic {
  id: string;
  name: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'revised';
  masteryScore: number; // 0-100
  studyPlan: { pom: string; rom: string };
  flashcards: Flashcard[];
  pqps: PQP[];
  attachments: Attachment[];
  vault: {
    media: VaultMedia[];
    extractedText: string;
    flashcards: VaultFlashcard[];
  };
  completedAt?: number; // timestamp for revision scheduling
}

export interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  chapters: Chapter[];
}

interface StudyState {
  subjects: Subject[];
  addSubject: (name: string, color: string) => void;
  removeSubject: (id: string) => void;
  addChapter: (subjectId: string, name: string) => void;
  removeChapter: (subjectId: string, chapterId: string) => void;
  addTopic: (subjectId: string, chapterId: string, name: string) => void;
  removeTopic: (subjectId: string, chapterId: string, topicId: string) => void;
  renameSubject: (subjectId: string, name: string) => void;
  renameChapter: (subjectId: string, chapterId: string, name: string) => void;
  reorderTopics: (subjectId: string, chapterId: string, fromIndex: number, toIndex: number) => void;
  updateTopic: (subjectId: string, chapterId: string, topicId: string, updates: Partial<Topic>) => void;
  addFlashcard: (subjectId: string, chapterId: string, topicId: string, q: string, a: string) => void;
  reviewFlashcard: (subjectId: string, chapterId: string, topicId: string, cardId: string, quality: number) => void;
  addPQP: (subjectId: string, chapterId: string, topicId: string, question: string, solution: string) => void;
  togglePQP: (subjectId: string, chapterId: string, topicId: string, pqpId: string) => void;
  addAttachment: (subjectId: string, chapterId: string, topicId: string, att: Omit<Attachment, 'id'>) => void;
  addTopicVaultMedia: (subjectId: string, chapterId: string, topicId: string, media: Omit<VaultMedia, 'id' | 'createdAt'>) => void;
  removeTopicVaultMedia: (subjectId: string, chapterId: string, topicId: string, mediaId: string) => void;
  setTopicExtractedText: (subjectId: string, chapterId: string, topicId: string, text: string) => void;
  addTopicVaultFlashcards: (subjectId: string, chapterId: string, topicId: string, flashcards: Array<Omit<VaultFlashcard, 'id' | 'lastReview' | 'dueDate' | 'stability'>>) => void;
  reviewTopicVaultFlashcard: (subjectId: string, chapterId: string, topicId: string, cardId: string, isEasy: boolean) => void;
  getStudyTodayTopics: () => { subject: Subject; chapter: Chapter; topic: Topic }[];
  getOverallProgress: () => number;
  quickAdd: (subjectName: string, chapterName: string, topicName: string, color?: string) => void;
  examSections: { id: string; title: string; notes: string }[];
  addExamSection: (title: string) => void;
  updateExamSection: (id: string, updates: Partial<{ title: string; notes: string }>) => void;
  removeExamSection: (id: string) => void;
  reorderExamSections: (fromIndex: number, toIndex: number) => void;
}

const uid = () => crypto.randomUUID();

// SM2 calculations delegated to srs-logic functions
const mapTopic = (subjects: Subject[], sId: string, cId: string, tId: string, fn: (t: Topic) => Topic): Subject[] =>
  subjects.map((s) =>
    s.id !== sId ? s : {
      ...s,
      chapters: s.chapters.map((c) =>
        c.id !== cId ? c : {
          ...c,
          topics: c.topics.map((t) => (t.id !== tId ? t : fn(t))),
        }
      ),
    }
  );

const defaultSubjects: Subject[] = [
  {
    id: uid(),
    name: 'Electrical Engineering',
    color: '214 100% 50%',
    chapters: [
      {
        id: uid(),
        name: 'Circuit Analysis',
        topics: [
          {
            id: uid(), name: "Kirchhoff's Laws", status: 'not-started', masteryScore: 0,
            studyPlan: { pom: 'Read chapter 3, derive KCL/KVL', rom: 'Practice 5 circuit problems' },
            flashcards: [
              { id: uid(), q: "State Kirchhoff's Current Law", a: 'The sum of currents entering a node equals the sum leaving it', ease: 2.5, nextReview: Date.now(), interval: 1, reps: 0 },
              { id: uid(), q: 'What is KVL?', a: 'The sum of voltage drops around any closed loop equals zero', ease: 2.5, nextReview: Date.now(), interval: 1, reps: 0 },
            ],
            pqps: [{ id: uid(), question: 'Find current through R2 in a series-parallel circuit', solution: 'Use KVL + node analysis', status: 'unattempted' }],
            attachments: [],            vault: { media: [], extractedText: '', flashcards: [] },          },
          {
            id: uid(), name: 'Thevenin & Norton', status: 'not-started', masteryScore: 0,
            studyPlan: { pom: 'Study equivalence theorems', rom: 'Solve 3 Thevenin problems' },
            flashcards: [], pqps: [], attachments: [],
            vault: { media: [], extractedText: '', flashcards: [] },
          },
        ],
      },
      {
        id: uid(),
        name: 'Electromagnetic Theory',
        topics: [
          {
            id: uid(), name: "Maxwell's Equations", status: 'not-started', masteryScore: 0,
            studyPlan: { pom: 'Derive all 4 equations', rom: 'Explain in Feynman style' },
            flashcards: [], pqps: [], attachments: [],
            vault: { media: [], extractedText: '', flashcards: [] },
          },
        ],
      },
    ],
  },
];

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      subjects: defaultSubjects,

      addSubject: (name, color) =>
        set((s) => ({ subjects: [...s.subjects, { id: uid(), name, color, chapters: [] }] })),

      removeSubject: (id) =>
        set((s) => ({ subjects: s.subjects.filter((sub) => sub.id !== id) })),

      addChapter: (subjectId, name) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id !== subjectId ? sub : { ...sub, chapters: [...sub.chapters, { id: uid(), name, topics: [] }] }
          ),
        })),

      removeChapter: (subjectId, chapterId) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id !== subjectId ? sub : { ...sub, chapters: sub.chapters.filter((c) => c.id !== chapterId) }
          ),
        })),

      addTopic: (subjectId, chapterId, name) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id !== subjectId ? sub : {
              ...sub,
              chapters: sub.chapters.map((c) =>
                c.id !== chapterId ? c : {
                  ...c,
                  topics: [...c.topics, {
                    id: uid(), name, status: 'not-started', masteryScore: 0,
                    studyPlan: { pom: '', rom: '' }, flashcards: [], pqps: [], attachments: [],
                  }],
                }
              ),
            }
          ),
        })),

      removeTopic: (subjectId, chapterId, topicId) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id !== subjectId ? sub : {
              ...sub,
              chapters: sub.chapters.map((c) =>
                c.id !== chapterId ? c : { ...c, topics: c.topics.filter((t) => t.id !== topicId) }
              ),
            }
          ),
        })),

      renameSubject: (subjectId, name) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id !== subjectId ? sub : { ...sub, name }
          ),
        })),

      renameChapter: (subjectId, chapterId, name) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id !== subjectId ? sub : {
              ...sub,
              chapters: sub.chapters.map((c) => c.id !== chapterId ? c : { ...c, name }),
            }
          ),
        })),

      reorderTopics: (subjectId, chapterId, fromIndex, toIndex) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id !== subjectId ? sub : {
              ...sub,
              chapters: sub.chapters.map((c) => {
                if (c.id !== chapterId) return c;
                const topics = [...c.topics];
                const [moved] = topics.splice(fromIndex, 1);
                if (!moved) return c;
                topics.splice(Math.max(0, Math.min(toIndex, topics.length)), 0, moved);
                return { ...c, topics };
              }),
            }
          ),
        })),

      updateTopic: (subjectId, chapterId, topicId, updates) =>
        set((s) => ({
          subjects: mapTopic(s.subjects, subjectId, chapterId, topicId, (t) => {
            const updated = { ...t, ...updates };
            if (updates.status === 'completed' && t.status !== 'completed') {
              updated.completedAt = Date.now();
            }
            return updated;
          }),
        })),

      addFlashcard: (sId, cId, tId, q, a) =>
        set((s) => ({
          subjects: mapTopic(s.subjects, sId, cId, tId, (t) => ({
            ...t,
            flashcards: [...t.flashcards, { id: uid(), q, a, ease: 2.5, nextReview: Date.now(), interval: 1, reps: 0, stability: 0 }],
          })),
        })),

      reviewFlashcard: (sId, cId, tId, cardId, quality) =>
        set((s) => ({
          subjects: mapTopic(s.subjects, sId, cId, tId, (t) => ({
            ...t,
            flashcards: t.flashcards.map((fc) => {
              if (fc.id !== cardId) return fc;
              const updated = calculateNextReview({
                id: fc.id,
                topicId: t.id,
                question: fc.q,
                answer: fc.a,
                easiness: fc.ease,
                interval: fc.interval,
                reps: fc.reps,
                lastReview: Date.now(),
                dueDate: Date.now(),
                stability: fc.stability ?? 0,
              }, quality);
              return {
                ...fc,
                ease: updated.easiness ?? fc.ease,
                interval: updated.interval ?? fc.interval,
                reps: updated.reps ?? fc.reps,
                nextReview: updated.dueDate ?? fc.nextReview,
                stability: updated.stability ?? fc.stability,
              };
            }),
          })),
        })),

      addPQP: (sId, cId, tId, question, solution) =>
        set((s) => ({
          subjects: mapTopic(s.subjects, sId, cId, tId, (t) => ({
            ...t,
            pqps: [...t.pqps, { id: uid(), question, solution, status: 'unattempted' as const }],
          })),
        })),

      togglePQP: (sId, cId, tId, pqpId) =>
        set((s) => ({
          subjects: mapTopic(s.subjects, sId, cId, tId, (t) => ({
            ...t,
            pqps: t.pqps.map((p) =>
              p.id !== pqpId ? p : { ...p, status: p.status === 'unattempted' ? 'mastered' as const : 'unattempted' as const }
            ),
          })),
        })),

      addAttachment: (sId, cId, tId, att) =>
        set((s) => ({
          subjects: mapTopic(s.subjects, sId, cId, tId, (t) => ({
            ...t,
            attachments: [...t.attachments, { ...att, id: uid() }],
          })),
        })),

      addTopicVaultMedia: (sId, cId, tId, media) =>
        set((s) => ({
          subjects: mapTopic(s.subjects, sId, cId, tId, (t) => ({
            ...t,
            vault: {
              ...t.vault,
              media: [...(t.vault?.media ?? []), { ...media, id: uid(), createdAt: Date.now() }],
            },
          })),
        })),

      removeTopicVaultMedia: (sId, cId, tId, mediaId) =>
        set((s) => ({
          subjects: mapTopic(s.subjects, sId, cId, tId, (t) => ({
            ...t,
            vault: {
              ...t.vault,
              media: (t.vault?.media ?? []).filter((m) => m.id !== mediaId),
            },
          })),
        })),

      setTopicExtractedText: (sId, cId, tId, text) =>
        set((s) => ({
          subjects: mapTopic(s.subjects, sId, cId, tId, (t) => ({
            ...t,
            vault: {
              ...t.vault,
              extractedText: text,
            },
          })),
        })),

      addTopicVaultFlashcards: (sId, cId, tId, cards) =>
        set((s) => ({
          subjects: mapTopic(s.subjects, sId, cId, tId, (t) => ({
            ...t,
            vault: {
              ...t.vault,
              flashcards: [
                ...((t.vault?.flashcards) ?? []),
                ...cards.map((c) => ({
                  ...c,
                  id: uid(),
                  question: c.question ?? c.q ?? c.front ?? '',
                  answer: c.answer ?? c.a ?? c.back ?? '',
                  lastReviewed: Date.now(),
                  dueDate: Date.now(),
                  easiness: 2.5,
                  interval: 1,
                  reps: 0,
                  stability: 0,
                })),
              ],
            },
          })),
        })),

      reviewTopicVaultFlashcard: (sId, cId, tId, cardId, isEasy) =>
        set((s) => ({
          subjects: mapTopic(s.subjects, sId, cId, tId, (t) => ({
            ...t,
            vault: {
              ...t.vault,
              flashcards: (t.vault?.flashcards ?? []).map((card) => {
                if (card.id !== cardId) return card;
                const quality = isEasy ? 5 : 3;
                const updated = calculateNextReview({
                  ...card,
                  question: card.question ?? card.q ?? card.front ?? '',
                  answer: card.answer ?? card.a ?? card.back ?? '',
                }, quality);
                return {
                  ...card,
                  easiness: updated.easiness ?? card.easiness,
                  interval: updated.interval ?? card.interval,
                  reps: updated.reps ?? card.reps,
                  lastReview: updated.lastReview ?? card.lastReview,
                  dueDate: updated.dueDate ?? card.dueDate,
                  stability: updated.stability ?? card.stability,
                };
              }),
            },
          })),
        })),


      getStudyTodayTopics: () => {
        const { subjects } = get();
        const results: { subject: Subject; chapter: Chapter; topic: Topic }[] = [];
        const now = Date.now();

        for (const subject of subjects) {
          for (const chapter of subject.chapters) {
            for (const topic of chapter.topics) {
              // Priority 1: Revision due (completed topics after 1, 3, 7 days)
              if (topic.status === 'completed' && topic.completedAt) {
                const daysSince = (now - topic.completedAt) / 86400000;
                if (daysSince >= 1 && daysSince < 2) results.unshift({ subject, chapter, topic });
                else if (daysSince >= 3 && daysSince < 4) results.unshift({ subject, chapter, topic });
                else if (daysSince >= 7 && daysSince < 8) results.unshift({ subject, chapter, topic });
              }
              // Priority 2: Low mastery topics
              if (topic.masteryScore < 50 && topic.status !== 'completed') {
                results.push({ subject, chapter, topic });
              }
              // Priority 3: Flashcards due
              if (topic.flashcards.some((fc) => fc.nextReview <= now)) {
                if (!results.find((r) => r.topic.id === topic.id)) {
                  results.push({ subject, chapter, topic });
                }
              }
            }
          }
        }
        return results;
      },

      getOverallProgress: () => {
        const { subjects } = get();
        let total = 0;
        let completed = 0;
        for (const s of subjects) {
          for (const c of s.chapters) {
            total += c.topics.length;
            completed += c.topics.filter((t) => t.status === 'completed' || t.status === 'revised').length;
          }
        }
        return total === 0 ? 0 : Math.round((completed / total) * 100);
      },

      quickAdd: (subjectName, chapterName, topicName, color) => {
        set((s) => {
          let subjects = [...s.subjects];
          let subject = subjects.find((sub) => sub.name.toLowerCase() === subjectName.toLowerCase());
          if (!subject) {
            subject = { id: uid(), name: subjectName, color: color || '214 100% 50%', chapters: [] };
            subjects = [...subjects, subject];
          }
          const sIdx = subjects.indexOf(subject);
          let chapter = subject.chapters.find((c) => c.name.toLowerCase() === chapterName.toLowerCase());
          if (!chapter) {
            chapter = { id: uid(), name: chapterName, topics: [] };
            subjects[sIdx] = { ...subject, chapters: [...subject.chapters, chapter] };
          }
          const cIdx = subjects[sIdx].chapters.indexOf(chapter);
          const newTopic: Topic = {
            id: uid(), name: topicName, status: 'not-started', masteryScore: 0,
            studyPlan: { pom: '', rom: '' }, flashcards: [], pqps: [], attachments: [],
            vault: { media: [], extractedText: '', flashcards: [] },
          };
          subjects[sIdx] = {
            ...subjects[sIdx],
            chapters: subjects[sIdx].chapters.map((c, i) =>
              i !== cIdx ? c : { ...c, topics: [...c.topics, newTopic] }
            ),
          };
          return { subjects };
        });
      },

      examSections: [],
      addExamSection: (title) =>
        set((s) => ({
          examSections: [...s.examSections, { id: uid(), title, notes: '' }],
        })),

      updateExamSection: (id, updates) =>
        set((s) => ({
          examSections: s.examSections.map((section) =>
            section.id !== id ? section : { ...section, ...updates }
          ),
        })),

      removeExamSection: (id) =>
        set((s) => ({
          examSections: s.examSections.filter((section) => section.id !== id),
        })),

      reorderExamSections: (fromIndex, toIndex) =>
        set((s) => {
          const sections = [...s.examSections];
          const [moved] = sections.splice(fromIndex, 1);
          if (!moved) return { examSections: sections };
          sections.splice(Math.max(0, Math.min(toIndex, sections.length)), 0, moved);
          return { examSections: sections };
        }),
    }),
    { name: 'echos-study-storage' }
  )
);

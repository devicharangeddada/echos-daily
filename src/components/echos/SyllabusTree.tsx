import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, X, BookOpen, Brain, FileText, Timer, Check } from 'lucide-react';
import { useStudyStore, Topic, Subject, Chapter } from '@/store/studyStore';
import { fadeInUp, hoverLift, echosTransition } from '@/lib/motion';

const statusColors: Record<Topic['status'], string> = {
  'not-started': 'bg-muted-foreground',
  'in-progress': 'bg-amber-500',
  'completed': 'bg-emerald-500',
  'revised': 'bg-accent',
};

const TopicWorkspace = ({
  subject, chapter, topic, onClose,
}: {
  subject: Subject; chapter: Chapter; topic: Topic; onClose: () => void;
}) => {
  const [tab, setTab] = useState<'study' | 'recall' | 'practice' | 'focus'>('study');
  const { updateTopic, addFlashcard, reviewFlashcard, addPQP, togglePQP } = useStudyStore();
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [pqpQ, setPqpQ] = useState('');
  const [pqpS, setPqpS] = useState('');
  const [flipped, setFlipped] = useState<string | null>(null);
  const [pomInput, setPomInput] = useState(topic.studyPlan.pom);
  const [romInput, setRomInput] = useState(topic.studyPlan.rom);

  const tabs = [
    { id: 'study' as const, label: 'Study', icon: BookOpen },
    { id: 'recall' as const, label: 'Recall', icon: Brain },
    { id: 'practice' as const, label: 'Practice', icon: FileText },
    { id: 'focus' as const, label: 'Focus', icon: Timer },
  ];

  const dueCards = topic.flashcards.filter((fc) => fc.nextReview <= Date.now());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: echosTransition }}
      exit={{ opacity: 0, y: 20, transition: echosTransition }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="mx-auto max-w-2xl px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-caption uppercase tracking-widest">{subject.name} / {chapter.name}</p>
            <h2 className="text-headline mt-1">{topic.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-2 w-2 rounded-full ${statusColors[topic.status]}`} />
              <span className="text-xs text-muted-foreground capitalize">{topic.status.replace('-', ' ')}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{topic.masteryScore}% mastery</span>
            </div>
          </div>
          <motion.button {...hoverLift} onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
            <X className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Mastery bar */}
        <div className="mb-6 h-1 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `hsl(${subject.color})` }}
            initial={{ width: 0 }}
            animate={{ width: `${topic.masteryScore}%` }}
            transition={echosTransition}
          />
        </div>

        {/* Status buttons */}
        <div className="flex gap-2 mb-6">
          {(['not-started', 'in-progress', 'completed', 'revised'] as const).map((s) => (
            <motion.button
              key={s}
              {...hoverLift}
              onClick={() => updateTopic(subject.id, chapter.id, topic.id, { status: s })}
              className={`flex-1 rounded-full py-2 text-xs font-semibold capitalize ${
                topic.status === s ? 'bg-foreground text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {s.replace('-', ' ')}
            </motion.button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass-card p-1">
          {tabs.map((t) => (
            <motion.button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-medium transition-colors ${
                tab === t.id ? 'bg-foreground text-primary-foreground' : 'text-muted-foreground'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'study' && (
            <motion.div key="study" {...fadeInUp} className="space-y-4">
              <div className="glass-card p-5">
                <label className="text-caption uppercase tracking-widest block mb-2">Plan of Mastery (POM)</label>
                <textarea
                  value={pomInput}
                  onChange={(e) => setPomInput(e.target.value)}
                  onBlur={() => updateTopic(subject.id, chapter.id, topic.id, { studyPlan: { pom: pomInput, rom: romInput } })}
                  className="w-full bg-transparent text-sm text-foreground outline-none resize-none"
                  rows={3}
                  placeholder="What's your study plan?"
                />
              </div>
              <div className="glass-card p-5">
                <label className="text-caption uppercase tracking-widest block mb-2">Revision Outline Method (ROM)</label>
                <textarea
                  value={romInput}
                  onChange={(e) => setRomInput(e.target.value)}
                  onBlur={() => updateTopic(subject.id, chapter.id, topic.id, { studyPlan: { pom: pomInput, rom: romInput } })}
                  className="w-full bg-transparent text-sm text-foreground outline-none resize-none"
                  rows={3}
                  placeholder="How will you revise?"
                />
              </div>
              {/* Mastery slider */}
              <div className="glass-card p-5">
                <label className="text-caption uppercase tracking-widest block mb-3">Mastery Score</label>
                <input
                  type="range"
                  min={0} max={100}
                  value={topic.masteryScore}
                  onChange={(e) => updateTopic(subject.id, chapter.id, topic.id, { masteryScore: Number(e.target.value) })}
                  className="w-full accent-[hsl(var(--accent))]"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{topic.masteryScore}%</p>
              </div>
            </motion.div>
          )}

          {tab === 'recall' && (
            <motion.div key="recall" {...fadeInUp} className="space-y-4">
              <p className="text-caption uppercase tracking-widest">
                {dueCards.length} card{dueCards.length !== 1 ? 's' : ''} due
              </p>

              {dueCards.map((card) => (
                <motion.div
                  key={card.id}
                  {...hoverLift}
                  onClick={() => setFlipped(flipped === card.id ? null : card.id)}
                  className="glass-card p-5 cursor-pointer min-h-[120px] flex flex-col justify-center"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={flipped === card.id ? 'back' : 'front'}
                      initial={{ opacity: 0, rotateX: -90 }}
                      animate={{ opacity: 1, rotateX: 0 }}
                      exit={{ opacity: 0, rotateX: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-caption uppercase tracking-widest mb-2">
                        {flipped === card.id ? 'Answer' : 'Question'}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {flipped === card.id ? card.a : card.q}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {flipped === card.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 mt-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => { reviewFlashcard(subject.id, chapter.id, topic.id, card.id, 2); setFlipped(null); }}
                        className="flex-1 rounded-full py-2 text-xs font-semibold bg-destructive/20 text-destructive"
                      >
                        Hard
                      </button>
                      <button
                        onClick={() => { reviewFlashcard(subject.id, chapter.id, topic.id, card.id, 4); setFlipped(null); }}
                        className="flex-1 rounded-full py-2 text-xs font-semibold bg-amber-500/20 text-amber-500"
                      >
                        Good
                      </button>
                      <button
                        onClick={() => { reviewFlashcard(subject.id, chapter.id, topic.id, card.id, 5); setFlipped(null); }}
                        className="flex-1 rounded-full py-2 text-xs font-semibold bg-emerald-500/20 text-emerald-500"
                      >
                        Easy
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {dueCards.length === 0 && (
                <div className="glass-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">No cards due. Add more below!</p>
                </div>
              )}

              {/* Add flashcard */}
              <div className="glass-card p-4 space-y-2">
                <input
                  value={newQ}
                  onChange={(e) => setNewQ(e.target.value)}
                  placeholder="Question…"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <input
                  value={newA}
                  onChange={(e) => setNewA(e.target.value)}
                  placeholder="Answer…"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <motion.button
                  {...hoverLift}
                  onClick={() => {
                    if (newQ.trim() && newA.trim()) {
                      addFlashcard(subject.id, chapter.id, topic.id, newQ.trim(), newA.trim());
                      setNewQ(''); setNewA('');
                    }
                  }}
                  className="w-full rounded-full py-2 text-xs font-semibold bg-foreground text-primary-foreground"
                >
                  Add Flashcard
                </motion.button>
              </div>
            </motion.div>
          )}

          {tab === 'practice' && (
            <motion.div key="practice" {...fadeInUp} className="space-y-3">
              {topic.pqps.map((pqp) => (
                <motion.div key={pqp.id} {...hoverLift} className="glass-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{pqp.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">{pqp.solution}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => togglePQP(subject.id, chapter.id, topic.id, pqp.id)}
                      className={`ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        pqp.status === 'mastered' ? 'border-emerald-500 bg-emerald-500' : 'border-border'
                      }`}
                    >
                      {pqp.status === 'mastered' && <Check className="h-3 w-3 text-primary-foreground" />}
                    </motion.button>
                  </div>
                </motion.div>
              ))}

              <div className="glass-card p-4 space-y-2">
                <input value={pqpQ} onChange={(e) => setPqpQ(e.target.value)} placeholder="Question…"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <input value={pqpS} onChange={(e) => setPqpS(e.target.value)} placeholder="Solution…"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <motion.button {...hoverLift} onClick={() => {
                  if (pqpQ.trim()) { addPQP(subject.id, chapter.id, topic.id, pqpQ.trim(), pqpS.trim()); setPqpQ(''); setPqpS(''); }
                }} className="w-full rounded-full py-2 text-xs font-semibold bg-foreground text-primary-foreground">
                  Add Problem
                </motion.button>
              </div>
            </motion.div>
          )}

          {tab === 'focus' && (
            <motion.div key="focus" {...fadeInUp} className="glass-card p-8 text-center">
              <p className="text-caption uppercase tracking-widest mb-4">Topic-Linked Pomodoro</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start a focus session for <strong>{topic.name}</strong>. Navigate to the Focus tab and assign this topic's parent task.
              </p>
              <motion.button
                {...hoverLift}
                onClick={() => {
                  updateTopic(subject.id, chapter.id, topic.id, { status: 'in-progress' });
                }}
                className="rounded-full px-6 py-3 bg-foreground text-primary-foreground text-sm font-semibold"
              >
                Mark In Progress
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SyllabusTree = () => {
  const { subjects, addSubject, addChapter, addTopic, quickAdd } = useStudyStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeTopic, setActiveTopic] = useState<{ subject: Subject; chapter: Chapter; topic: Topic } | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [qaSubject, setQaSubject] = useState('');
  const [qaChapter, setQaChapter] = useState('');
  const [qaTopic, setQaTopic] = useState('');

  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const totalTopics = subjects.reduce((sum, s) => sum + s.chapters.reduce((cs, c) => cs + c.topics.length, 0), 0);
  const completedTopics = subjects.reduce(
    (sum, s) => sum + s.chapters.reduce((cs, c) => cs + c.topics.filter((t) => t.status === 'completed' || t.status === 'revised').length, 0), 0
  );

  return (
    <>
      <AnimatePresence>
        {activeTopic && (
          <TopicWorkspace
            subject={activeTopic.subject}
            chapter={activeTopic.chapter}
            topic={activeTopic.topic}
            onClose={() => setActiveTopic(null)}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-2xl px-5 pb-28 pt-14">
        <motion.div {...fadeInUp} className="mb-6">
          <p className="text-subhead uppercase tracking-widest">Syllabus</p>
          <h1 className="text-headline mt-1">Subject Tree</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                animate={{ width: `${totalTopics === 0 ? 0 : (completedTopics / totalTopics) * 100}%` }}
                transition={echosTransition}
              />
            </div>
            <span className="text-xs text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {completedTopics}/{totalTopics}
            </span>
          </div>
        </motion.div>

        <div className="space-y-3">
          {subjects.map((subject) => (
            <motion.div key={subject.id} layout {...fadeInUp} className="glass-card overflow-hidden">
              <motion.button
                onClick={() => toggle(subject.id)}
                className="flex w-full items-center gap-3 px-5 py-4"
                whileTap={{ scale: 0.98 }}
              >
                <div className="h-3 w-3 rounded-full" style={{ background: `hsl(${subject.color})` }} />
                <span className="flex-1 text-left text-[15px] font-medium text-foreground">{subject.name}</span>
                <span className="text-xs text-muted-foreground mr-2">
                  {subject.chapters.reduce((s, c) => s + c.topics.length, 0)} topics
                </span>
                <motion.div animate={{ rotate: expanded[subject.id] ? 90 : 0 }} transition={echosTransition}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {expanded[subject.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1, transition: echosTransition }}
                    exit={{ height: 0, opacity: 0, transition: echosTransition }}
                    className="overflow-hidden border-t border-border"
                  >
                    {subject.chapters.map((chapter) => (
                      <div key={chapter.id}>
                        <motion.button
                          onClick={() => toggle(chapter.id)}
                          className="flex w-full items-center gap-3 px-5 py-3 pl-10"
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div animate={{ rotate: expanded[chapter.id] ? 90 : 0 }} transition={echosTransition}>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </motion.div>
                          <span className="flex-1 text-left text-sm text-foreground">{chapter.name}</span>
                          <span className="text-[10px] text-muted-foreground">{chapter.topics.length}</span>
                        </motion.button>

                        <AnimatePresence>
                          {expanded[chapter.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1, transition: echosTransition }}
                              exit={{ height: 0, opacity: 0, transition: echosTransition }}
                              className="overflow-hidden"
                            >
                              {chapter.topics.map((topic) => (
                                <motion.button
                                  key={topic.id}
                                  {...hoverLift}
                                  onClick={() => setActiveTopic({ subject, chapter, topic })}
                                  className="flex w-full items-center gap-3 px-5 py-2.5 pl-16 hover:bg-secondary/50 transition-colors"
                                >
                                  <div className={`h-2 w-2 rounded-full ${statusColors[topic.status]}`} />
                                  <span className="flex-1 text-left text-sm text-foreground">{topic.name}</span>
                                  <span className="text-[10px] text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {topic.masteryScore}%
                                  </span>
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Quick Add */}
        <AnimatePresence>
          {quickAddOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: echosTransition }}
              exit={{ opacity: 0, y: 8, transition: echosTransition }}
              className="glass-card p-5 mt-6 space-y-3"
            >
              <p className="text-caption uppercase tracking-widest">Quick Add Topic</p>
              <input value={qaSubject} onChange={(e) => setQaSubject(e.target.value)} placeholder="Subject…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground border-b border-border pb-2" />
              <input value={qaChapter} onChange={(e) => setQaChapter(e.target.value)} placeholder="Chapter…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground border-b border-border pb-2" />
              <input value={qaTopic} onChange={(e) => setQaTopic(e.target.value)} placeholder="Topic…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setQuickAddOpen(false)} className="text-xs text-muted-foreground">Cancel</button>
                <motion.button
                  {...hoverLift}
                  onClick={() => {
                    if (qaSubject.trim() && qaChapter.trim() && qaTopic.trim()) {
                      quickAdd(qaSubject.trim(), qaChapter.trim(), qaTopic.trim());
                      setQaSubject(''); setQaChapter(''); setQaTopic(''); setQuickAddOpen(false);
                    }
                  }}
                  className="rounded-full px-4 py-2 bg-foreground text-primary-foreground text-xs font-semibold"
                >
                  Add
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              {...fadeInUp}
              {...hoverLift}
              onClick={() => setQuickAddOpen(true)}
              className="glass-card w-full flex items-center justify-center gap-2 py-4 mt-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs font-medium">Add Subject / Chapter / Topic</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SyllabusTree;

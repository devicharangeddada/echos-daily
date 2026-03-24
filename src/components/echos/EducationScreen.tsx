import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ClipboardList, Link2, StickyNote, Plus, ExternalLink, X } from 'lucide-react';
import { useStore, Task } from '@/store/useStore';
import { fadeInUp, hoverLift, echosTransition } from '@/lib/motion';

const renderRichText = (value: string) => {
  if (!value) return null;
  const parts = value.split(/(\$[^$]+\$)/g);
  return (
    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
      {parts.map((part, idx) => {
        const match = part.match(/^\$(.+)\$$/);
        if (match) {
          return (
            <code key={idx} className="rounded px-1 bg-secondary text-accent font-mono">
              {match[1]}
            </code>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </p>
  );
};

const EducationScreen = () => {
  const { tasks, addTask, updateTask, toggleTask } = useStore();
  const [filterType, setFilterType] = useState<'all' | 'study' | 'homework'>('all');
  const [addingType, setAddingType] = useState<'study' | 'homework' | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [linkInput, setLinkInput] = useState('');

  const eduTasks = tasks.filter((t) => t.category === 'learning' || t.category === 'education');
  const filteredTasks = useMemo(() => {
    if (filterType === 'all') return eduTasks;
    return eduTasks.filter((t) => t.eduType === filterType || t.subCategory === filterType);
  }, [eduTasks, filterType]);

  const completedCount = eduTasks.filter((t) => t.completed).length;
  const totalCount = eduTasks.length;

  const handleAdd = () => {
    if (!newTitle.trim() || !addingType) return;
    addTask({
      title: newTitle.trim(),
      time: null,
      date: new Date().toISOString().split('T')[0],
      category: 'learning',
      subcategory: addingType === 'study' ? 'Study' : 'Homework',
      subCategory: addingType,
      eduType: addingType,
      resources: [],
      notes: '',
    });
    setNewTitle('');
    setAddingType(null);
  };

  const handleAddLink = (taskId: string) => {
    if (!linkInput.trim()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const nextResources = [
        ...(task.resources || []),
        {
          id: crypto.randomUUID(),
          label: `Resource ${((task.resources?.length ?? 0) + 1)}`,
          url: linkInput.trim(),
          type: 'link',
        },
      ];
      updateTask(taskId, { resources: nextResources });
      setLinkInput('');
    }
  };

  const handleSaveNote = (taskId: string) => {
    updateTask(taskId, { notes: noteInput });
    setNoteInput('');
    setActiveTaskId(null);
  };

  const EduCard = ({ task }: { task: Task }) => {
    const isActive = activeTaskId === task.id;
    const stability = task.stability || 0;
    const heatColor = stability < 30 ? 'bg-blue-500/20' : stability < 70 ? 'bg-orange-500/20' : 'bg-green-500/20';

    return (
      <motion.div
        layout
        {...fadeInUp}
        {...hoverLift}
        className={`glass-card p-4 cursor-pointer ${task.completed ? 'opacity-70' : ''} ${heatColor} border-l-4 ${stability < 30 ? 'border-l-blue-500' : stability < 70 ? 'border-l-orange-500' : 'border-l-green-500'}`}
        onClick={() => setActiveTaskId(isActive ? null : task.id)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">{task.subcategory}</span>
            <div className="mt-1 w-full bg-secondary rounded-full h-1">
              <div className="bg-accent h-1 rounded-full" style={{ width: `${stability}%` }}></div>
            </div>
            <span className="text-[10px] text-muted-foreground">{stability}% stable</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
              className="rounded-full p-1 border border-border text-muted-foreground hover:text-foreground"
              whileTap={{ scale: 0.97 }}
            >
              ✓
            </motion.button>
            <span className="text-[10px] text-muted-foreground">{task.time || 'No time'}</span>
          </div>
        </div>

        {task.resources?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {task.resources.map((res) => (
              <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="rounded px-2 py-1 bg-secondary text-xs text-foreground">
                {res.label || res.url}
              </a>
            ))}
          </div>
        )}

        {task.notes && (
          <div className="mt-2 text-xs text-muted-foreground">{renderRichText(task.notes)}</div>
        )}
      </motion.div>
    );
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-28 pt-14">
      <motion.div {...fadeInUp} className="mb-8">
        <p className="text-subhead uppercase tracking-widest">Learning</p>
        <h1 className="text-headline mt-1">Education</h1>
      </motion.div>

      <div className="mb-4 flex gap-2">
        {(['all', 'study', 'homework'] as const).map((option) => (
          <motion.button
            key={option}
            onClick={() => setFilterType(option)}
            whileTap={{ scale: 0.97, transition: echosTransition }}
            className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase ${filterType === option ? 'bg-foreground text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
          >
            {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
          </motion.button>
        ))}
      </div>

      <motion.div {...fadeInUp} className="mb-6 grid grid-cols-2 gap-3">
        <div className="glass-card p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-light text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {completedCount}/{totalCount}
          </span>
          <span className="text-caption mt-1">Completed</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-light text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {totalCount - completedCount}
          </span>
          <span className="text-caption mt-1">Remaining</span>
        </div>
      </motion.div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <EduCard key={task.id} task={task} />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeTask && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: echosTransition }}
            exit={{ opacity: 0, y: 24, transition: echosTransition }}
            className="fixed inset-x-4 bottom-6 z-50 rounded-2xl bg-background p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{activeTask.title}</h3>
              <motion.button onClick={() => setActiveTaskId(null)} className="p-1 text-muted-foreground" whileTap={{ scale: 0.97 }}>
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Rich Notes</label>
              <textarea
                rows={3}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none"
                placeholder="Add notes, use $V=IR$ for formulas"
              />

              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Resource URL</label>
              <input
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none"
              />

              <div className="flex items-center justify-end gap-2">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setActiveTaskId(null)} className="text-xs text-muted-foreground">Cancel</motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (linkInput.trim()) handleAddLink(activeTask.id);
                    if (noteInput.trim()) handleSaveNote(activeTask.id);
                  }}
                  className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-primary-foreground"
                >
                  Save
                </motion.button>
              </div>

              {activeTask.notes && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rendered Notes</div>
                  {renderRichText(activeTask.notes)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addingType ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: echosTransition }}
            exit={{ opacity: 0, y: 8, transition: echosTransition }}
            className="glass-card p-4 mt-6"
          >
            <p className="text-caption uppercase tracking-widest mb-2">
              New {addingType === 'study' ? 'Study' : 'Homework'} Task
            </p>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAddingType(null); }}
              placeholder="Task title…"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none mb-3"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setAddingType(null)} className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={handleAdd} className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-primary-foreground">Add</button>
            </div>
          </motion.div>
        ) : (
          <motion.div {...fadeInUp} className="flex gap-2 mt-6">
            <motion.button {...hoverLift} onClick={() => setAddingType('study')} className="glass-card flex-1 flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-4 w-4" />
              <span className="text-xs font-medium">Study Task</span>
            </motion.button>
            <motion.button {...hoverLift} onClick={() => setAddingType('homework')} className="glass-card flex-1 flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-4 w-4" />
              <span className="text-xs font-medium">Homework</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationScreen;
                {task.resourceLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground hover:opacity-70 transition-opacity"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    Resource {i + 1}
                  </a>
                ))}
              </div>
            )}

            {/* Quick notes */}
            {task.quickNotes && !isEditing && (
              <p className="mt-2 text-xs text-muted-foreground italic">"{task.quickNotes}"</p>
            )}

            {/* Actions */}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => { setEditingId(isEditing ? null : task.id); setNoteInput(task.quickNotes || ''); setLinkInput(''); }}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
              >
                <StickyNote className="h-3 w-3" /> Note
              </button>
              <button
                onClick={() => { setEditingId(isEditing ? null : task.id); setLinkInput(''); setNoteInput(task.quickNotes || ''); }}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
              >
                <Link2 className="h-3 w-3" /> Link
              </button>
            </div>

            {/* Edit panel */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: echosTransition }}
                  exit={{ height: 0, opacity: 0, transition: echosTransition }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  <div className="flex gap-2">
                    <input
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Quick note…"
                      className="flex-1 rounded-lg bg-secondary px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    <button onClick={() => handleSaveNote(task.id)} className="rounded-lg bg-foreground px-2.5 py-1.5 text-[10px] font-medium text-primary-foreground">
                      Save
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 rounded-lg bg-secondary px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddLink(task.id); }}
                    />
                    <button onClick={() => handleAddLink(task.id)} className="rounded-lg bg-foreground px-2.5 py-1.5 text-[10px] font-medium text-primary-foreground">
                      Add
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mx-auto max-w-lg px-5 pb-28 pt-14">
      <motion.div {...fadeInUp} className="mb-8">
        <p className="text-subhead uppercase tracking-widest">Learning</p>
        <h1 className="text-headline mt-1">Education</h1>
      </motion.div>

      {/* Progress bento */}
      <motion.div {...fadeInUp} className="mb-6 grid grid-cols-2 gap-3">
        <div className="glass-card p-5 flex flex-col items-center justify-center">
          <span className="text-3xl font-light text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {completedCount}/{totalCount}
          </span>
          <span className="text-caption mt-1">Completed</span>
        </div>
        <div className="glass-card p-5 flex flex-col items-center justify-center">
          <span className="text-3xl font-light text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {totalCount - completedCount}
          </span>
          <span className="text-caption mt-1">Remaining</span>
        </div>
      </motion.div>

      {/* Study section */}
      <motion.section {...fadeInUp} className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-caption uppercase tracking-widest">Study</h2>
        </div>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {studyTasks.map((t) => <EduCard key={t.id} task={t} />)}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Homework section */}
      <motion.section {...fadeInUp} className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-caption uppercase tracking-widest">Homework</h2>
        </div>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {homeworkTasks.map((t) => <EduCard key={t.id} task={t} />)}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Quick add */}
      <AnimatePresence>
        {addingType ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: echosTransition }}
            exit={{ opacity: 0, y: 8, transition: echosTransition }}
            className="glass-card p-4"
          >
            <p className="text-caption uppercase tracking-widest mb-2">
              New {addingType === 'study' ? 'Study' : 'Homework'} Task
            </p>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAddingType(null); }}
              placeholder="Task title…"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none mb-3"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setAddingType(null)} className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={handleAdd} className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-primary-foreground">Add</button>
            </div>
          </motion.div>
        ) : (
          <motion.div {...fadeInUp} className="flex gap-2">
            <motion.button {...hoverLift} onClick={() => setAddingType('study')}
              className="glass-card flex-1 flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-4 w-4" /><span className="text-xs font-medium">Study Task</span>
            </motion.button>
            <motion.button {...hoverLift} onClick={() => setAddingType('homework')}
              className="glass-card flex-1 flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-4 w-4" /><span className="text-xs font-medium">Homework</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationScreen;

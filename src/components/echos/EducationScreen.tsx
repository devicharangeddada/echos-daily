import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ClipboardList, Link2, StickyNote, Plus, ExternalLink } from 'lucide-react';
import { useStore, Task } from '@/store/useStore';
import { fadeInUp, hoverLift, echosTransition } from '@/lib/motion';

const EducationScreen = () => {
  const { tasks, addTask, updateTask, toggleTask } = useStore();
  const [addingType, setAddingType] = useState<'study' | 'homework' | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [linkInput, setLinkInput] = useState('');

  const eduTasks = tasks.filter((t) => t.category === 'learning');
  const studyTasks = eduTasks.filter((t) => t.eduType === 'study');
  const homeworkTasks = eduTasks.filter((t) => t.eduType === 'homework');

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
      eduType: addingType,
      resourceLinks: [],
      quickNotes: '',
    });
    setNewTitle('');
    setAddingType(null);
  };

  const handleAddLink = (taskId: string) => {
    if (!linkInput.trim()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      updateTask(taskId, { resourceLinks: [...(task.resourceLinks || []), linkInput.trim()] });
      setLinkInput('');
    }
  };

  const handleSaveNote = (taskId: string) => {
    updateTask(taskId, { quickNotes: noteInput });
    setEditingId(null);
    setNoteInput('');
  };

  const EduCard = ({ task }: { task: Task }) => {
    const isEditing = editingId === task.id;
    return (
      <motion.div layout {...fadeInUp} {...hoverLift} className="glass-card p-4">
        <div className="flex items-start gap-3">
          <motion.button
            onClick={() => toggleTask(task.id)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              task.completed ? 'border-foreground bg-foreground' : 'border-border'
            }`}
            whileTap={{ scale: 0.9 }}
          >
            {task.completed && (
              <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
          </motion.button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">{task.subcategory}</span>

            {/* Resource links */}
            {task.resourceLinks && task.resourceLinks.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
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

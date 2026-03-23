import { useEffect, useMemo, useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, BookOpen, Sparkles } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import { useStore } from '@/store/useStore';
import { vaultDB, uploadPDF, getAllPDFs, addSyllabusNode, getSyllabusTree, SyllabusNode } from '@/store/vaultDB';
import { echosTransition, hoverLift, fadeInUp } from '@/lib/motion';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';

const createDueFlashcards = (note: string) => {
  const lines = note.split('\n').filter(Boolean);
  return lines.slice(0, 3).map((raw, i) => ({
    id: `${crypto.randomUUID()}-${i}`,
    front: raw.slice(0, 80),
    back: raw,
    tags: ['auto'],
    easiness: 2.5,
    interval: 1,
    reps: 0,
    lastReview: 0,
    dueDate: Date.now(),
  }));
};

const ExamHub = () => {
  const { examDate, setExamDate, xp, level, streak, setLockdown, lockdown } = useStore();
  const [pdfFiles, setPdfFiles] = useState<any[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [notes, setNotes] = useState('');
  const [flashcards, setFlashcards] = useState<Array<any>>([]);
  const [syllabus, setSyllabus] = useState<SyllabusNode[]>([]);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const [waiting, setWaiting] = useState(false);

  const loadSyllabus = async () => {
    const items = await getSyllabusTree();
    setSyllabus(items);
  };

  useEffect(() => {
    loadSyllabus();
    getAllPDFs().then(setPdfFiles);
  }, []);

  useEffect(() => {
    if (!selectedPdfId || pdfFiles.length === 0) return;
    const chosen = pdfFiles.find((p) => p.id === selectedPdfId);
    if (!chosen) return;
    pdfjsLib.getDocument({ data: chosen.data }).promise.then((doc) => {
      setPdfDoc(doc);
      setPageNum(1);
    });
  }, [selectedPdfId, pdfFiles]);

  useEffect(() => {
    if (!pdfDoc) return;
    const renderPage = async () => {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.1 });
      const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
    };
    renderPage();
  }, [pdfDoc, pageNum]);

  const secondsLeft = useMemo(() => {
    const delta = Math.max(0, new Date(examDate).getTime() - Date.now());
    return Math.floor(delta / 1000);
  }, [examDate]);

  const countdown = useMemo(() => {
    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);
    const mins = Math.floor((secondsLeft % 3600) / 60);
    const secs = secondsLeft % 60;
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  }, [secondsLeft]);

  useEffect(() => {
    const id = window.setInterval(() => { /** force update */ setWaiting((x) => !x); }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const handlePdfUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const id = await uploadPDF(file.name, buffer);
    const list = await getAllPDFs();
    setPdfFiles(list);
    setSelectedPdfId(id);
  };

  const onToggleTopic = async (id: string, field: 'read' | 'practiced' | 'mastered') => {
    const idx = syllabus.findIndex((s) => s.id === id);
    if (idx < 0) return;
    syllabus[idx] = { ...syllabus[idx], [field]: !syllabus[idx][field] };
    await vaultDB.syllabus.update(id, { [field]: syllabus[idx][field] });
    setSyllabus([...syllabus]);
  };

  const syllabusTree = useMemo(() => {
    const subjects = Array.from(new Set(syllabus.map((item) => item.subject)));
    return subjects.map((subject) => ({
      subject,
      chapters: syllabus.filter((item) => item.subject === subject),
    }));
  }, [syllabus]);

  const playPop = () => {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.stop(ctx.currentTime + 0.2);
  };

  const transformHum = (enabled: boolean) => {
    if (!enabled) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 50;
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => { osc.stop(); }, 60000);
  };

  const [hum, setHum] = useState(false);
  const [whiteNoise, setWhiteNoise] = useState(false);

  useEffect(() => {
    if (hum) transformHum(true);
    if (whiteNoise) {
      const ctx = new AudioContext();
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.02;
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      return () => noise.stop();
    }
    return;
  }, [hum, whiteNoise]);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-28 pt-14 text-white">
      <motion.div {...fadeInUp} className="glass-card rounded-[2rem] p-6 mb-6 bg-black/40 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase text-accent">Exam Date Countdown</p>
            <h2 className="text-3xl font-bold tracking-tight">{countdown}</h2>
            <p className="text-sm text-muted-foreground">Target: {examDate}</p>
          </div>
          <div>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeInUp} className="glass-card rounded-[2rem] p-6 mb-6 bg-black/40 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold">EchOS Streak + XP</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[2rem] bg-white/10 p-4 text-center">
            <p className="text-xs uppercase text-muted-foreground">XP</p>
            <p className="text-2xl font-bold">{xp}</p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-4 text-center">
            <p className="text-xs uppercase text-muted-foreground">Level</p>
            <p className="text-2xl font-bold">{level}</p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-4 text-center">
            <p className="text-xs uppercase text-muted-foreground">Streak</p>
            <p className="text-2xl font-bold">{streak}</p>
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeInUp} className="glass-card rounded-[2rem] p-6 mb-6 bg-black/40 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">PDF Workspace</h3>
          <input type="file" onChange={handlePdfUpload} accept="application/pdf" className="text-xs" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-[2rem] overflow-hidden bg-black/50 border border-white/10 p-2">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-accent" />
              <select value={selectedPdfId ?? ''} onChange={(e) => setSelectedPdfId(e.target.value)} className="rounded-md bg-white/10 text-white p-2">
                <option value="">Select PDF</option>
                {pdfFiles.map((pdf) => <option key={pdf.id} value={pdf.id}>{pdf.name}</option>)}
              </select>
            </div>
            <canvas id="pdf-canvas" className="w-full border border-white/10 rounded-[1rem]" />
            <div className="mt-2 flex justify-between">
              <button onClick={() => setPageNum(Math.max(1, pageNum - 1))} className="btn">Prev</button>
              <span>{pageNum}/{pdfDoc?.numPages ?? 0}</span>
              <button onClick={() => setPageNum(Math.min(pdfDoc?.numPages ?? 1, pageNum + 1))} className="btn">Next</button>
            </div>
          </div>
          <div className="glass-card rounded-[2rem] overflow-hidden bg-black/50 border border-white/10 p-4">
            <h4 className="text-sm font-semibold mb-2">Notes / Flashcards</h4>
            <textarea
              className="w-full rounded-[1rem] bg-white/10 p-3 text-xs h-40"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write summary and hit generate"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold"
                onClick={async () => {
                  setFlashcards((prev) => [...prev, ...createDueFlashcards(notes)]);
                  setNotes('');
                }}
              >Generate from Note</button>
              <button
                className="rounded-xl bg-white/10 px-3 py-2 text-xs"
                onClick={() => setFlashcards([])}
              >Clear</button>
            </div>
            <div className="mt-3 space-y-2 max-h-44 overflow-y-auto">
              {flashcards.map((card) => (
                <motion.div key={card.id} {...hoverLift} className="rounded-xl bg-white/10 p-2 text-xs">
                  <p className="font-semibold">Q: {card.front}</p>
                  <p>A: {card.back}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeInUp} className="glass-card rounded-[2rem] p-6 bg-black/40 border border-white/10 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-accent" />
          <h3 className="text-lg font-semibold">Syllabus Tracker</h3>
          <span className="text-xs text-muted-foreground ml-auto">Click subject to expand</span>
        </div>

        {syllabusTree.map((subject) => (
          <div key={subject.subject} className="mb-3">
            <motion.button
              layoutId={`subject-${subject.subject}`}
              onClick={() => setExpandedSubject(expandedSubject === subject.subject ? null : subject.subject)}
              className="w-full flex items-center justify-between rounded-[1rem] bg-white/10 p-3"
              whileTap={{ scale: 0.97 }}
            >
              <span>{subject.subject}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSubject === subject.subject ? 'rotate-180' : ''}`} />
            </motion.button>
            <AnimatePresence>
              {expandedSubject === subject.subject && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: echosTransition }}
                  exit={{ height: 0, opacity: 0, transition: echosTransition }}
                  className="mt-2 space-y-2 overflow-hidden"
                >
                  {subject.chapters.map((topic) => (
                    <div key={topic.id} className="rounded-xl bg-white/5 p-3">
                      <div className="font-semibold text-sm">{topic.chapter} / {topic.topic}</div>
                      <div className="mt-2 flex gap-2">
                        {(['read', 'practiced', 'mastered'] as const).map((field) => (
                          <button
                            key={field}
                            onClick={() => onToggleTopic(topic.id, field)}
                            className={`rounded-full px-3 py-1 text-[10px] ${topic[field] ? 'bg-accent text-black' : 'bg-white/10 text-white'}`}
                          >
                            {field}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => setLockdown(!lockdown)} className="rounded-xl bg-white/10 px-3 py-2 text-xs">{lockdown ? 'Disable' : 'Enable'} Lockdown</button>
          {lockdown && <span className="text-xs text-accent">Distraction-free mode engaged</span>}
        </div>
      </motion.div>
    </div>
  );
};

export default ExamHub;

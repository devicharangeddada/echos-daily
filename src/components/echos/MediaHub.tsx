import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FileText, ImageIcon, Eye, Sparkles } from 'lucide-react';
import { useStudyStore, VaultMedia } from '@/store/studyStore';
import { compressImageToDataUrl, fileToDataUrl } from '@/lib/media-compressor';
import { extractTextFromImage } from '@/lib/ocr-worker';
import { addMaterial } from '@/store/vaultDB';

interface MediaHubProps {
  subjectId: string;
  chapterId: string;
  topicId: string;
}

const MediaHub = ({ subjectId, chapterId, topicId }: MediaHubProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<VaultMedia | null>(null);

  const topic = useStudyStore((s) =>
    s.subjects
      .find((sub) => sub.id === subjectId)
      ?.chapters
      .find((ch) => ch.id === chapterId)
      ?.topics
      .find((t) => t.id === topicId)
  );

  const vault = topic?.vault ?? { media: [], extractedText: '', flashcards: [] };
  const addMedia = useStudyStore((s) => s.addTopicVaultMedia);
  const setText = useStudyStore((s) => s.setTopicExtractedText);

  const loadFile = async (file: File) => {
    setIsIndexing(true);
    try {
      let dataUrl: string;
      const type = file.type.startsWith('image/') ? 'image' : 'pdf';
      if (type === 'image') {
        dataUrl = await compressImageToDataUrl(file, 1280);
      } else {
        dataUrl = await fileToDataUrl(file);
      }

      await addMedia(subjectId, chapterId, topicId, {
        type,
        data: dataUrl,
        label: file.name,
      });

      // Local-first vault material store in IndexedDB
      try {
        await addMaterial({
          topicId,
          fileName: file.name,
          fileType: type,
          fileBlob: file,
          ocrText: type === 'image' ? (await extractTextFromImage(dataUrl)) : '',
        });
      } catch (dexieError) {
        console.error('Failed to persist media in indexedDB', dexieError);
      }

      if (type === 'image') {
        const extracted = await extractTextFromImage(dataUrl);
        const mergedText = `${topic?.vault.extractedText ?? ''}\n${extracted}`.trim();
        setText(subjectId, chapterId, topicId, mergedText);
      }
    } catch (error) {
      console.error('Error loading media', error);
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Media Vault</h2>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background hover:brightness-90 transition"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={async (e) => {
          if (!e.target.files?.length) return;
          const file = e.target.files[0];
          await loadFile(file);
          e.target.value = '';
        }}
      />

      {isIndexing && (
        <div className="rounded-xl bg-secondary p-2 text-xs text-muted-foreground">
          <div className="mb-1">Indexing knowledge...</div>
          <div className="h-2 w-full rounded-full bg-secondary/50"><div className="h-2 w-3/4 rounded-full bg-accent animate-pulse" /></div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {vault.media.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            <ImageIcon className="mx-auto mb-2 h-6 w-6" />
            No media yet. Upload images or PDFs to start.
          </div>
        )}

        {vault.media.map((item) => (
          <motion.button
            key={item.id}
            layoutId={item.id}
            onClick={() => setSelectedMedia(item)}
            type="button"
            className="group relative overflow-hidden rounded-xl border border-border bg-secondary p-2 text-left hover:border-accent"
          >
            <div className="h-28 overflow-hidden rounded-lg bg-black/5 flex items-center justify-center">
              {item.type === 'image' ? (
                <img src={item.data} alt={item.label} className="h-full w-full object-cover" />
              ) : (
                <FileText className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <p className="mt-2 truncate text-xs font-medium text-foreground">{item.label}</p>
            <p className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
          </motion.button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-secondary p-4">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          {vault.extractedText ? 'OCR extracted text' : 'No OCR data yet'}
        </div>
        <p className="max-h-32 overflow-auto text-sm leading-relaxed text-foreground whitespace-pre-wrap">{vault.extractedText || 'When image notes are added, text will appear here for generation.'}</p>
      </div>

      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-black/40 backdrop-blur-xl p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div layoutId={selectedMedia.id} className="relative w-full max-w-3xl rounded-2xl border border-white/20 bg-background p-4 shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="mb-3 text-lg font-semibold">{selectedMedia.label}</h3>
              {selectedMedia.type === 'image' ? (
                <img src={selectedMedia.data} alt={selectedMedia.label} className="h-[70vh] w-full object-contain" />
              ) : (
                <iframe
                  src={selectedMedia.data}
                  title={selectedMedia.label}
                  className="h-[70vh] w-full rounded-lg border"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaHub;

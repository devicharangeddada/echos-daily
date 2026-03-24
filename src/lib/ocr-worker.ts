import { createWorker } from 'tesseract.js';

const worker = createWorker({
  logger: (m) => {
    // optional progress updates
    // console.debug('Tesseract', m);
  },
});

let initialized = false;

export const ensureOcrWorker = async () => {
  if (!initialized) {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    initialized = true;
  }
};

export const extractTextFromImage = async (dataUrl: string): Promise<string> => {
  await ensureOcrWorker();
  const { data } = await worker.recognize(dataUrl);
  return data.text.trim();
};

export const terminateOcrWorker = async () => {
  if (initialized) {
    await worker.terminate();
    initialized = false;
  }
};

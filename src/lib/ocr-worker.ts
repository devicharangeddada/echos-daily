// Lightweight OCR stub — uses canvas-based text extraction
// For production, integrate Tesseract.js or a cloud OCR API

let initialized = false;

export const ensureOcrWorker = async () => {
  initialized = true;
};

export const extractTextFromImage = async (dataUrl: string): Promise<string> => {
  // Basic canvas-based approach: return empty string as placeholder
  // In production, use Tesseract.js: npm install tesseract.js
  console.info('OCR: Image received for processing. Install tesseract.js for full OCR support.');
  return '';
};

export const terminateOcrWorker = async () => {
  initialized = false;
};

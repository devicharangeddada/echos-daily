import { pipeline } from '@xenova/transformers';

export const textToEmbedding = async (text: string): Promise<number[]> => {
  const modelName = 'sentence-transformers/all-MiniLM-L6-v2';
  const model = await pipeline('feature-extraction', modelName);
  const result = await model(text, { pooling: 'mean' }) as any;
  // result may be [embedding] or nested; normalize to vector
  if (Array.isArray(result) && result.length > 0) {
    const vec = Array.isArray(result[0]) ? result[0] : result;
    return (vec as number[]).map((n) => Number(n) || 0);
  }
  return [];
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

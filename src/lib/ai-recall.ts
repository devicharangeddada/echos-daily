import { pipeline } from '@xenova/transformers';

// Cache for the embedding model
let embeddingModel: any = null;

// Initialize the embedding model
async function getEmbeddingModel() {
  if (!embeddingModel) {
    try {
      embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    } catch (error) {
      console.warn('Transformers.js not available, falling back to keyword density');
      return null;
    }
  }
  return embeddingModel;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Extract embeddings using transformers.js
async function getEmbeddings(text: string): Promise<number[]> {
  const model = await getEmbeddingModel();
  if (!model) return [];

  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// Keyword density algorithm fallback
function calculateKeywordDensity(userRecall: string, extractedText: string): number {
  // Extract key engineering terms (this could be expanded with a more comprehensive list)
  const keyTerms = [
    'algorithm', 'function', 'variable', 'class', 'method', 'interface', 'data', 'structure',
    'complexity', 'time', 'space', 'optimization', 'recursion', 'iteration', 'array', 'list',
    'tree', 'graph', 'hash', 'sort', 'search', 'dynamic', 'programming', 'greedy', 'backtracking',
    'database', 'query', 'index', 'join', 'transaction', 'normalization', 'schema', 'table',
    'network', 'protocol', 'tcp', 'udp', 'http', 'encryption', 'authentication', 'security',
    'circuit', 'voltage', 'current', 'resistance', 'capacitance', 'inductance', 'frequency',
    'amplitude', 'phase', 'signal', 'modulation', 'filter', 'amplifier', 'oscillator',
    'thermodynamics', 'entropy', 'energy', 'heat', 'work', 'pressure', 'volume', 'temperature',
    'force', 'mass', 'acceleration', 'velocity', 'momentum', 'impulse', 'torque', 'equilibrium',
    'chemical', 'reaction', 'bond', 'molecule', 'atom', 'electron', 'proton', 'neutron', 'isotope',
    'oxidation', 'reduction', 'acid', 'base', 'ph', 'concentration', 'solution', 'precipitate'
  ];

  const userWords = userRecall.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const extractedWords = extractedText.toLowerCase().split(/\s+/).filter(word => word.length > 2);

  let matches = 0;
  const totalKeyTerms = keyTerms.length;

  // Count how many key terms appear in both texts
  keyTerms.forEach(term => {
    const inUserRecall = userWords.some(word => word.includes(term) || term.includes(word));
    const inExtractedText = extractedWords.some(word => word.includes(term) || term.includes(word));

    if (inUserRecall && inExtractedText) {
      matches++;
    }
  });

  // Calculate density score (0-100)
  return Math.min(100, (matches / totalKeyTerms) * 100);
}

// Main comparison function
export async function compareRecall(userRecall: string, extractedText: string): Promise<{
  similarityScore: number;
  suggestedQuality: number;
  method: 'embeddings' | 'keyword-density';
}> {
  let similarityScore = 0;
  let method: 'embeddings' | 'keyword-density' = 'keyword-density';

  try {
    // Try embeddings first
    const [userEmbedding, textEmbedding] = await Promise.all([
      getEmbeddings(userRecall),
      getEmbeddings(extractedText)
    ]);

    if (userEmbedding.length > 0 && textEmbedding.length > 0) {
      const similarity = cosineSimilarity(userEmbedding, textEmbedding);
      similarityScore = Math.round(similarity * 100);
      method = 'embeddings';
    } else {
      throw new Error('Embeddings failed');
    }
  } catch (error) {
    // Fallback to keyword density
    similarityScore = calculateKeywordDensity(userRecall, extractedText);
    method = 'keyword-density';
  }

  // Suggest quality based on similarity score
  // Score > 80% = Perfect recall (Quality 5)
  // Score > 60% = Good recall (Quality 4)
  // Score > 40% = Moderate recall (Quality 3)
  // Score > 20% = Poor recall (Quality 2)
  // Score <= 20% = Complete blackout (Quality 1)
  let suggestedQuality = 1;
  if (similarityScore > 80) suggestedQuality = 5;
  else if (similarityScore > 60) suggestedQuality = 4;
  else if (similarityScore > 40) suggestedQuality = 3;
  else if (similarityScore > 20) suggestedQuality = 2;

  return {
    similarityScore,
    suggestedQuality,
    method
  };
}
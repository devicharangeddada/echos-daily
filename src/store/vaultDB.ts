import Dexie, { Table } from 'dexie';

export interface VaultPDF {
  id: string;
  name: string;
  createdAt: number;
  data: Uint8Array;
}

export interface VaultSubject {
  id: string;
  name: string;
  color: string;
}

export interface VaultMaterial {
  id: string;
  topicId: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  fileBlob: Blob;
  ocrText: string;
  createdAt: number;
}

export interface VaultFlashcard {
  id: string;
  topicId: string;
  question?: string;
  answer?: string;
  front?: string;
  back?: string;
  easiness: number;
  interval: number;
  reps: number;
  lastReview: number;
  dueDate: number;
  stability: number;
}

export interface SyllabusNode {
  id: string;
  parentId: string | null;
  subject: string;
  chapter: string;
  topic: string;
  read: boolean;
  practiced: boolean;
  mastered: boolean;
}

class VaultDB extends Dexie {
  pdfs!: Table<VaultPDF, string>;
  syllabus!: Table<SyllabusNode, string>;
  flashcards!: Table<VaultFlashcard, string>;
  subjects!: Table<VaultSubject, string>;
  materials!: Table<VaultMaterial, string>;

  constructor() {
    super('echos-vault-db');
    this.version(3).stores({
      pdfs: 'id, name, createdAt',
      subjects: 'id, name, color',
      syllabus: 'id, parentId, subject, chapter, topic',
      materials: 'id, topicId, fileName, fileType, createdAt',
      flashcards: 'id, topicId, dueDate, reps, easiness, interval, stability',
    }).upgrade((tx) => {
      // Add stability field to existing flashcards if missing
      return tx.table('flashcards').toCollection().modify((card: any) => {
        if (card.stability === undefined) card.stability = 0;
        if (card.easiness === undefined) card.easiness = 2.5;
        if (card.interval === undefined) card.interval = 1;
        if (card.reps === undefined) card.reps = 0;
        if (card.dueDate === undefined) card.dueDate = Date.now();
      });
    });
  }
}


export const vaultDB = new VaultDB();

export const uploadPDF = async (name: string, buffer: ArrayBuffer) => {
  const id = crypto.randomUUID();
  const data = new Uint8Array(buffer);
  await vaultDB.pdfs.add({ id, name, createdAt: Date.now(), data });
  return id;
};

export const getAllPDFs = async () => vaultDB.pdfs.toArray();

export const addSubject = async (subject: Omit<VaultSubject, 'id'>) => {
  const id = crypto.randomUUID();
  await vaultDB.subjects.add({ ...subject, id });
  return id;
};

export const getAllSubjects = async () => vaultDB.subjects.toArray();

export const addMaterial = async (material: Omit<VaultMaterial, 'id' | 'createdAt'>) => {
  const id = crypto.randomUUID();
  await vaultDB.materials.add({ ...material, id, createdAt: Date.now() });
  return id;
};

export const getMaterialsByTopic = async (topicId: string) =>
  vaultDB.materials.where('topicId').equals(topicId).toArray();

export const addSyllabusNode = async (node: Omit<SyllabusNode, 'id'>) => {
  const id = crypto.randomUUID();
  await vaultDB.syllabus.add({ ...node, id });
  return id;
};

export const getSyllabusTree = async () => vaultDB.syllabus.toArray();

export const addFlashcard = async (card: Omit<VaultFlashcard, 'id'>) => {
  const id = crypto.randomUUID();
  const normalized = {
    ...card,
    id,
    stability: card.stability ?? 0,
    question: card.question ?? card.front ?? '',
    answer: card.answer ?? card.back ?? '',
  };
  await vaultDB.flashcards.add(normalized);
  return id;
};

export const getDueFlashcards = async (limit = 20) =>
  vaultDB.flashcards
    .where('dueDate')
    .belowOrEqual(Date.now())
    .sortBy('dueDate')
    .then((cards) => cards.slice(0, limit));

export const updateFlashcard = async (id: string, updates: Partial<VaultFlashcard>) =>
  vaultDB.flashcards.update(id, updates);

export const getFlashcardsByTopic = async (topicId: string) =>
  vaultDB.flashcards.where('topicId').equals(topicId).sortBy('dueDate');

export const getFlashcardById = async (id: string) =>
  vaultDB.flashcards.get(id);


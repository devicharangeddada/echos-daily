import Dexie, { Table } from 'dexie';

export interface VaultPDF {
  id: string;
  name: string;
  createdAt: number;
  data: Uint8Array;
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

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  tags: string[];
  easiness: number;
  interval: number;
  reps: number;
  lastReview: number;
  dueDate: number;
  stability: number; // 0-100
}

class VaultDB extends Dexie {
  pdfs!: Table<VaultPDF, string>;
  syllabus!: Table<SyllabusNode, string>;
  flashcards!: Table<FlashcardItem, string>;

  constructor() {
    super('echos-vault-db');
    this.version(2).stores({
      pdfs: 'id, name, createdAt',
      syllabus: 'id, parentId, subject, chapter, topic',
      flashcards: 'id, dueDate, reps, easiness, tags, stability',
    }).upgrade((tx) => {
      // Add stability field to existing flashcards
      return tx.table('flashcards').toCollection().modify((card: any) => {
        card.stability = 0;
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

export const addSyllabusNode = async (node: Omit<SyllabusNode, 'id'>) => {
  const id = crypto.randomUUID();
  await vaultDB.syllabus.add({ ...node, id });
  return id;
};

export const getSyllabusTree = async () => vaultDB.syllabus.toArray();

export const addFlashcard = async (card: Omit<FlashcardItem, 'id'>) => {
  const id = crypto.randomUUID();
  await vaultDB.flashcards.add({ ...card, id, stability: 0 });
  return id;
};

export const getDueFlashcards = async (limit = 20) =>
  vaultDB.flashcards
    .where('dueDate')
    .belowOrEqual(Date.now())
    .sortBy('dueDate')
    .then((cards) => cards.slice(0, limit));

export const updateFlashcard = async (id: string, updates: Partial<FlashcardItem>) =>
  vaultDB.flashcards.update(id, updates);

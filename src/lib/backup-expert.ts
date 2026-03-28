import { vaultDB } from '@/store/vaultDB';

const blobToBase64 = (blob: Blob | Uint8Array): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob instanceof Uint8Array ? new Blob([blob]) : blob);
  });
};

export const exportFullBackup = async () => {
  const backupData: any = {
    timestamp: new Date().toISOString(),
    localStorage: localStorage.getItem('echos-storage'),
    database: {},
  };

  const tables = ['pdfs', 'syllabus', 'flashcards', 'subjects', 'materials', 'reviews'];

  for (const table of tables) {
    const data = await (vaultDB as any)[table].toArray();
    backupData.database[table] = await Promise.all(
      data.map(async (row: any) => {
        const clone = { ...row };
        if (clone.data instanceof Uint8Array || clone.data instanceof Blob) {
          clone.data = await blobToBase64(clone.data);
        }
        return clone;
      }),
    );
  }

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `EchOS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

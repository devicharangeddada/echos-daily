import { vaultDB } from '@/store/vaultDB';

export const importFullBackup = async (file: File) => {
  const reader = new FileReader();

  reader.onload = async (e) => {
    const data = JSON.parse(e.target?.result as string);

    if (data.localStorage) {
      localStorage.setItem('echos-storage', data.localStorage);
    }

    for (const [tableName, rows] of Object.entries<any>(data.database || {})) {
      if (!(vaultDB as any)[tableName]) continue;
      await (vaultDB as any)[tableName].clear();
      await (vaultDB as any)[tableName].bulkAdd(rows || []);
    }

    window.location.reload();
  };

  reader.readAsText(file);
};

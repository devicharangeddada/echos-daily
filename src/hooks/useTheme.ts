import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

const applyThemeClass = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light-theme');
  } else if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light-theme');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
      root.classList.remove('light-theme');
    } else {
      root.classList.remove('dark');
      root.classList.add('light-theme');
    }
  }
};

export const useTheme = () => {
  const theme = useStore((s) => s.settings.theme);

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);
};

import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'dark' | 'light';

// 🤖 [IA] - v1.1.0: Updated to use enhanced useLocalStorage with error handling
export function useTheme() {
  const [theme, setTheme, { error, isAvailable }] = useLocalStorage<Theme>('theme', 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // 🤖 [IA] - Log warning if localStorage is unavailable
  useEffect(() => {
    if (!isAvailable && process.env.NODE_ENV === 'development') {
      console.warn('localStorage is not available. Theme changes will not persist.');
    }
  }, [isAvailable]);

  return { theme, setTheme, toggleTheme, isLocalStorageAvailable: isAvailable, localStorageError: error };
}
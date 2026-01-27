/**
 * 🤖 [IA] - Hook para gestión de tema dark/light - v1.1.0
 * 
 * @description
 * Hook que gestiona el tema visual de la aplicación (dark/light).
 * Persiste la preferencia en localStorage y aplica la clase al documento HTML.
 * Incluye manejo de errores si localStorage no está disponible.
 * 
 * @example
 * ```tsx
 * const { theme, toggleTheme, setTheme } = useTheme();
 * 
 * // Toggle entre dark y light
 * <button onClick={toggleTheme}>
 *   Cambiar a {theme === 'dark' ? 'light' : 'dark'}
 * </button>
 * 
 * // Establecer tema específico
 * setTheme('dark');
 * ```
 * 
 * @returns Objeto con tema actual y funciones de control
 * 
 * @property {Theme} theme - Tema actual ('dark' | 'light')
 * @property {function} setTheme - Establece un tema específico
 * @property {function} toggleTheme - Alterna entre dark y light
 * @property {boolean} isLocalStorageAvailable - Si localStorage está disponible
 * @property {string | null} localStorageError - Error de localStorage si existe
 */
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'dark' | 'light';

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
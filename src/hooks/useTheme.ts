/**
 * 🤖 [IA] - Hook para gestión de tema dark/light - v2.8.3
 *
 * @description
 * Hook que gestiona el tema visual de la aplicación (dark/light).
 * Persiste la preferencia en localStorage y aplica la clase al documento HTML.
 * Detecta automáticamente la preferencia del sistema operativo (prefers-color-scheme).
 *
 * Prioridad de tema:
 * 1. Preferencia guardada en localStorage
 * 2. Preferencia del sistema operativo (prefers-color-scheme)
 * 3. Dark mode por defecto (diseño original Paradise)
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme, setTheme, isDark, isLight } = useTheme();
 *
 * // Toggle entre dark y light
 * <button onClick={toggleTheme}>
 *   {isDark ? <Sun /> : <Moon />}
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
 * @property {boolean} isDark - True si tema actual es dark
 * @property {boolean} isLight - True si tema actual es light
 * @property {boolean} isLocalStorageAvailable - Si localStorage está disponible
 * @property {string | null} localStorageError - Error de localStorage si existe
 */
import { useEffect, useCallback, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Theme = 'dark' | 'light';

// 🤖 [IA] - v2.8.3: Función para detectar preferencia inicial del sistema
const getSystemPreference = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark'; // Default Paradise design
};

export function useTheme() {
  // 🤖 [IA] - v2.8.3: Detectar si hay preferencia guardada, sino usar preferencia del sistema
  const systemPreference = getSystemPreference();
  const [theme, setThemeStorage, { error, isAvailable }] = useLocalStorage<Theme>('cashguard-theme', systemPreference);

  // 🤖 [IA] - v2.8.3: Estado para rastrear si es primera carga (sin preferencia guardada)
  const [isInitialized, setIsInitialized] = useState(false);

  // 🤖 [IA] - v2.8.3: Aplicar tema al documento HTML
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  }, []);

  // Aplicar tema cuando cambia
  useEffect(() => {
    applyTheme(theme);
    setIsInitialized(true);
  }, [theme, applyTheme]);

  // 🤖 [IA] - v2.8.3: Escuchar cambios en preferencia del sistema operativo
  useEffect(() => {
    if (!isInitialized) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Solo cambiar automáticamente si no hay preferencia guardada explícitamente
      const stored = localStorage.getItem('cashguard-theme');
      if (!stored) {
        const newTheme: Theme = e.matches ? 'light' : 'dark';
        setThemeStorage(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [isInitialized, setThemeStorage, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeStorage(newTheme);
  }, [setThemeStorage]);

  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // 🤖 [IA] - Log warning if localStorage is unavailable
  useEffect(() => {
    if (!isAvailable && process.env.NODE_ENV === 'development') {
      console.warn('localStorage is not available. Theme changes will not persist.');
    }
  }, [isAvailable]);

  return {
    theme,
    setTheme,
    toggleTheme,
    // 🤖 [IA] - v2.8.3: Convenience properties para condicionales
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isLocalStorageAvailable: isAvailable,
    localStorageError: error
  };
}
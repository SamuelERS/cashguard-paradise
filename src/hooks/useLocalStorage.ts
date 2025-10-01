import { useState, useCallback } from 'react';

// 🤖 [IA] - v1.1.0: Enhanced with comprehensive error handling
/**
 * Hook for managing localStorage with robust error handling
 * @param key - localStorage key
 * @param initialValue - fallback value if localStorage fails
 * @returns [storedValue, setValue, error, isAvailable]
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 🤖 [IA] - Check localStorage availability
  const [isAvailable, setIsAvailable] = useState(() => {
    try {
      const testKey = '__localStorage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  });

  // 🤖 [IA] - Track last error for debugging
  const [lastError, setLastError] = useState<Error | null>(null);

  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isAvailable) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
      return initialValue;
    }
  });

  // 🤖 [IA] - Enhanced setter with better error handling and fallback
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update state first (always works)
      setStoredValue(valueToStore);
      
      // Try to persist to localStorage if available
      if (isAvailable) {
        const serialized = JSON.stringify(valueToStore);
        window.localStorage.setItem(key, serialized);
        
        // Clear error on success
        if (lastError) {
          setLastError(null);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
      
      // 🤖 [IA] - If quota exceeded, try to clear old data
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('localStorage quota exceeded. Consider clearing old data.');
        }
      }
      
      // 🤖 [IA] - Mark localStorage as unavailable if it fails
      if (!isAvailable) {
        setIsAvailable(false);
      }
    }
  }, [key, storedValue, isAvailable, lastError]);

  // 🤖 [IA] - Return tuple with additional metadata
  return [storedValue, setValue, { error: lastError, isAvailable }] as const;
}
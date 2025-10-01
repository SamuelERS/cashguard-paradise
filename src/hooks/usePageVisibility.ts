/**
 * Hook para detectar visibilidad de la página
 * 
 * @description
 * Hook que detecta cuando la página/pestaña se oculta o muestra usando la Page Visibility API.
 * Automáticamente pausa animaciones CSS cuando la página está oculta para ahorrar recursos.
 * Útil para optimizar performance cuando el usuario cambia de pestaña.
 * 
 * @example
 * ```tsx
 * const isVisible = usePageVisibility();
 * 
 * // Pausar operaciones cuando no está visible
 * useEffect(() => {
 *   if (!isVisible) {
 *     pausePolling();
 *   } else {
 *     resumePolling();
 *   }
 * }, [isVisible]);
 * ```
 * 
 * @returns {boolean} true si la página es visible, false si está oculta
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API Page Visibility API}
 */
import { useState, useEffect } from 'react';

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      
      // Pausar/reanudar animaciones CSS
      if (document.hidden) {
        document.documentElement.style.setProperty('--animation-play-state', 'paused');
      } else {
        document.documentElement.style.setProperty('--animation-play-state', 'running');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set initial state
    handleVisibilityChange();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
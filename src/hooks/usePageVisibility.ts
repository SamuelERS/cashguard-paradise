// Hook para detectar visibilidad de la página y pausar animaciones
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
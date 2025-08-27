import { useState, useEffect } from 'react';

/**
 * Hook para detectar si el dispositivo es móvil
 * Considera móvil: pantallas menores a 768px
 * Incluye listener para cambios de tamaño de ventana
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Función para verificar si es móvil
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Verificar inicialmente
    checkIsMobile();

    // Agregar listener para cambios de tamaño
    const handleResize = () => {
      checkIsMobile();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook alternativo que también considera el user agent
 * Útil para detectar dispositivos táctiles específicamente
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      // Verificar por capacidad táctil
      const hasTouchScreen = 'ontouchstart' in window || 
                            navigator.maxTouchPoints > 0 ||
                            // @ts-ignore - msMaxTouchPoints es legacy pero algunos dispositivos lo usan
                            navigator.msMaxTouchPoints > 0;
      
      // Verificar por user agent (como respaldo)
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      setIsTouchDevice(hasTouchScreen || isMobileUserAgent);
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
}
import * as React from "react"

// 🤖 [IA] - v2.0.0: Hook unificado para detección móvil - Combina best practices de ambas implementaciones
const MOBILE_BREAKPOINT = 768

/**
 * Hook optimizado para detectar dispositivos móviles basado en ancho de pantalla
 * Usa matchMedia para mejor performance que resize listeners
 * @param breakpoint - Ancho máximo para considerar móvil (default: 768px)
 * @returns boolean - true si es móvil
 */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < breakpoint)
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return !!isMobile
}

/**
 * Hook para detectar dispositivos con capacidad táctil
 * Útil para diferenciar entre móvil/tablet vs desktop con pantalla táctil
 * @returns boolean - true si el dispositivo tiene capacidades táctiles
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkTouchDevice = () => {
      // Verificar por capacidad táctil nativa
      const hasTouchScreen = 'ontouchstart' in window || 
                            navigator.maxTouchPoints > 0 ||
                            // @ts-expect-error - msMaxTouchPoints es legacy pero algunos dispositivos lo usan
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

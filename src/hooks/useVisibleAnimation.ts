// 🤖 [IA] - v1.2.18: Hook para gestión inteligente de animaciones
// Pausa automáticamente animaciones cuando los elementos salen del viewport
// Optimiza batería y rendimiento reduciendo trabajo innecesario de la GPU

import { useEffect, useRef, useState } from 'react';

interface UseVisibleAnimationOptions {
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}

interface UseVisibleAnimationReturn {
  isVisible: boolean;
  elementRef: React.RefObject<HTMLElement>;
  startAnimation: () => void;
  stopAnimation: () => void;
}

/**
 * 🤖 [IA] - Hook para gestión inteligente de animaciones - v1.2.18
 * 
 * @description
 * Hook que detecta cuando un elemento está visible en el viewport usando IntersectionObserver.
 * Pausa automáticamente animaciones cuando los elementos salen del viewport para optimizar
 * batería y rendimiento reduciendo trabajo innecesario de la GPU. Perfecto para listas
 * largas con animaciones o elementos fuera de vista.
 * 
 * @param {UseVisibleAnimationOptions} [options] - Opciones del IntersectionObserver
 * @param {string} [options.rootMargin='50px'] - Margen para inicio de detección
 * @param {number} [options.threshold=0.1] - Umbral de visibilidad (0-1)
 * @param {boolean} [options.enabled=true] - Si el observer está activo
 * 
 * @returns {UseVisibleAnimationReturn} Objeto con estado y controles
 * 
 * @property {boolean} isVisible - Si el elemento es visible
 * @property {RefObject} elementRef - Ref para asignar al elemento DOM
 * @property {function} startAnimation - Fuerza inicio de animación
 * @property {function} stopAnimation - Fuerza detención de animación
 * 
 * @example
 * ```tsx
 * // Caso 1: Pausar animación cuando no está visible
 * const { isVisible, elementRef } = useVisibleAnimation();
 * 
 * <input 
 *   ref={elementRef} 
 *   className={cn(
 *     "animated-field",
 *     !isVisible && "animation-paused"
 *   )}
 * />
 * 
 * // Caso 2: Lista con animaciones optimizadas
 * const items = data.map(item => {
 *   const { isVisible, elementRef } = useVisibleAnimation({
 *     rootMargin: '100px',
 *     threshold: 0.5
 *   });
 *   
 *   return (
 *     <div ref={elementRef} className={isVisible ? 'animate' : 'paused'}>
 *       {item.content}
 *     </div>
 *   );
 * });
 * ```
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API IntersectionObserver API}
 */
export function useVisibleAnimation(options: UseVisibleAnimationOptions = {}): UseVisibleAnimationReturn {
  const {
    rootMargin = '50px', // Empezar animación 50px antes de ser visible
    threshold = 0.1, // Al menos 10% del elemento debe ser visible
    enabled = true
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Solo crear observer si está habilitado y hay soporte
    if (!enabled || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true); // Fallback: siempre visible si no hay soporte
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    // Crear observer con las opciones especificadas
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        
        // Debug en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(`Animation element ${entry.isIntersecting ? 'visible' : 'hidden'}`, {
            intersectionRatio: entry.intersectionRatio,
            boundingRect: entry.boundingClientRect,
          });
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    // Observar el elemento
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [rootMargin, threshold, enabled]);

  // Métodos de control manual (para casos especiales)
  const startAnimation = () => {
    if (enabled) {
      setIsVisible(true);
    }
  };

  const stopAnimation = () => {
    setIsVisible(false);
  };

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    isVisible,
    elementRef,
    startAnimation,
    stopAnimation,
  };
}

/**
 * Versión simplificada del hook para casos donde solo necesitas el estado de visibilidad
 * 
 * @param elementRef - Ref del elemento a observar
 * @param options - Opciones del IntersectionObserver
 * @returns boolean indicando si el elemento está visible
 */
export function useIsVisible(
  elementRef: React.RefObject<HTMLElement>, 
  options: UseVisibleAnimationOptions = {}
): boolean {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const {
    rootMargin = '50px',
    threshold = 0.1,
    enabled = true
  } = options;

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin, threshold }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [elementRef, rootMargin, threshold, enabled]);

  return isVisible;
} // 🤖 [IA] - v1.2.22: Fixed any type casting - proper implementation

/**
 * Hook especializado para animaciones de pulso que se pausan automáticamente
 * Incluye lógica adicional para campos de entrada
 * 
 * @param isActive - Si el campo está activo/enfocado
 * @param options - Opciones adicionales
 * @returns Estado completo para componentes de entrada
 */
export function usePulseAnimation(isActive: boolean, options: UseVisibleAnimationOptions = {}) {
  const { isVisible, elementRef, startAnimation, stopAnimation } = useVisibleAnimation(options);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Controlar animación basada en visibilidad y estado activo
  useEffect(() => {
    const animate = isActive && isVisible;
    setShouldAnimate(animate);

    // En desarrollo, log cuando cambia el estado de animación
    if (process.env.NODE_ENV === 'development') {
      console.log('Pulse animation:', { isActive, isVisible, shouldAnimate: animate });
    }
  }, [isActive, isVisible]);

  return {
    shouldAnimate,
    isVisible,
    elementRef,
    startAnimation,
    stopAnimation,
  };
}
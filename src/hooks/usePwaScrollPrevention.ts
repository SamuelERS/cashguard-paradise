// 🤖 [IA] - v1.4.1: Extraído de CashCounter.tsx para desmonolitización
// Gestión de scroll PWA: prevenir bounce en Phase 1-2, permitir scroll natural en Phase 3

import { useEffect } from 'react';

// 🤖 [IA] - v1.2.22: Interface for webkit-specific CSS properties
interface ExtendedCSSStyleDeclaration extends CSSStyleDeclaration {
  webkitOverflowScrolling?: string;
}

/**
 * Hook que previene scroll bounce en modo PWA standalone.
 * - Phase 1-2: position:fixed + touch event interception (previene scroll accidental durante conteo)
 * - Phase 3: scroll natural habilitado (reportes largos necesitan scroll)
 *
 * @param currentPhase - Fase actual del flujo (1, 2, o 3)
 */
export function usePwaScrollPrevention(currentPhase: number): void {
  useEffect(() => {
    // Solo aplicar en PWA mode
    if (!window.matchMedia?.('(display-mode: standalone)')?.matches) {
      return;
    }

    // 🔒 FIX S0-003: Excepción Phase 3 - Permitir scroll natural en reportes
    // Justificación: Phase 3 es solo lectura (sin inputs) + reportes largos (800-1200px) vs viewport iPhone SE (568px)
    // Usuario NECESITA scroll para ver reporte completo + botón "Completar" al final
    if (currentPhase === 3) {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'relative';
      document.body.style.overscrollBehavior = 'auto';
      document.body.style.touchAction = 'auto';
      return; // Early return - NO aplicar position:fixed en Phase 3
    }

    // Guardar estilos originales
    const originalStyles = {
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
      overflow: document.body.style.overflow,
      overscrollBehavior: document.body.style.overscrollBehavior,
      webkitOverflowScrolling: (document.body.style as ExtendedCSSStyleDeclaration).webkitOverflowScrolling,
      touchAction: document.body.style.touchAction
    };

    // Aplicar estilos SOLO en Phase 1 y 2 (prevenir scroll accidental durante conteo)
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    (document.body.style as ExtendedCSSStyleDeclaration).webkitOverflowScrolling = 'touch';
    document.body.style.touchAction = 'pan-y'; // 🚨 FIX: Permitir pan vertical en contenedores scrollables

    // 🚨 FIX v1.3.0: WeakMap para tracking de touch sin 'any'
    const touchStartY = new WeakMap<Touch, number>();

    // 🚨 FIX v1.3.0: Prevenir touchmove inteligentemente
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;

      // Buscar contenedor scrollable más cercano
      const scrollableContainer = target.closest('.overflow-y-auto, [data-scrollable], .morning-verification-container, .cash-calculation-container');

      if (!scrollableContainer) {
        // No hay contenedor scrollable, prevenir bounce del body
        e.preventDefault();
      } else {
        // Hay contenedor scrollable, verificar si está en los límites de scroll
        const element = scrollableContainer as HTMLElement;
        const { scrollTop, scrollHeight, clientHeight } = element;

        // Calcular si está intentando hacer overscroll
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight;

        // Obtener dirección del touch usando WeakMap
        const touch = e.touches[0];
        const startY = touchStartY.get(touch) || touch.clientY;
        const deltaY = touch.clientY - startY;

        // Prevenir bounce cuando intenta scrollear más allá de los límites
        if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
          e.preventDefault();
        }
      }
    };

    // Guardar posición inicial del touch
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartY.set(touch, touch.clientY);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Cleanup: restaurar estilos originales y remover event listeners
    return () => {
      document.body.style.position = originalStyles.position;
      document.body.style.width = originalStyles.width;
      document.body.style.height = originalStyles.height;
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.overscrollBehavior = originalStyles.overscrollBehavior;
      (document.body.style as ExtendedCSSStyleDeclaration).webkitOverflowScrolling = originalStyles.webkitOverflowScrolling;
      document.body.style.touchAction = originalStyles.touchAction;

      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [currentPhase]); // Reactivar cuando cambie la fase
}

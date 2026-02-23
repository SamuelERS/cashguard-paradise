// 🤖 [IA] - CASO #3 RESILIENCIA OFFLINE — Iteración 3b
// Hook reactivo para estado de cola offline con polling.
// Reemplaza lectura puntual obtenerEstadoCola() en cada render.

import { useState, useEffect } from 'react';
import { obtenerEstadoCola } from '../lib/offlineQueue';
import type { EstadoCola } from '../lib/offlineQueue';

/** Intervalo de polling en milisegundos. */
const POLLING_INTERVAL_MS = 2000;

/**
 * Hook reactivo que expone el estado actual de la cola offline.
 *
 * Usa polling con setInterval para detectar cambios en localStorage
 * (la cola se persiste ahí). Solo actualiza state si los valores cambiaron,
 * evitando re-renders innecesarios.
 *
 * @returns EstadoCola actualizado reactivamente
 */
export function useOfflineQueueStatus(): EstadoCola {
  const [estado, setEstado] = useState<EstadoCola>(() => obtenerEstadoCola());

  useEffect(() => {
    const intervalo = setInterval(() => {
      const nuevo = obtenerEstadoCola();

      setEstado((prev) => {
        // Solo actualizar si algún valor cambió — evita re-renders innecesarios
        if (
          prev.total === nuevo.total &&
          prev.pendientes === nuevo.pendientes &&
          prev.procesando === nuevo.procesando &&
          prev.fallidas === nuevo.fallidas
        ) {
          return prev;
        }
        return nuevo;
      });
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalo);
  }, []);

  return estado;
}

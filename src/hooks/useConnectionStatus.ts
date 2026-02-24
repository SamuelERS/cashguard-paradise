// 🤖 [IA] - v1.0.0: CASO #3 RESILIENCIA OFFLINE (Iteración 2)
// Hook reactivo para estado de conexión: online / offline / reconectando.
// Dispara callback onReconexion con debounce 2s al volver online.

import { useState, useEffect, useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type EstadoConexion = 'online' | 'offline' | 'reconectando';

interface UseConnectionStatusOptions {
  /** Callback ejecutado tras reconexión (con debounce 2s). */
  onReconexion?: () => void;
}

interface UseConnectionStatusReturn {
  estadoConexion: EstadoConexion;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const DEBOUNCE_RECONEXION_MS = 2000;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useConnectionStatus(
  options?: UseConnectionStatusOptions,
): UseConnectionStatusReturn {
  const [estadoConexion, setEstadoConexion] = useState<EstadoConexion>(
    navigator.onLine ? 'online' : 'offline',
  );

  // Ref para el timeout de debounce (cleanup al desmontar)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref estable para el callback (evita re-registrar listeners)
  const onReconexionRef = useRef(options?.onReconexion);
  onReconexionRef.current = options?.onReconexion;

  const handleOffline = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setEstadoConexion('offline');
  }, []);

  const handleOnline = useCallback(() => {
    setEstadoConexion('reconectando');

    // Limpiar debounce anterior si existe
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setEstadoConexion('online');
      onReconexionRef.current?.();
      debounceRef.current = null;
    }, DEBOUNCE_RECONEXION_MS);
  }, []);

  useEffect(() => {
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [handleOffline, handleOnline]);

  return { estadoConexion };
}

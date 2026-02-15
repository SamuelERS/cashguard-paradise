// 🤖 [IA] - ORDEN #011: Cola de operaciones offline con persistencia localStorage
// Paso 6 del plan de arquitectura offline (07_Politica_Offline.md)

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type TipoOperacion =
  | 'GUARDAR_PROGRESO'
  | 'FINALIZAR_CORTE'
  | 'ABORTAR_CORTE'
  | 'REGISTRAR_INTENTO';

export type EstadoOperacion = 'pendiente' | 'procesando' | 'fallida';

export interface OperacionOffline {
  id: string;
  tipo: TipoOperacion;
  payload: Record<string, unknown>;
  corteId: string;
  timestamp: string;
  reintentos: number;
  ultimoReintento: string | null;
  estado: EstadoOperacion;
  error: string | null;
}

export interface EstadoCola {
  total: number;
  pendientes: number;
  procesando: number;
  fallidas: number;
  estaVacia: boolean;
}

export interface ResultadoProcesamiento {
  exitosas: number;
  fallidas: number;
  pendientes: number;
  errores: Array<{ id: string; error: string }>;
}

/** Función que envía una operación al servidor. Inyectada por el consumidor. */
export type EjecutorOperacion = (op: OperacionOffline) => Promise<void>;
/** Función de cleanup para remover listeners. */
export type CleanupFn = () => void;

// ─── Constantes ──────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'cashguard_offline_queue';
export const MAX_REINTENTOS = 5;
export const BACKOFF_MS = [2000, 4000, 8000, 16000, 30000] as const;

// ─── Helpers internos ────────────────────────────────────────────────────────

function cargarDesdeStorage(): OperacionOffline[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as OperacionOffline[];
  } catch {
    return [];
  }
}

function guardarEnStorage(cola: OperacionOffline[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cola));
  } catch { /* localStorage puede fallar en modo privado o sin espacio */ }
}

// ─── Funciones exportadas ────────────────────────────────────────────────────

/** Agrega una operación a la cola offline. Retorna el id generado. */
export function agregarOperacion(datos: {
  tipo: TipoOperacion;
  payload: Record<string, unknown>;
  corteId: string;
}): string {
  const id = crypto.randomUUID();
  const operacion: OperacionOffline = {
    id,
    tipo: datos.tipo,
    payload: datos.payload,
    corteId: datos.corteId,
    timestamp: new Date().toISOString(),
    reintentos: 0,
    ultimoReintento: null,
    estado: 'pendiente',
    error: null,
  };

  const cola = cargarDesdeStorage();
  cola.push(operacion);
  guardarEnStorage(cola);
  return id;
}

/** Lee y retorna la cola completa desde localStorage. */
export function obtenerCola(): OperacionOffline[] {
  return cargarDesdeStorage();
}

/** Calcula contadores agregados del estado actual de la cola. */
export function obtenerEstadoCola(): EstadoCola {
  const cola = cargarDesdeStorage();
  return {
    total: cola.length,
    pendientes: cola.filter((op) => op.estado === 'pendiente').length,
    procesando: cola.filter((op) => op.estado === 'procesando').length,
    fallidas: cola.filter((op) => op.estado === 'fallida').length,
    estaVacia: cola.length === 0,
  };
}

/** Procesa operaciones pendientes en orden FIFO usando el ejecutor inyectado. */
export async function procesarCola(
  ejecutor: EjecutorOperacion
): Promise<ResultadoProcesamiento> {
  const resultado: ResultadoProcesamiento = {
    exitosas: 0,
    fallidas: 0,
    pendientes: 0,
    errores: [],
  };

  const pendientes = cargarDesdeStorage().filter((op) => op.estado === 'pendiente');

  for (const op of pendientes) {
    // Re-leer cola fresca y marcar como procesando
    const colaParaMarcar = cargarDesdeStorage();
    const opParaMarcar = colaParaMarcar.find((o) => o.id === op.id);
    if (!opParaMarcar) continue;
    opParaMarcar.estado = 'procesando';
    guardarEnStorage(colaParaMarcar);

    try {
      await ejecutor(op);
      // Éxito: eliminar de la cola
      const colaActual = cargarDesdeStorage();
      const filtrada = colaActual.filter((o) => o.id !== op.id);
      guardarEnStorage(filtrada);
      resultado.exitosas++;
    } catch (err) {
      // Error: incrementar reintentos
      const colaActual = cargarDesdeStorage();
      const opEnCola = colaActual.find((o) => o.id === op.id);

      if (opEnCola) {
        opEnCola.reintentos++;
        opEnCola.ultimoReintento = new Date().toISOString();
        opEnCola.error =
          err instanceof Error ? err.message : 'Error desconocido';

        if (opEnCola.reintentos >= MAX_REINTENTOS) {
          opEnCola.estado = 'fallida';
          resultado.fallidas++;
        } else {
          opEnCola.estado = 'pendiente';
          resultado.pendientes++;
        }

        resultado.errores.push({
          id: opEnCola.id,
          error: opEnCola.error,
        });

        guardarEnStorage(colaActual);
      }
    }
  }

  return resultado;
}

/** Elimina una operación específica de la cola. Retorna true si existía. */
export function eliminarOperacion(id: string): boolean {
  const cola = cargarDesdeStorage();
  const longitudOriginal = cola.length;
  const filtrada = cola.filter((op) => op.id !== id);

  if (filtrada.length === longitudOriginal) return false;

  guardarEnStorage(filtrada);
  return true;
}

/** Elimina todas las operaciones de la cola. */
export function limpiarCola(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* localStorage puede fallar en modo privado */ }
}

/** Registra un listener para el evento 'online'. Retorna función de cleanup. */
export function escucharConectividad(onOnline: () => void): CleanupFn {
  const handler = () => onOnline();
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}

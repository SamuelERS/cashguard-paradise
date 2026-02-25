// 🤖 [IA] - v2.0.0: Tipos del sistema de auditoria de corte de caja
/**
 * @file auditoria.ts
 * @description Tipos TypeScript para el sistema de auditoria de corte de caja.
 * Define entidades (Sucursal, Corte, CorteIntento), estados, type guards,
 * interfaces del hook principal y constantes del dominio.
 *
 * @remarks
 * - Zero `any` — usa `unknown` + type guards
 * - Union types — NO enums (tree-shaking)
 * - Interfaces sin I-prefix
 * - Campos JSONB tipados como `Record<string, unknown> | null`
 * - Campos nullable usan `| null` (son nullable en DB, no opcionales)
 * - Timestamps como `string` (ISO 8601)
 *
 * @version 2.0.0
 */

// ---------------------------------------------------------------------------
// 1. Union types para estados
// ---------------------------------------------------------------------------

/**
 * Estados posibles de un corte de caja.
 *
 * @remarks Maquina de estados:
 * - INICIADO -> EN_PROGRESO (al comenzar conteo)
 * - EN_PROGRESO -> FINALIZADO (al completar reporte)
 * - EN_PROGRESO -> ABORTADO (por cancelacion o error irrecuperable)
 * - INICIADO -> ABORTADO (cancelacion temprana)
 */
export type EstadoCorte = 'INICIADO' | 'EN_PROGRESO' | 'FINALIZADO' | 'ABORTADO';

/**
 * Estados posibles de un intento de corte.
 *
 * @remarks
 * - ACTIVO: Intento en curso (solo 1 activo a la vez)
 * - COMPLETADO: Intento finalizo satisfactoriamente
 * - ABANDONADO: Intento descartado (se creo uno nuevo)
 */
export type EstadoIntento = 'ACTIVO' | 'COMPLETADO' | 'ABANDONADO';

/**
 * Severidades de verificacion ciega existentes en el proyecto.
 *
 * @remarks Reutiliza los mismos valores que src/types/verification.ts
 * para mantener consistencia con el sistema anti-fraude.
 */
export type VerificationSeverity =
  | 'success'
  | 'warning_retry'
  | 'warning_override'
  | 'critical_severe'
  | 'critical_inconsistent';

// ---------------------------------------------------------------------------
// 2. Interfaces para las 3 entidades
// ---------------------------------------------------------------------------

/**
 * Catalogo de sucursales. Entidad de referencia.
 */
export interface Sucursal {
  /** UUID de la sucursal */
  id: string;
  /** Nombre legible (ej: "Los Heroes") */
  nombre: string;
  /** Codigo corto (1 caracter, ej: "H") usado en correlativo */
  codigo: string;
  /** Indica si la sucursal esta activa para operaciones */
  activa: boolean;
}

/**
 * Evento principal de auditoria de corte de caja.
 * Representa un corte completo con sus datos progresivos.
 *
 * @remarks
 * - Los campos JSONB almacenan snapshots parciales del conteo
 * - `correlativo` tiene formato CORTE-YYYY-MM-DD-X-NNN
 * - `reporte_hash` solo se asigna al FINALIZAR (SHA-256 del reporte)
 */
export interface Corte {
  /** UUID del corte */
  id: string;
  /** Correlativo unico: CORTE-YYYY-MM-DD-X-NNN */
  correlativo: string;
  /** UUID de la sucursal */
  sucursal_id: string;
  /** Nombre del cajero que realiza el corte */
  cajero: string;
  /** ID del cajero en catalogo de empleados (nullable para retrocompatibilidad) */
  cajero_id?: string | null;
  /** Nombre del testigo (debe ser diferente al cajero) */
  testigo: string;
  /** ID del testigo en catalogo de empleados (nullable para retrocompatibilidad) */
  testigo_id?: string | null;
  /** Estado actual del corte */
  estado: EstadoCorte;
  /** Fase actual del proceso (1=conteo, 2=entrega, 3=reporte) */
  fase_actual: number;
  /** Numero de intento actual (1-based) */
  intento_actual: number;
  /** Venta esperada segun SICAR */
  venta_esperada: number | null;
  /** Snapshot del conteo de efectivo (JSONB) */
  datos_conteo: Record<string, unknown> | null;
  /** Snapshot de datos de entrega a gerencia (JSONB) */
  datos_entrega: Record<string, unknown> | null;
  /** Snapshot de datos de verificacion ciega (JSONB) */
  datos_verificacion: Record<string, unknown> | null;
  /** Snapshot de datos del reporte final (JSONB) */
  datos_reporte: Record<string, unknown> | null;
  /** Hash SHA-256 del reporte final (solo en FINALIZADO) */
  reporte_hash: string | null;
  /** Timestamp de creacion ISO 8601 */
  created_at: string;
  /** Timestamp de ultima actualizacion ISO 8601 */
  updated_at: string;
  /** Timestamp de finalizacion ISO 8601 (solo en FINALIZADO/ABORTADO) */
  finalizado_at: string | null;
  /** Motivo de aborto (solo en ABORTADO) */
  motivo_aborto: string | null;
}

/**
 * Registro de cada intento dentro de un corte.
 * Captura snapshots progresivos del estado del conteo.
 *
 * @remarks
 * - `motivo_reinicio` es obligatorio si `attempt_number > 1`
 * - `snapshot_datos` contiene el estado completo al momento del reinicio/finalizacion
 */
export interface CorteIntento {
  /** UUID del intento */
  id: string;
  /** UUID del corte padre (FK) */
  corte_id: string;
  /** Numero de intento (1-based, debe ser > 0) */
  attempt_number: number;
  /** Estado del intento */
  estado: EstadoIntento;
  /** Snapshot completo de datos al momento de captura (JSONB) */
  snapshot_datos: Record<string, unknown> | null;
  /** Motivo de reinicio (requerido si attempt_number > 1) */
  motivo_reinicio: string | null;
  /** Timestamp de creacion ISO 8601 */
  created_at: string;
  /** Timestamp de finalizacion ISO 8601 */
  finalizado_at: string | null;
}

// 🤖 [IA] - OT-17: Snapshot append-only de progreso de conteo
/**
 * Registro inmutable de progreso de conteo.
 * Tabla `corte_conteo_snapshots` — append-only (trigger bloquea UPDATE/DELETE).
 */
export interface CorteConteoSnapshot {
  /** Identificador auto-generado en BD */
  id: number | string;
  /** FK al corte activo */
  corte_id: string;
  /** Numero de intento activo al momento del snapshot */
  attempt_number: number;
  /** Fase actual (1-3) */
  fase_actual: number;
  /** Denominaciones de efectivo — mapea CashCount keys */
  penny: number;
  nickel: number;
  dime: number;
  quarter: number;
  dollar_coin: number;
  bill1: number;
  bill5: number;
  bill10: number;
  bill20: number;
  bill50: number;
  bill100: number;
  /** Pagos electronicos */
  credomatic: number;
  promerica: number;
  bank_transfer: number;
  paypal: number;
  /** Gastos del dia (JSONB serializado) */
  gastos_dia: Record<string, unknown> | unknown[] | null;
  /** Origen del snapshot */
  source: 'autosave' | 'manual' | 'fase_change';
  /** Timestamp de captura ISO 8601 (DB default: now()) */
  captured_at: string;
}

// ---------------------------------------------------------------------------
// 3. Interfaces para parametros del hook
// ---------------------------------------------------------------------------

/**
 * Parametros requeridos para iniciar un nuevo corte.
 */
export interface IniciarCorteParams {
  /** UUID de la sucursal donde se realiza el corte */
  sucursal_id: string;
  /** Nombre del cajero */
  cajero: string;
  /** ID del cajero en catalogo empleados (opcional) */
  cajero_id?: string;
  /** Nombre del testigo (debe ser != cajero) */
  testigo: string;
  /** ID del testigo en catalogo empleados (opcional) */
  testigo_id?: string;
  /** Venta esperada segun SICAR (opcional, >= 0) */
  venta_esperada?: number;
}

/**
 * Datos de guardado progresivo durante el corte.
 */
export interface DatosProgreso {
  /** Fase actual (1-3) */
  fase_actual: number;
  /** Snapshot parcial del conteo de efectivo */
  conteo_parcial: Record<string, unknown> | null;
  /** Snapshot parcial de pagos electronicos */
  pagos_electronicos: Record<string, unknown> | null;
  /** Snapshot parcial de gastos del dia */
  gastos_dia: Record<string, unknown> | null;
  /** Snapshot parcial de fase 2 (entrega a gerencia) */
  datos_entrega?: Record<string, unknown> | null;
  /** Snapshot parcial de verificación ciega de fase 2 */
  datos_verificacion?: Record<string, unknown> | null;
  /** Snapshot parcial de fase 3 (reporte) */
  datos_reporte?: Record<string, unknown> | null;
}

/**
 * Interface publica del hook useCorteSesion.
 * Estado + acciones + recovery.
 */
export interface UseCorteSesionReturn {
  /** Estado actual del corte (null si no hay corte activo) */
  estado: EstadoCorte | null;
  /** Corte activo actual (null si no existe) */
  corte_actual: Corte | null;
  /** Intento activo actual (null si no existe) */
  intento_actual: CorteIntento | null;
  /** Inicia un nuevo corte de caja */
  iniciarCorte: (params: IniciarCorteParams) => Promise<Corte>;
  /** Guarda progreso parcial del corte activo */
  guardarProgreso: (datos: DatosProgreso) => Promise<void>;
  /** Finaliza el corte con el hash del reporte */
  finalizarCorte: (reporte_hash: string) => Promise<Corte>;
  /** Aborta el corte con un motivo */
  abortarCorte: (motivo: string) => Promise<void>;
  /** Reinicia un intento (crea nuevo CorteIntento) */
  reiniciarIntento: (motivo: string) => Promise<CorteIntento>;
  /** Intenta recuperar una sesion interrumpida */
  recuperarSesion: () => Promise<Corte | null>;
  /** Indica si hay una operacion en curso */
  cargando: boolean;
  /** Ultimo error (null si no hay error) */
  error: string | null;
}

// ---------------------------------------------------------------------------
// 4. Constantes
// ---------------------------------------------------------------------------

/**
 * Estados que representan un corte terminado (no modificable).
 */
export const ESTADOS_TERMINALES: readonly EstadoCorte[] = ['FINALIZADO', 'ABORTADO'] as const;

/**
 * Regex para validar formato de correlativo.
 *
 * @remarks Formato: CORTE-YYYY-MM-DD-X-NNN donde:
 * - CORTE: prefijo literal
 * - YYYY-MM-DD: fecha ISO
 * - X: codigo de sucursal (1 letra mayuscula)
 * - NNN: numero secuencial (3 digitos)
 * - Sufijo opcional: -A{N} para reintentos (ej: -A2)
 */
export const CORRELATIVO_REGEX: RegExp = /^CORTE-\d{4}-\d{2}-\d{2}-[A-Z]-\d{3}(-A\d+)?$/;

/**
 * Numero maximo de fases en el proceso de corte.
 * Phase 1: Conteo, Phase 2: Entrega, Phase 3: Reporte.
 */
export const FASE_MAXIMA: number = 3;

// ---------------------------------------------------------------------------
// 5. Type guards
// ---------------------------------------------------------------------------

/** Valores validos de EstadoCorte para validacion runtime */
const ESTADOS_CORTE_VALIDOS: readonly string[] = [
  'INICIADO', 'EN_PROGRESO', 'FINALIZADO', 'ABORTADO',
] as const;

/** Valores validos de EstadoIntento para validacion runtime */
const ESTADOS_INTENTO_VALIDOS: readonly string[] = [
  'ACTIVO', 'COMPLETADO', 'ABANDONADO',
] as const;

/**
 * Valida si un valor es un EstadoCorte valido.
 */
export function isEstadoCorte(value: unknown): value is EstadoCorte {
  return typeof value === 'string' && ESTADOS_CORTE_VALIDOS.includes(value);
}

/**
 * Valida si un string cumple con el formato de correlativo.
 *
 * @remarks Formato esperado: CORTE-YYYY-MM-DD-X-NNN o CORTE-YYYY-MM-DD-X-NNN-A{N}
 */
export function isCorrelativoValido(value: string): boolean {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }
  return CORRELATIVO_REGEX.test(value);
}

/**
 * Valida si un objeto desconocido es un Corte valido.
 *
 * @remarks Verifica estructura completa: tipos de campos, estado valido,
 * formato de correlativo y tipos JSONB (Record | null).
 */
export function isCorte(obj: unknown): obj is Corte {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;

  // Campos string obligatorios
  if (typeof record.id !== 'string') return false;
  if (typeof record.correlativo !== 'string') return false;
  if (typeof record.sucursal_id !== 'string') return false;
  if (typeof record.cajero !== 'string') return false;
  if (typeof record.testigo !== 'string') return false;
  if (typeof record.created_at !== 'string') return false;
  if (typeof record.updated_at !== 'string') return false;

  // Estado valido
  if (!isEstadoCorte(record.estado)) return false;

  // Validar formato correlativo
  if (!isCorrelativoValido(record.correlativo)) return false;

  // Campos numericos
  if (typeof record.fase_actual !== 'number') return false;
  if (typeof record.intento_actual !== 'number') return false;

  // Campos nullable (string | null)
  if (record.reporte_hash !== null && typeof record.reporte_hash !== 'string') return false;
  if (record.finalizado_at !== null && typeof record.finalizado_at !== 'string') return false;
  if (record.motivo_aborto !== null && typeof record.motivo_aborto !== 'string') return false;

  // Campos nullable (number | null)
  if (record.venta_esperada !== null && typeof record.venta_esperada !== 'number') return false;

  // Campos JSONB (Record<string, unknown> | null)
  if (!isRecordOrNull(record.datos_conteo)) return false;
  if (!isRecordOrNull(record.datos_entrega)) return false;
  if (!isRecordOrNull(record.datos_verificacion)) return false;
  if (!isRecordOrNull(record.datos_reporte)) return false;

  return true;
}

/**
 * Valida si un objeto desconocido es un CorteIntento valido.
 *
 * @remarks Verifica campos requeridos, attempt_number > 0,
 * y que motivo_reinicio este presente si attempt_number > 1.
 */
export function isCorteIntento(obj: unknown): obj is CorteIntento {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;

  // Campos string obligatorios
  if (typeof record.id !== 'string') return false;
  if (typeof record.corte_id !== 'string') return false;
  if (typeof record.created_at !== 'string') return false;

  // attempt_number: numero > 0
  if (typeof record.attempt_number !== 'number') return false;
  if (record.attempt_number < 1 || !Number.isInteger(record.attempt_number)) return false;

  // Estado valido
  if (typeof record.estado !== 'string') return false;
  if (!ESTADOS_INTENTO_VALIDOS.includes(record.estado)) return false;

  // Campos nullable
  if (!isRecordOrNull(record.snapshot_datos)) return false;
  if (record.motivo_reinicio !== null && typeof record.motivo_reinicio !== 'string') return false;
  if (record.finalizado_at !== null && typeof record.finalizado_at !== 'string') return false;

  // Regla de negocio: motivo_reinicio requerido si attempt > 1
  if (record.attempt_number > 1 && (record.motivo_reinicio === null || record.motivo_reinicio === '')) {
    return false;
  }

  return true;
}

/**
 * Valida si un objeto desconocido cumple con IniciarCorteParams.
 *
 * @remarks Verifica campos string obligatorios (sucursal_id, cajero, testigo)
 * y que venta_esperada, si esta definida, sea un numero >= 0.
 */
export function isIniciarCorteParamsValido(obj: unknown): obj is IniciarCorteParams {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;

  // Campos string obligatorios
  if (typeof record.sucursal_id !== 'string') return false;
  if (typeof record.cajero !== 'string') return false;
  if (typeof record.testigo !== 'string') return false;

  // venta_esperada opcional: si esta definida debe ser number >= 0
  if (record.venta_esperada !== undefined) {
    if (typeof record.venta_esperada !== 'number') return false;
    if (record.venta_esperada < 0) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Helpers internos (no exportados)
// ---------------------------------------------------------------------------

/**
 * Valida que un valor sea un Record<string, unknown> o null.
 * Usado para validar campos JSONB.
 */
function isRecordOrNull(value: unknown): boolean {
  if (value === null) return true;
  if (typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;
  return true;
}

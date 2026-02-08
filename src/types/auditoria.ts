// 🤖 [IA] - v2.0.0: Tipos del sistema de auditoría de cortes de caja
// Capa 2 (Tipos) — Interfaces base para persistencia Supabase

/**
 * Sucursal registrada en el sistema.
 * Tabla: `sucursales`
 */
export interface Sucursal {
  /** UUID v4 */
  id: string;
  /** Nombre visible (e.g. "Los Héroes") */
  nombre: string;
  /** Dirección física */
  direccion: string;
  /** Teléfono de contacto */
  telefono: string;
  /** Activa para operaciones */
  activa: boolean;
  /** ISO 8601 UTC */
  created_at: string;
}

/** Estado del ciclo de vida de un corte */
export type EstadoCorte =
  | 'INICIADO'
  | 'CONTEO_FASE1'
  | 'ENTREGA_FASE2'
  | 'VERIFICACION_FASE2'
  | 'COMPLETADO'
  | 'CANCELADO';

/** Tipo de operación */
export type TipoOperacion = 'CORTE_NOCTURNO' | 'CONTEO_MATUTINO';

/**
 * Corte de caja persistido.
 * Tabla: `cortes`
 */
export interface Corte {
  /** UUID v4 */
  id: string;
  /** Correlativo único (e.g. "CG-2026-0001") */
  correlativo: string;
  /** FK a sucursales.id */
  sucursal_id: string;
  /** Nombre del cajero */
  cajero: string;
  /** Nombre del testigo */
  testigo: string;
  /** Tipo de operación */
  tipo: TipoOperacion;
  /** Estado actual del corte */
  estado: EstadoCorte;
  /** Venta esperada SICAR en USD */
  venta_esperada: number;
  /** Total efectivo contado en USD */
  total_efectivo: number | null;
  /** Total pagos electrónicos en USD */
  total_electronico: number | null;
  /** Total general (efectivo + electrónico) en USD */
  total_general: number | null;
  /** Diferencia calculada en USD */
  diferencia: number | null;
  /** Snapshot JSON del conteo por denominación */
  denominaciones: Record<string, number> | null;
  /** Snapshot JSON de pagos electrónicos */
  pagos_electronicos: Record<string, number> | null;
  /** Snapshot JSON del comportamiento de verificación */
  verificacion_ciega: Record<string, unknown> | null;
  /** ISO 8601 UTC */
  created_at: string;
  /** ISO 8601 UTC */
  updated_at: string;
}

/**
 * Intento individual de verificación ciega por denominación.
 * Tabla: `corte_intentos`
 */
export interface CorteIntento {
  /** UUID v4 */
  id: string;
  /** FK a cortes.id */
  corte_id: string;
  /** Clave de denominación (e.g. "penny", "bill5") */
  denominacion: string;
  /** Número de intento (1, 2, 3) */
  numero_intento: number;
  /** Valor ingresado por el cajero */
  valor_ingresado: number;
  /** Valor esperado por el sistema */
  valor_esperado: number;
  /** Fue correcto en este intento */
  es_correcto: boolean;
  /** ISO 8601 UTC */
  created_at: string;
}

// 🤖 [IA] - v2.1.0: OT-17 — Agrega tipo corte_conteo_snapshots (append-only)
// Previous: v2.0.0: Cliente Supabase tipado
// Capa 3 (Sincronización) — Singleton + helpers + conectividad

import { createClient } from '@supabase/supabase-js';
import type { Sucursal, Corte, CorteIntento, CorteConteoSnapshot } from '../types/auditoria';

// ---------------------------------------------------------------------------
// 1. Tipo Database (mapeo Supabase)
// ---------------------------------------------------------------------------

/** Esquema tipado de la base de datos Supabase para CashGuard Paradise. */
export type Database = {
  public: {
    Tables: {
      sucursales: {
        Row: Sucursal;
        Insert: Omit<Sucursal, 'id'> & { id?: string };
        Update: Partial<Omit<Sucursal, 'id'>>;
      };
      cortes: {
        Row: Corte;
        Insert: Omit<Corte, 'id' | 'created_at' | 'updated_at' | 'correlativo'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          correlativo?: string;
        };
        Update: Partial<Omit<Corte, 'id' | 'created_at'>>;
      };
      corte_intentos: {
        Row: CorteIntento;
        Insert: Omit<CorteIntento, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CorteIntento, 'id' | 'created_at'>>;
      };
      empleados: {
        Row: {
          id: string;
          nombre: string;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          nombre: string;
          activo: boolean;
          updated_at: string;
        }>;
      };
      empleado_sucursales: {
        Row: {
          empleado_id: string;
          sucursal_id: string;
          created_at: string;
        };
        Insert: {
          empleado_id: string;
          sucursal_id: string;
          created_at?: string;
        };
        Update: Partial<Record<string, never>>;
      };
      // 🤖 [IA] - OT-17: Tabla append-only de snapshots de conteo
      corte_conteo_snapshots: {
        Row: CorteConteoSnapshot;
        Insert: Omit<CorteConteoSnapshot, 'id' | 'captured_at'> & {
          id?: string;
          captured_at?: string;
        };
        Update: Partial<Record<string, never>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// ---------------------------------------------------------------------------
// 2. Variables de entorno
// ---------------------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// 🤖 [IA] - Fix OT-02: Degradación controlada cuando env vars no están presentes.
// En lugar de throw que crashea toda la app/tests al importar el módulo,
// se usa un placeholder que falla en runtime solo cuando se intenta usar.
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no configuradas. ' +
    'El cliente Supabase operará en modo degradado (las llamadas fallarán).'
  );
}

// ---------------------------------------------------------------------------
// 3. Cliente singleton
// ---------------------------------------------------------------------------

/** Cliente Supabase tipado — singleton para toda la aplicación. */
export const supabase = createClient<Database>(
  supabaseUrl ?? PLACEHOLDER_URL,
  supabaseAnonKey ?? PLACEHOLDER_KEY,
);

/** Indica si el cliente Supabase tiene credenciales reales configuradas. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// ---------------------------------------------------------------------------
// 4. Helpers tipados
// ---------------------------------------------------------------------------

/**
 * Acceso directo a tablas con tipos completos.
 *
 * @example
 * ```ts
 * const { data } = await tables.cortes().select('*').eq('estado', 'INICIADO');
 * ```
 */
export const tables = {
  sucursales: () => supabase.from('sucursales'),
  cortes: () => supabase.from('cortes'),
  corteIntentos: () => supabase.from('corte_intentos'),
  empleados: () => supabase.from('empleados'),
  empleadoSucursales: () => supabase.from('empleado_sucursales'),
  corteConteoSnapshots: () => supabase.from('corte_conteo_snapshots'),
} as const;

// ---------------------------------------------------------------------------
// 5. Verificación de conectividad
// ---------------------------------------------------------------------------

/** Resultado de la verificación de conectividad Supabase. */
export interface ConnectionStatus {
  connected: boolean;
  latencyMs: number | null;
  error: string | null;
}

/**
 * Verifica la conectividad con Supabase realizando un SELECT ligero.
 *
 * @returns Estado de conexión con latencia en milisegundos.
 */
export async function checkSupabaseConnection(): Promise<ConnectionStatus> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('sucursales').select('id').limit(1);
    if (error) {
      return { connected: false, latencyMs: null, error: error.message };
    }
    return { connected: true, latencyMs: Date.now() - start, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { connected: false, latencyMs: null, error: message };
  }
}

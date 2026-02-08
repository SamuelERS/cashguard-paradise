// 🤖 [IA] - v2.0.0: Cliente Supabase tipado
// Capa 3 (Sincronización) — Singleton + helpers + conectividad

import { createClient } from '@supabase/supabase-js';
import type { Sucursal, Corte, CorteIntento } from '../types/auditoria';

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

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}
if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// ---------------------------------------------------------------------------
// 3. Cliente singleton
// ---------------------------------------------------------------------------

/** Cliente Supabase tipado — singleton para toda la aplicación. */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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

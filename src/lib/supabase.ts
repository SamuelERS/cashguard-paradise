// 🤖 [IA] - v2.0.0: Cliente Supabase tipado
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
          id: string;
          nombre: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
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
        Update: {
          empleado_id?: string;
          sucursal_id?: string;
          created_at?: string;
        };
      };
      corte_conteo_snapshots: {
        Row: CorteConteoSnapshot;
        Insert: Omit<CorteConteoSnapshot, 'id' | 'captured_at'> & {
          id?: string;
          captured_at?: string;
        };
        Update: Partial<Omit<CorteConteoSnapshot, 'id'>>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      reconciliar_cortes_vencidos: {
        Args: {
          p_fecha_corte?: string;
        };
        Returns: number;
      };
      iniciar_corte_transaccional: {
        Args: {
          p_sucursal_id: string;
          p_cajero: string;
          p_testigo: string;
          p_venta_esperada?: number | null;
          p_cajero_id?: string | null;
          p_testigo_id?: string | null;
        };
        Returns: Corte;
      };
    };
    Enums: Record<string, never>;
  };
};

// ---------------------------------------------------------------------------
// 2. Variables de entorno
// ---------------------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Fallback de emergencia exclusivo para dominio productivo.
// El anon key de Supabase es publicable por diseño (publishable key).
const EMERGENCY_SUPABASE_URL = 'https://gjoeiqhxvbvdrgkjtohv.supabase.co';
const EMERGENCY_SUPABASE_ANON_KEY = 'sb_publishable_EdY_qwMvFmYCKMmaKZI-sw_T1NX4TKM';
const PRODUCTION_HOST_ALLOWLIST = new Set(['cashguard.paradisesystemlabs.com', 'www.cashguard.paradisesystemlabs.com']);

// Degradación controlada cuando no hay configuración válida.
// En lugar de throw que crashea toda la app/tests al importar el módulo,
// se usa un placeholder que falla en runtime solo cuando se intenta usar.
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

type SupabaseCredentialSource = 'env' | 'emergency-fallback' | 'placeholder';

interface ResolveSupabaseCredentialsInput {
  envUrl?: string;
  envAnonKey?: string;
  host?: string;
  isProd?: boolean;
}

interface ResolveSupabaseCredentialsOutput {
  url: string;
  anonKey: string;
  configured: boolean;
  source: SupabaseCredentialSource;
}

export function resolveSupabaseCredentials({
  envUrl,
  envAnonKey,
  host,
  isProd = false,
}: ResolveSupabaseCredentialsInput): ResolveSupabaseCredentialsOutput {
  if (envUrl && envAnonKey) {
    return {
      url: envUrl,
      anonKey: envAnonKey,
      configured: true,
      source: 'env',
    };
  }

  if (isProd && host && PRODUCTION_HOST_ALLOWLIST.has(host)) {
    return {
      url: EMERGENCY_SUPABASE_URL,
      anonKey: EMERGENCY_SUPABASE_ANON_KEY,
      configured: true,
      source: 'emergency-fallback',
    };
  }

  return {
    url: PLACEHOLDER_URL,
    anonKey: PLACEHOLDER_KEY,
    configured: false,
    source: 'placeholder',
  };
}

const runtimeHost =
  typeof window !== 'undefined' && typeof window.location?.hostname === 'string'
    ? window.location.hostname
    : undefined;

const resolvedCredentials = resolveSupabaseCredentials({
  envUrl: supabaseUrl,
  envAnonKey: supabaseAnonKey,
  host: runtimeHost,
  isProd: Boolean(import.meta.env.PROD),
});

if (resolvedCredentials.source === 'placeholder') {
  console.warn(
    '[supabase] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no configuradas. ' +
    'El cliente Supabase operará en modo degradado (las llamadas fallarán).'
  );
}

if (resolvedCredentials.source === 'emergency-fallback') {
  console.warn(
    '[supabase] Variables VITE_SUPABASE_* ausentes en producción; usando fallback de emergencia.'
  );
}

// ---------------------------------------------------------------------------
// 3. Cliente singleton
// ---------------------------------------------------------------------------

/** Cliente Supabase tipado — singleton para toda la aplicación. */
export const supabase = createClient<Database>(
  resolvedCredentials.url,
  resolvedCredentials.anonKey,
);

/** Indica si el cliente Supabase tiene credenciales reales configuradas. */
export const isSupabaseConfigured = resolvedCredentials.configured;

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
  rpc: (
    fn: keyof Database['public']['Functions'],
    args: Database['public']['Functions'][keyof Database['public']['Functions']]['Args'],
  ) => supabase.rpc(fn, args),
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

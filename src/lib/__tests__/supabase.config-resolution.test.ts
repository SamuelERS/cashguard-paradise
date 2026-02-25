import { describe, expect, it } from 'vitest';
import { resolveSupabaseCredentials } from '../supabase';

describe('resolveSupabaseCredentials', () => {
  it('prioriza variables de entorno cuando están definidas', () => {
    const result = resolveSupabaseCredentials({
      envUrl: 'https://env-project.supabase.co',
      envAnonKey: 'env-anon-key',
      host: 'cashguard.paradisesystemlabs.com',
      isProd: true,
    });

    expect(result.url).toBe('https://env-project.supabase.co');
    expect(result.anonKey).toBe('env-anon-key');
    expect(result.configured).toBe(true);
    expect(result.source).toBe('env');
  });

  it('usa fallback de emergencia en host productivo cuando faltan env vars', () => {
    const result = resolveSupabaseCredentials({
      envUrl: undefined,
      envAnonKey: undefined,
      host: 'cashguard.paradisesystemlabs.com',
      isProd: true,
    });

    expect(result.configured).toBe(true);
    expect(result.source).toBe('emergency-fallback');
    expect(result.url).toContain('.supabase.co');
    expect(result.url).not.toContain('placeholder.supabase.co');
  });

  it('mantiene placeholder fuera de producción para evitar escribir en DB real por accidente', () => {
    const result = resolveSupabaseCredentials({
      envUrl: undefined,
      envAnonKey: undefined,
      host: 'localhost',
      isProd: false,
    });

    expect(result.configured).toBe(false);
    expect(result.source).toBe('placeholder');
    expect(result.url).toContain('placeholder.supabase.co');
  });
});

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const supabasePath = path.resolve(process.cwd(), 'src/lib/supabase.ts');

function loadSupabaseSource(): string {
  return readFileSync(supabasePath, 'utf8');
}

function extractTableBlock(source: string, tableName: string): string {
  const startToken = `${tableName}: {`;
  const startIndex = source.indexOf(startToken);
  if (startIndex === -1) return '';

  const endToken = '\n      };';
  const endIndex = source.indexOf(endToken, startIndex);
  if (endIndex === -1) return source.slice(startIndex);

  return source.slice(startIndex, endIndex);
}

describe('supabase.ts schema contract', () => {
  it('expone helper de snapshots de conteo', () => {
    const source = loadSupabaseSource();
    expect(source).toContain("corteConteoSnapshots: () => supabase.from('corte_conteo_snapshots')");
  });

  it('empleados usa columnas reales (sin rol/cargo)', () => {
    const source = loadSupabaseSource();
    const block = extractTableBlock(source, 'empleados');

    expect(block).toContain('created_at: string;');
    expect(block).toContain('updated_at: string;');
    expect(block).not.toMatch(/\brol\s*:\s*string\s*\|\s*null/);
    expect(block).not.toMatch(/\bcargo\s*:\s*string\s*\|\s*null/);
  });

  it('empleado_sucursales usa forma real de tabla pivote', () => {
    const source = loadSupabaseSource();
    const block = extractTableBlock(source, 'empleado_sucursales');

    expect(block).toContain('empleado_id: string;');
    expect(block).toContain('sucursal_id: string;');
    expect(block).toContain('created_at: string;');
    expect(block).not.toMatch(/\bid\s*:\s*string/);
    expect(block).not.toMatch(/\bactivo\s*:\s*boolean/);
  });
});

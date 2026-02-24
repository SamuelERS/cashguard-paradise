import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');

function readAllMigrations(): string {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  return files
    .map((file) => readFileSync(path.join(migrationsDir, file), 'utf8'))
    .join('\n\n');
}

describe('Supabase migrations contract', () => {
  it('incluye tabla de snapshots de conteo', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/create\s+table\s+if\s+not\s+exists\s+public\.corte_conteo_snapshots/i);
  });

  it('incluye índice para queries supervisor por finalizado_at', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/idx_cortes_estado_finalizado/i);
  });

  it('incluye unicidad parcial para un corte activo por sucursal', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/uq_cortes_activo_por_sucursal/i);
    expect(sql).toMatch(/on\s+public\.cortes\s*\(sucursal_id\)/i);
    expect(sql).toMatch(/estado\s+in/i);
  });

  it('incluye unicidad parcial para intento activo por corte', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/uq_intento_activo_por_corte/i);
    expect(sql).toMatch(/on\s+public\.corte_intentos\s*\(corte_id\)/i);
    expect(sql).toMatch(/estado\s*=\s*''?ACTIVO''?/i);
  });

  it('incluye constraint de cajero y testigo distintos', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/chk_cajero_testigo_distintos/i);
  });

  it('incluye constraint que obliga finalizado_at en estados terminales', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/chk_cortes_terminal_timestamp/i);
    expect(sql).toMatch(/estado\s+in\s*\(\s*'FINALIZADO'\s*,\s*'ABORTADO'\s*\)\s+and\s+finalizado_at\s+is\s+not\s+null/i);
  });

  it('incluye función de reconciliación diaria de cortes vencidos', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/create\s+or\s+replace\s+function\s+public\.reconciliar_cortes_vencidos/i);
    expect(sql).toMatch(/set\s+estado\s*=\s*'ABORTADO'/i);
    expect(sql).toMatch(/finalizado_at\s*=\s*coalesce\s*\(\s*finalizado_at\s*,\s*now\(\)\s*\)/i);
  });
});

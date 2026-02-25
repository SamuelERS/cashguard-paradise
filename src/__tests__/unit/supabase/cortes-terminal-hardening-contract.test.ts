import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');

function readAllMigrations(): string {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  return files
    .map((file) => readFileSync(path.join(migrationsDir, file), 'utf8'))
    .join('\n\n');
}

describe('Supabase cortes terminal hardening contract', () => {
  it('define trigger de inmutabilidad para cortes terminales', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/prevent_terminal_corte_mutation/i);
    expect(sql).toMatch(/trg_cortes_prevent_terminal_mutation/i);
  });

  it('elimina policy anon_rw_cortes abierta y define policies granulares', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/drop policy if exists anon_rw_cortes/i);
    expect(sql).toMatch(/create policy .*cortes_select/i);
    expect(sql).toMatch(/create policy .*cortes_insert/i);
    expect(sql).toMatch(/create policy .*cortes_update_non_terminal/i);
  });

  it('bloquea UPDATE y DELETE en cortes FINALIZADO/ABORTADO', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/raise exception 'Corte terminal inmutable'/i);
    expect(sql).toMatch(/before update or delete on public\.cortes/i);
  });

  it('policy update solo permite filas no terminales', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/create policy .*cortes_update_non_terminal/i);
    expect(sql).toMatch(/using\s*\(\s*estado\s+in\s*\(\s*'INICIADO'\s*,\s*'EN_PROGRESO'\s*\)\s*\)/i);
  });

  it('define trigger de inmutabilidad para corte_intentos terminales', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/prevent_terminal_intento_mutation/i);
    expect(sql).toMatch(/trg_intentos_prevent_terminal_mutation/i);
  });
});

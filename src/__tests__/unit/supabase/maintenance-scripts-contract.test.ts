import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const maintenanceDir = path.resolve(process.cwd(), 'supabase/maintenance');
const qaDir = path.resolve(process.cwd(), 'docs/qa');

function readSql(fileName: string): string {
  return readFileSync(path.join(maintenanceDir, fileName), 'utf8');
}

describe('Supabase maintenance scripts contract', () => {
  it('incluye scripts base de diagnostico/reset/seed', () => {
    expect(existsSync(path.join(maintenanceDir, '000_diagnostics_cortes.sql'))).toBe(true);
    expect(existsSync(path.join(maintenanceDir, '010_reset_operational_data.sql'))).toBe(true);
    expect(existsSync(path.join(maintenanceDir, '020_seed_cortes_realistas.sql'))).toBe(true);
  });

  it('reset solo toca tablas operativas de cortes', () => {
    const sql = readSql('010_reset_operational_data.sql');
    expect(sql).toMatch(/begin;[\s\S]*commit;/i);
    expect(sql).toMatch(
      /truncate\s+table\s+public\.corte_conteo_snapshots\s*,\s*public\.corte_intentos\s*,\s*public\.cortes/i,
    );
    expect(sql).toMatch(/restart\s+identity/i);
    expect(sql).toMatch(/notify\s+pgrst\s*,\s*'reload schema'/i);
    expect(sql).not.toMatch(/truncate\s+table\s+public\.sucursales/i);
    expect(sql).not.toMatch(/truncate\s+table\s+public\.empleados/i);
    expect(sql).not.toMatch(/truncate\s+table\s+public\.empleado_sucursales/i);
  });

  it('diagnostics reporta estados activos invalidos y divergencias corte/intento', () => {
    const sql = readSql('000_diagnostics_cortes.sql');
    expect(sql).toMatch(/estado\s+in\s*\(\s*'INICIADO'\s*,\s*'EN_PROGRESO'\s*\)/i);
    expect(sql).toMatch(/finalizado_at\s+is\s+not\s+null/i);
    expect(sql).toMatch(/left\s+join\s+public\.corte_intentos/i);
    expect(sql).toMatch(/where\s+c\.estado\s+in\s*\(\s*'INICIADO'\s*,\s*'EN_PROGRESO'\s*\)\s+and\s+i\.id\s+is\s+null/i);
    expect(sql).toMatch(/group\s+by\s+sucursal_id/i);
    expect(sql).toMatch(/having\s+count\(\*\)\s*>\s*1/i);
  });

  it('seed incluye casos FINALIZADO y EN_PROGRESO con intentos/snapshots consistentes', () => {
    const sql = readSql('020_seed_cortes_realistas.sql');
    expect(sql).toMatch(/insert\s+into\s+public\.cortes/i);
    expect(sql).toMatch(/'FINALIZADO'/i);
    expect(sql).toMatch(/'EN_PROGRESO'/i);
    expect(sql).toMatch(/insert\s+into\s+public\.corte_intentos/i);
    expect(sql).toMatch(/'ACTIVO'/i);
    expect(sql).toMatch(/datos_conteo/i);
    expect(sql).toMatch(/datos_entrega/i);
    expect(sql).toMatch(/gastos_dia/i);
    expect(sql).toMatch(/insert\s+into\s+public\.corte_conteo_snapshots/i);
    expect(sql).toMatch(/'manual'|'autosave'/i);
  });

  it('incluye runbook QA para reset y validacion supervisor/nocturno', () => {
    const runbookPath = path.join(qaDir, 'supabase-reset-y-validacion-cortes.md');
    expect(existsSync(runbookPath)).toBe(true);

    const markdown = readFileSync(runbookPath, 'utf8');
    expect(markdown).toMatch(/000_diagnostics_cortes\.sql/i);
    expect(markdown).toMatch(/010_reset_operational_data\.sql/i);
    expect(markdown).toMatch(/020_seed_cortes_realistas\.sql/i);
    expect(markdown).toMatch(/Dashboard Supervisor/i);
    expect(markdown).toMatch(/Corte Nocturno/i);
  });
});

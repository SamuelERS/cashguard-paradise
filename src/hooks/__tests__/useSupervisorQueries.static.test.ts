// 🤖 [IA] - Orden #5 DACC Dashboard Supervisor — Tests estáticos useSupervisorQueries
// TDD RED: Verifican estructura del código (filtros fecha + estado concurrente).
// Patrón readFileSync + regex — sin render, sin jsdom, máxima velocidad.

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Lectura del código fuente
// ---------------------------------------------------------------------------

const HOOK_PATH = resolve(__dirname, '../useSupervisorQueries.ts');
const hookSource = readFileSync(HOOK_PATH, 'utf-8');

// Bloques aislados por función para evitar falsos positivos entre queries.
function extraerBloque(inicio: string, fin: string): string {
  const startIdx = hookSource.indexOf(inicio);
  const endIdx = hookSource.indexOf(fin, startIdx + 1);
  if (startIdx === -1 || endIdx === -1) return '';
  return hookSource.slice(startIdx, endIdx);
}

const bloqueCortesDelDia = extraerBloque('Query 1: Cortes del día', 'Query 2: Detalle de corte');
const bloqueHistorial = extraerBloque('Query 3: Historial filtrado', 'Query 4: Listas para filtros');

// ---------------------------------------------------------------------------
// Suite 1: Filtros de fecha deben usar finalizado_at
// ---------------------------------------------------------------------------

describe('useSupervisorQueries — filtros de fecha', () => {
  it('obtenerCortesDelDia combina finalizado_at y created_at por tipo de actividad', () => {
    // Actividad de hoy:
    // - FINALIZADO se filtra por finalizado_at
    // - INICIADO/EN_PROGRESO se filtran por created_at
    expect(bloqueCortesDelDia).toMatch(/\.gte\(\s*['"]finalizado_at['"]/);
    expect(bloqueCortesDelDia).toMatch(/\.lte\(\s*['"]finalizado_at['"]/);
    expect(bloqueCortesDelDia).toMatch(/\.gte\(\s*['"]created_at['"]/);
    expect(bloqueCortesDelDia).toMatch(/\.lte\(\s*['"]created_at['"]/);
    expect(bloqueCortesDelDia).toMatch(/\.in\(\s*['"]estado['"]\s*,\s*\[\s*['"]INICIADO['"]\s*,\s*['"]EN_PROGRESO['"]\s*\]\s*\)/);
  });

  it('obtenerHistorial soporta rango por finalizado_at y created_at según estado', () => {
    // Historial inteligente:
    // - FINALIZADO usa finalizado_at
    // - TODOS / estados no finalizados usan created_at
    expect(bloqueHistorial).toMatch(/estadoFiltro\s*===\s*['"]FINALIZADO['"]/);
    expect(bloqueHistorial).toMatch(/\.gte\(\s*['"]finalizado_at['"]/);
    expect(bloqueHistorial).toMatch(/\.lte\(\s*['"]finalizado_at['"]/);
    expect(bloqueHistorial).toMatch(/\.gte\(\s*['"]created_at['"]/);
    expect(bloqueHistorial).toMatch(/\.lte\(\s*['"]created_at['"]/);
  });
});

// ---------------------------------------------------------------------------
// Suite 2: Estado concurrente seguro (contador, no boolean)
// ---------------------------------------------------------------------------

describe('useSupervisorQueries — estado concurrente', () => {
  it('usa contador de queries pendientes en lugar de useState<boolean> para cargando', () => {
    // Un boolean compartido `setCargando(false)` en finalizarQuery() causa race
    // conditions cuando 2+ queries corren en paralelo (ej: obtenerListasFiltros +
    // obtenerHistorial en CorteHistorial). Un contador decrementa correctamente.
    expect(hookSource).not.toMatch(/useState<boolean>\(\s*false\s*\)/);
    expect(hookSource).toMatch(/pendientes/);
  });

  it('cargando se deriva del contador (pendientes > 0)', () => {
    // `cargando` debe ser un valor derivado, no un state directo.
    expect(hookSource).toMatch(/pendientes\s*>\s*0/);
  });

  it('iniciarQuery incrementa el contador', () => {
    expect(hookSource).toMatch(/prev\s*\+\s*1/);
  });

  it('finalizarQuery decrementa el contador', () => {
    expect(hookSource).toMatch(/prev\s*-\s*1/);
  });
});

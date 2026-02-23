# Caso: QA Legacy — Operación Isla Rápida

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-01-27 |
| **Fecha cierre** | 2026-01-28 |
| **Fecha actualización** | 2026-02-05 |
| **Estado** | 🟢 Completado |
| **Prioridad** | Alta (en su momento) |
| **Responsable** | SamuelERS / AI Assistant |
| **Commit clave** | `ebd82a1` |

## Resumen Ejecutivo

Refactor del setup global de tests + habilitación de paralelismo real en Vitest.
Anteriormente conocido como carpeta legacy `qa/`, formalizado como Caso en 2026-02-05.

**Problema resuelto:** `setup.ts` tenía 321 líneas con mocks globales indiscriminados.
Varios causaban contaminación entre tests y degradaban el aislamiento.

**Solución implementada:**
- `setup.ts` reducido de 321 → ~145 líneas (-55%)
- Mocks no-universales migrados a `src/testing/mocks/browser-apis.ts` y `src/testing/mocks/storage.ts`
- Paralelismo real habilitado: `pool: forks`, `maxForks: 4`
- Guardrails anti-flake integrados en `afterEach`

**Métricas finales:**
- Smoke tests: 10/10 passing ✅
- Flake rate: 0.2% (2/972 tests) ✅
- Estabilidad: 3/3 runs consistentes ✅
- Build: 14.65s, 353.77 kB gzip ✅

## Documentos en este caso

- `tests/031-operacion-isla-rapida.md` — Análisis completo de `setup.ts` (12 bloques),
  tasks A-E, smoke tests, resultados de estabilidad y veredicto final.

## Archivos afectados en el proyecto

- `src/__tests__/setup.ts` (original, 321 líneas)
- `src/__tests__/setup.minimal.ts` (creado, ~145 líneas)
- `src/testing/mocks/browser-apis.ts` (creado, 318 líneas)
- `src/testing/mocks/storage.ts` (creado, 130 líneas)
- `vitest.config.ts` (pool: forks, maxForks: 4)

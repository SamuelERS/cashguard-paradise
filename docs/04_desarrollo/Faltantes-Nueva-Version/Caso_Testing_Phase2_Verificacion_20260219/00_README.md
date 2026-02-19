> ⚠️ Corregido 2026-02-19: Lineas del componente corregidas de 783 a 570. Tests totales: 100 (86 activos + 14 skipped), no 87.

# Caso: Testing Phase2VerificationSection — Cobertura Anti-Fraude

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-19 |
| **Fecha actualización** | 2026-02-19 |
| **Estado** | 🔴 Pendiente |
| **Prioridad** | Media |
| **Responsable** | Claude Code (Opus 4.6) |

## Resumen

`Phase2VerificationSection` es el componente anti-fraude más importante del sistema (570 líneas, conteo ciego) y sus tests están a ~28% de cobertura. Los tests se escribieron pero la mayoría fallan por problemas de timing con modales async de Radix UI. Es deuda técnica que eventualmente hay que pagar.

## Contexto

Este componente implementa la verificación ciega: el cajero cuenta denominaciones sin ver el valor esperado, con sistema de triple intento (correcto → retry → force/accept). Es el núcleo anti-fraude del sistema. Tener solo 28% de tests passing significa que cambios futuros pueden romper la lógica sin que nadie se entere.

## Hallazgos de Investigación

### Estado Actual de Tests
- **Archivo**: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx`
- **Tests totales**: 100 (86 activos + 14 skipped) en 8 grupos funcionales
- **Tests passing**: ~28 de 86 activos (~33%)
- **Tests failing**: ~58 de 86 activos (~67%)
- **Tests skipped**: 14 (`it.skip`)
- **Duración**: ~3.5s local, ~7s Docker

### 4 Root Causes Identificados

| # | Root Cause | Tests Afectados | Solucionable |
|---|-----------|-----------------|-------------|
| 1 | Radix UI AlertDialog async — `getByText()` falla cuando modal toma 100-300ms | ~45 tests | ✅ `findByText()` + `waitFor()` |
| 2 | `getCurrentInput()` bloqueado por modal overlay | ~15 tests | ✅ Filtrar por `aria-hidden` |
| 3 | Transiciones entre denominaciones asumidas síncronas | ~10 tests | ✅ `waitFor(() => expect(...))` |
| 4 | Edge cases `buildVerificationBehavior` | ~6 tests | ✅ Debug paso a paso |

### Componente Monolítico
- **570 líneas** — Candidato a refactorización según `reducing-entropy` skill
- Mezcla UI + lógica de negocio + state management
- 5 elementos anti-fraude controlados por `SHOW_REMAINING_AMOUNTS` flag

### Tests por Grupo Funcional

| Grupo | Tests | Passing | Descripción |
|-------|-------|---------|-------------|
| 1. Inicialización | 8 | 8 (100%) | Props y render básico |
| 2. Primer Intento Correcto | 12 | 6 (50%) | Flujo happy path |
| 3. Primer Intento Incorrecto | 15 | 3 (20%) | Modal "Volver a contar" |
| 4. Segundo Intento Patterns | 20 | 3 (15%) | Override, retry, force |
| 5. Tercer Intento Patterns | 18 | 2 (11%) | Critical severe/inconsistent |
| 6. buildVerificationBehavior | 10 | 4 (40%) | Objeto final behavior |
| 7. Navigation & UX | 12 | 6 (50%) | Navegación, badges |
| 8. Regresión Bugs | 4 | 3 (75%) | Bugs históricos |

### Esfuerzo Estimado
- Fase 1 (Quick Wins): 2-3h → ~62% passing
- Fase 2 (Modales Async): 3-4h → ~90% passing
- Fase 3 (Edge Cases): 2-3h → 100% passing
- **Total: 7-10 horas**

## Documentos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_Diagnostico_Tests_Actuales.md` | Estado detallado de cada grupo + root causes | ✅ Completado |
| `02_Plan_Refactorizacion_Tests.md` | Plan 3 fases (10 tasks) para llegar a 100% passing | ✅ Completado |

## Resultado

[Completar cuando los tests pasen al 100%]

## Referencias

- `src/components/phases/Phase2VerificationSection.tsx` — Componente (570 líneas)
- `src/components/phases/__tests__/Phase2VerificationSection.test.tsx` — Tests actuales
- `src/hooks/useBlindVerification.ts` — Hook de verificación ciega
- `src/hooks/usePhaseManager.ts` — Orquestador de fases
- Caso anterior: `docs/04_desarrollo/Caso_Phase2_Verification_100_Coverage/`

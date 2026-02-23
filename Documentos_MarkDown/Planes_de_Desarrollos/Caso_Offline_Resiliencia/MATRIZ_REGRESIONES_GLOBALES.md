# Matriz de Regresiones Globales — Rama `feature/ot11-activar-corte-page-ui`

**Fecha:** 2026-02-22
**Commit referencia:** `cf8f888` (HEAD)
**Evidencia preexistencia:** Los 16 fails se reproducen idénticamente al revertir a `b93d4ea` (pre-Caso #3).
**Veredicto:** 0/16 introducidos por Caso #3. Todos preexistentes.

---

## Resumen

| Métrica | Valor |
|---------|-------|
| Tests globales | 1465 (1415 pass, 16 fail, 34 skip) |
| Archivos fallando | 5 |
| Preexistentes | **16/16 (100%)** |
| Introducidos Caso #3 | **0/16** |

---

## Detalle por archivo

### 1. `src/__tests__/ux-audit/operation-selector.test.ts` — 2 fails

| # | Test | Causa | Categoría |
|---|------|-------|-----------|
| 1 | 4.1 — viewportScale pattern eliminado | Test estático busca ausencia de `viewportScale` con regex desactualizada tras refactors posteriores al audit original | Stale static test |
| 2 | 4.3 — Máximo 40 bloques style={{}} | Código fuente tiene >40 bloques style={{}} actualmente (drift desde audit P2) | Measurement drift |

**Dueño probable:** Caso UX/UI Audit (v3.5.0)
**Riesgo:** Bajo — tests de auditoría estática, no afectan runtime

---

### 2. `src/hooks/__tests__/useSucursales.test.ts` — 10 fails

| # | Test | Causa | Categoría |
|---|------|-------|-----------|
| 3 | 1.2 — sucursales activas (2 de 3) | Mock Supabase retorna 0 resultados; test espera 2 | Mock chain mismatch |
| 4 | 1.3 — San Benito NO aparece | Cascada de 1.2 | Cascade |
| 5 | 1.4 — select/eq/order correctos | Mock no registra llamadas (chain roto) | Mock chain mismatch |
| 6 | 2.1 — error establece string | Mock error path no dispara | Mock chain mismatch |
| 7 | 2.3 — error se limpia al recargar | Cascada de 2.1 | Cascade |
| 8 | 2.4 — exception desconocida | Mock throw path no dispara | Mock chain mismatch |
| 9 | 3.2 — recargar() actualiza | Cascada de mock roto | Cascade |
| 10 | 4.1 — 2 sucursales activas | Cascada de mock roto | Cascade |
| 11 | 4.3 — códigos H y M | Cascada de mock roto | Cascade |
| 12 | 5.2 — race conditions | Cascada de mock roto | Cascade |
| 13 | 5.3 — re-render hook | Cascada de mock roto | Cascade |

**Dueño probable:** Caso Supabase integration (mock de `tables.sucursales()` no alineado con implementación actual)
**Riesgo:** Medio — indica que mock Supabase chain `.select().eq().order()` cambió sin actualizar tests
**Root cause:** El hook `useSucursales` probablemente fue refactorizado (nueva API de tables) sin actualizar la cadena mock

---

### 3. `src/components/initial-wizard/__tests__/ActiveSessionStep5.test.tsx` — 1 fail

| # | Test | Causa | Categoría |
|---|------|-------|-----------|
| 14 | T5 — "Abortar Sesión" button calls onAbortSession | `fireEvent.click` no dispara callback; probable mismatch entre label del botón en test vs componente real | Selector mismatch |

**Dueño probable:** Caso Active Session (SANN-R2)
**Riesgo:** Bajo — un solo test de interacción UI

---

### 4. `src/hooks/initial-wizard/__tests__/useInitialWizardController.test.ts` — 1 fail

| # | Test | Causa | Categoría |
|---|------|-------|-----------|
| 15 | preselecciona store cuando initialSucursalId proporcionado | `mockUpdateWizardData` nunca se llama; useEffect de preselección probablemente tiene timing async no cubierto por el test | Timing / async gap |

**Dueño probable:** Caso Initial Wizard preselection
**Riesgo:** Bajo — feature de preselección, test no espera ciclo async

---

### 5. `src/hooks/morning-verification/__tests__/useMorningVerificationController.test.ts` — 1 fail

| # | Test | Causa | Categoría |
|---|------|-------|-----------|
| 16 | muestra error si faltan ids requeridos | `toast.error` no se llama; mock de `sonner` no intercepta correctamente la función | Mock setup issue |

**Dueño probable:** Caso Morning Verification controller
**Riesgo:** Bajo — validación edge case

---

## Distribución por categoría

| Categoría | Cantidad | % |
|-----------|----------|---|
| Mock chain mismatch | 4 | 25% |
| Cascade (dependen de mock roto) | 7 | 44% |
| Stale static test | 1 | 6% |
| Measurement drift | 1 | 6% |
| Selector mismatch | 1 | 6% |
| Timing / async gap | 1 | 6% |
| Mock setup issue | 1 | 6% |

---

## Política propuesta

Los 16 fails son **deuda técnica preexistente** no relacionada con Caso #3 Resiliencia Offline.
Se reportan como evidencia formal para que el Director decida:

- **Opción A:** Resolver en bloque dedicado antes de merge a main
- **Opción B:** Marcar con `.skip` + ticket de deuda técnica y merge con política explícita
- **Opción C:** Resolver solo los de riesgo medio (useSucursales mock chain, 10 tests) y skip el resto

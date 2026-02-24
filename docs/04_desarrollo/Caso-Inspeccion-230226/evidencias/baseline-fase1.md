# FASE 1 — Baseline Reproducible
**Fecha:** 2026-02-23  
**Rama:** feature/ot11-activar-corte-page-ui

---

## 1. npx vitest run

```
Test Files  95 passed | 1 skipped (96)
     Tests  1489 passed | 34 skipped (1523)
  Duration  8.18s
```

**Detalle de tests skipped (34):**

### CashCalculation.test.tsx — 23 skips (describe.skip)
- `describe.skip('CashCalculation - v1.3.7 WhatsApp Confirmation Flow')` → 23 tests
  - Grupo 1: 5 tests (estado inicial bloqueado)
  - Grupo 2: 5 tests (flujo WhatsApp exitoso)
  - Grupo 3: 4 tests (pop-up bloqueado)
  - Grupo 4: 3 tests (auto-confirmación timeout)
  - Grupo 5: 3 tests (banners adaptativos)

### Phase2VerificationSection.test.tsx — 11 skips (it.skip)
- 2.5 - Primer intento correcto muestra "Cantidad correcta"
- 2.7 - Último paso con primer intento correcto muestra "Verificación Exitosa"
- 3.2 - Modal muestra mensaje correcto (primer intento)
- 3.3 - Modal muestra denominación correcta en label
- 3.13 - Modal type "incorrect" tiene ícono ⚠️
- 3.14 - Botón "Volver a contar" tiene clase correcta
- 3.15 - ESC key cierra modal (Radix UI default behavior)
- 7.2 - Botón "Anterior" deshabilitado en primer paso
- 7.3 - Botón "Anterior" habilitado después de avanzar
- 7.4 - Click "Anterior" abre modal de confirmación
- 7.5 - Modal retroceso tiene botones correctos

### Nota: discrepancia
- vitest reporta 34 skipped pero rg cuenta 16 .skip calls → el describe.skip añade 23 tests (1 describe = 23 tests)
- Archivos afectados: 3 (CashCalculation + Phase2VerificationSection + pwa-install.spec.ts)

---

## 2. npx tsc --noEmit

```
✓ 0 errors, 0 warnings
```

---

## 3. npm run build

```
dist/assets/index-B790fgMN.js   1,461.63 kB │ gzip: 408.70 kB

(!) Some chunks are larger than 500 kB after minification.
```

**⚠ WARNING:** Chunk de 1,461 kB supera límite de 500 kB.

---

## 4. Artefactos .bak/.backup encontrados (5)

```
CLAUDE.md.bak
src/pages/Index.tsx.backup
src/components/phases/__tests__/Phase2VerificationSection.test.tsx.bak
src/hooks/useWizardNavigation.ts.backup
docs/_archivo/2025/_CHANGELOG/CLAUDE-ARCHIVE-OCT-2025.md.bak
```

---

## 5. Resumen de deuda técnica

| Deuda | Estado |
|-------|--------|
| 16 `.skip` calls (34 tests) | ❌ Pendiente FASE 2 |
| poolOptions deprecation warning | ❌ Pendiente FASE 3 |
| 5 artefactos .bak/.backup | ❌ Pendiente FASE 4 |
| Chunk 1,461 kB > 500 kB | ❌ Pendiente FASE 5 |
| Sin guardrails anti-regresión | ❌ Pendiente FASE 6 |


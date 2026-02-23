# Caso: Consolidación de Imágenes de Denominaciones

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-22 |
| **Fecha actualización** | 2026-02-22 |
| **Estado** | ✅ Completado — 2026-02-22 |
| **Prioridad** | Alta (deuda técnica activa, duplicación en 2 componentes críticos) |
| **Responsable** | Claude Code |
| **Originado por** | DACC Directiva D-04 + DIRM Protocol |

---

## Problema Central

`DeliveryFieldView.tsx` y `GuidedFieldView.tsx` contienen funciones `getIcon()` locales que
duplican exactamente las 11 rutas de imágenes de denominaciones que ya gestiona la utilidad
central `denomination-images.tsx` (single source of truth).

Esta duplicación viola el principio DRY y significa que cualquier cambio de ruta o imagen
debe hacerse en **3 lugares diferentes** en lugar de 1.

---

## Origen del Caso

Este caso surge de la **DACC Audit** ejecutada el 2026-02-22 sobre los commits
`e21b7ad`, `8d966ba`, `4d2c7e7` (corrección de nomenclatura de 6 archivos de imagen).
El auditor identificó que la corrección fue aplicada en `denomination-images.tsx` pero
los componentes `DeliveryFieldView` y `GuidedFieldView` **siguen usando rutas hardcodeadas
en sus propias funciones `getIcon()`**, desacopladas de la utilidad central.

Ver: `04_Reporte_Ejecutivo_Origen.md` para el contexto completo de la auditoría.

---

## Alcance de la Consolidación

### Componentes afectados

| Componente | Función local | Líneas | Estado |
|-----------|--------------|--------|--------|
| `DeliveryFieldView.tsx` | `getIcon()` líneas 173–238 | 66 líneas | ✅ Migrado (OT #078) |
| `GuidedFieldView.tsx` | `getIcon()` líneas 192–304 | 113 líneas | ✅ Migrado (OT #079, logos electrónicos preservados) |
| `denomination-images.tsx` | `DENOMINATION_IMAGE_MAP` + `getDenominationImageElement()` | 88 líneas | ✅ Single source of truth |

### Lo que se consolida (11 denominaciones)
Las 11 entradas de `CashCount` (penny, nickel, dime, quarter, dollarCoin, bill1, bill5,
bill10, bill20, bill50, bill100) con sus rutas correspondientes en
`/monedas-recortadas-dolares/`.

### Lo que NO se consolida (manejo especial)
Los 4 logos de pagos electrónicos en `GuidedFieldView.tsx`:
- `bac-logo.webp` (Credomatic)
- `banco promerica logo.png`
- `transferencia-bancaria.png`
- `paypal-logo.png`

Estos NO son `keyof CashCount` y NO pertenecen a `denomination-images.tsx`. Se mantienen
en `GuidedFieldView` o se refactorizan por separado en un futuro caso.

---

## Bloqueadores Pre-Implementación

1. **BLOQUEADOR CRÍTICO**: `denomination-images.tsx` no tiene `onError` handler.
   Ambos componentes actuales usan `onError={e => (e.currentTarget.src = '/placeholder.svg')}`.
   Debe agregarse **antes** de cualquier migración. Ver `02_Riesgos_y_Bloqueadores.md`.

2. **TDD Obligatorio**: DACC Directiva D-03 exige tests que fallen primero.
   El test para `onError` debe escribirse antes de implementar el handler.

---

## Documentos de este Caso

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_Investigacion_Root_Cause.md` | Evidencia técnica: qué duplica cada componente | ✅ Completado |
| `02_Riesgos_y_Bloqueadores.md` | Riesgos de migración + casos especiales | ✅ Completado |
| `03_Arquitectura_Propuesta.md` | Estrategia de consolidación en 3 fases | ✅ Completado |
| `04_Reporte_Ejecutivo_Origen.md` | Reporte de la auditoría DACC que originó el caso | ✅ Completado |

## Plan de Implementación

Ver: `docs/plans/2026-02-22-consolidacion-denomination-images.md`

---

## Criterios de Éxito

- [x] `denomination-images.tsx` tiene `onError` con fallback a `/placeholder.svg`
- [x] Test de `onError` escrito y pasando
- [x] Suite 3 de `denomination-images.test.tsx` pasa (archivos físicos existen)
- [x] `DeliveryFieldView.tsx` usa `getDenominationImageElement()` o `DENOMINATION_IMAGE_MAP`
- [x] `GuidedFieldView.tsx` usa `getDenominationImageElement()` o `DENOMINATION_IMAGE_MAP` para las 11 denominaciones
- [x] Los 4 logos electrónicos en `GuidedFieldView` se mantienen intactos
- [x] TypeScript: 0 errors
- [x] Tests: 8/8 passing (denomination-images suite)
- [x] CLAUDE.md actualizado

---

## Referencias

- `src/utils/denomination-images.tsx` — Single source of truth
- `src/components/cash-counting/DeliveryFieldView.tsx` (líneas 173–238)
- `src/components/cash-counting/GuidedFieldView.tsx` (líneas 192–304)
- `src/utils/__tests__/denomination-images.test.tsx`
- `docs/plans/2026-02-22-consolidacion-denomination-images.md`
- `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Imagenes_Denominaciones_20260219_COMPLETADO/`

---

## Cierre del Caso

| OT | Acción | Commit | Resultado |
|----|--------|--------|-----------|
| OT #076 | TDD RED: Suite 4 failing | `9413df5` | ✅ 8 tests (7 pass, 1 fail expected) |
| OT #077 | TDD GREEN: onError en denomination-images.tsx | `8ba111a` | ✅ 8/8 passing |
| OT #078 | REFACTOR: DeliveryFieldView migrado a DENOMINATION_IMAGE_MAP | `b249a27` | ✅ -28 líneas |
| OT #079 | REFACTOR: GuidedFieldView migrado a DENOMINATION_IMAGE_MAP | `ad5d154` | ✅ case 'electronic' preservado |
| OT #080 | Cierre de caso | (este commit) | ✅ |

**Resultado:** Las 11 rutas de denominaciones ahora tienen un único punto de verdad (`DENOMINATION_IMAGE_MAP`). Cualquier cambio de ruta se hace en 1 lugar en vez de 3.

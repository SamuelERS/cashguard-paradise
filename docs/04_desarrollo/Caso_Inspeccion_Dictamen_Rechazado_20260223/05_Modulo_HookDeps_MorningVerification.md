# Módulo Correctivo H5: Hook Dependencies — useMorningVerificationController

| Campo     | Valor                                          |
|-----------|-------------------------------------------------|
| Severidad | 🟡 Medio                                       |
| Estado    | 🔴 Pendiente                                   |
| Tipo      | React Hooks / Performance                       |
| Archivo   | `src/hooks/morning-verification/useMorningVerificationController.ts` |
| Línea     | ~195                                            |

---

## Hallazgo Original

> Warning de hooks deps en `useMorningVerificationController.ts` (line 195) (`react-hooks/exhaustive-deps`).

## Root Cause

El array de dependencias de `handleWhatsAppSend` incluye objetos que no se usan directamente en el callback, causando recreaciones innecesarias:

```typescript
// Línea ~195 (array de dependencias):
}, [store, cashierIn, cashierOut, report, handleCopyToClipboard]);
```

**Problema:** `store`, `cashierIn`, `cashierOut` son objetos que se recrean en cada render (via `useMemo`). El callback solo usa `report` (que ya depende de ellos internamente), `storeId`, `cashierId`, `witnessId` y `handleCopyToClipboard`.

## Análisis de Impacto

| Dependencia actual | ¿Se usa directamente? | ¿Necesaria en deps? |
|-------------------|-----------------------|---------------------|
| `store`           | ❌ Solo via `report`  | ❌ No               |
| `cashierIn`       | ❌ Solo via `report`  | ❌ No               |
| `cashierOut`      | ❌ Solo via `report`  | ❌ No               |
| `report`          | ✅ Sí                 | ✅ Sí               |
| `handleCopyToClipboard` | ✅ Sí           | ✅ Sí               |

## Estrategia Correctiva

### Paso 1: Auditar el cuerpo de `handleWhatsAppSend`

Leer el callback completo para confirar qué variables usa directamente.

### Paso 2: Ajustar dependencias

Remover las dependencias que no se leen directamente en el callback. Agregar las que faltan (si ESLint las reporta).

### Paso 3: Validar

```bash
npm run lint  # Warning react-hooks/exhaustive-deps debe desaparecer
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `useMorningVerificationController.ts` | Ajustar deps array de `handleWhatsAppSend` |

## Criterio de Aceptación

- [ ] Warning `react-hooks/exhaustive-deps` eliminado en este archivo
- [ ] Comportamiento funcional idéntico
- [ ] No se introducen closures stale
- [ ] `npm run lint` no agrega nuevos warnings

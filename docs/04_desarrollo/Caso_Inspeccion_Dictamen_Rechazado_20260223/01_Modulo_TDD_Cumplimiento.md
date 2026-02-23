# Módulo Correctivo H1: Cumplimiento TDD (RED→GREEN→REFACTOR)

| Campo     | Valor                              |
|-----------|------------------------------------|
| Severidad | 🔴 Crítico (Bloqueante)            |
| Estado    | 🔴 Pendiente                       |
| Tipo      | Proceso / Evidencia de commits     |

---

## Hallazgo Original

> fb33d7a (2026-02-22 21:52:57) introduce funcionalidad en OperationSelector.tsx sin commit RED previo asociado; los ajustes de tests llegan después en 9e94799 (2026-02-23 00:25:01).

> En 1f729f4 se agregan implementación y test en el mismo commit (CashResultsDisplay.tsx, CashResultsDisplay.delivery-ux.test.tsx), sin evidencia separada RED→GREEN.

## Root Cause

Flujo de trabajo no separó las fases TDD en commits individuales. La funcionalidad llegó antes que el test (o ambos en el mismo commit), haciendo imposible demostrar la disciplina RED→GREEN.

## Archivos Involucrados

| Archivo | Commit | Problema |
|---------|--------|----------|
| `OperationSelector.tsx` | `fb33d7a` | Funcionalidad sin test RED previo |
| Tests de OperationSelector | `9e94799` | Tests llegan DESPUÉS de implementación |
| `CashResultsDisplay.tsx` | `1f729f4` | Implementación + test en mismo commit |
| `CashResultsDisplay.delivery-ux.test.tsx` | `1f729f4` | Sin evidencia RED separada |

## Estrategia Correctiva

### Paso 1: Identificar funcionalidades nuevas que necesitan evidencia TDD

Auditar commits `fb33d7a`, `9e94799`, `1f729f4` para extraer lista exacta de funcionalidades agregadas.

### Paso 2: Crear ciclo TDD explícito por cada funcionalidad

Para **cada funcionalidad nueva** identificada:

```
Commit RED   → test que FALLE (sin tocar implementación)
Commit GREEN → implementación MÍNIMA para pasar
Commit REFACTOR → limpieza opcional sin cambiar comportamiento
```

### Paso 3: Evidencia textual en PR

Adjuntar en cada commit:
- Salida del comando con test fallando (RED)
- Salida del comando con test pasando (GREEN)
- Salida de suite de regresión completa pasando

### Paso 4: Formato de commits TDD

```
test(RED): [componente] — test para [funcionalidad] (debe fallar)
feat(GREEN): [componente] — implementación mínima [funcionalidad]
refactor: [componente] — limpieza [funcionalidad] (sin cambio de comportamiento)
```

## Dependencias

- Requiere que H4 (lint) y H3 (E2E) estén resueltos primero para que la suite de regresión pase limpia.

## Criterio de Aceptación

- [ ] Cada funcionalidad nueva tiene commit RED separado
- [ ] Cada commit RED contiene SOLO test (sin implementación)
- [ ] Cada commit GREEN contiene SOLO implementación mínima
- [ ] Suite de regresión pasa después de cada commit GREEN
- [ ] Evidencia textual adjunta en PR

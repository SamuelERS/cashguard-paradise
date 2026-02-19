# CASO-SANN-R4: Guia Arquitectonica Modular

## Alcances Propuestos

### SCOPE A: Fix Blocker (PRIORIDAD CRITICA)

**Problema:** Usuario ve "Configuracion Inicial" en lugar de iniciar conteo.
**Objetivo:** Al hacer "Reanudar sesion", el usuario entra DIRECTO a Phase 1 sin
StoreSelectionForm ni wizard de instrucciones.

### SCOPE B: Restaurar Datos de Conteo (MEJORA FUNCIONAL)

**Problema:** Incluso con Scope A, el conteo empieza de cero (pierde progreso).
**Objetivo:** Si hay `datos_conteo` en el Corte, hidratar CashCounter con el
conteo parcial guardado. El usuario ve sus denominaciones ya ingresadas.

### SCOPE C: Restaurar Fase (AVANZADO — Evaluar necesidad)

**Problema:** Si usuario estaba en Phase 2 o 3, con Scope A+B solo vuelve a Phase 1.
**Objetivo:** Restaurar la fase exacta donde se quedo.
**Nota:** Requiere extension de usePhaseManager. Considerar si el costo/beneficio
lo justifica dado que Phase 2/3 son rapidas comparadas con Phase 1.

---

## SCOPE A: Modulos

### M1: Extraer testigo + skipWizard en handleResumeSession

**Archivo:** `src/pages/Index.tsx`
**Lineas:** 186-211 (handleResumeSession)

**Cambio conceptual:**
1. Extraer `corte.testigo` y asignarlo a `selectedWitness`
2. Agregar `skipWizard: true` al estado para evitar modal instrucciones

**Impacto en hasInitialData:**
- ANTES: `Boolean(store && cashier && '')` = `false`
- DESPUES: `Boolean(store && cashier && testigo)` = `true` (si testigo no vacio)

**Edge case:** Si `corte.testigo` es string vacio en Supabase, `hasInitialData`
sigue siendo `false`. Posible guard: usar testigo si no vacio, sino placeholder
o lanzar error informativo.

**Validacion TDD (RED):**
- Test 6: `handleResumeSession` extrae `corte.testigo` como `selectedWitness`
- Test 7: `handleResumeSession` establece `skipWizard: true`

---

### M2: Extender tipo initialData en Index.tsx

**Archivo:** `src/pages/Index.tsx`
**Lineas:** 38-44 (tipo del useState)

**Cambio conceptual:**
Agregar campos opcionales al tipo del estado `initialData`:
- `skipWizard?: boolean`
- `cashCount?: CashCount`
- `electronicPayments?: ElectronicPayments`

**Nota:** Solo se define el tipo. Los valores se populan en M1 (Scope A) y M3 (Scope B).

---

### M3: Pasar nuevas props a CashCounter

**Archivo:** `src/pages/Index.tsx`
**Lineas:** 340-357 (renderizado CashCounter)

**Cambio conceptual:**
Pasar las props que CashCounter YA acepta pero que actualmente no se proveen:
- `skipWizard={initialData.skipWizard}`

(Para Scope B, tambien: `initialCashCount`, `initialElectronicPayments`)

**Validacion TDD (RED):**
- Test 8: CashCounter recibe `skipWizard=true` cuando viene de resume
- Test 9: CashCounter NO recibe `skipWizard` cuando viene del wizard normal

---

## SCOPE B: Modulos

### M4: Extraer datos_conteo con type guards

**Archivo:** `src/pages/Index.tsx`
**Lineas:** 186-211 (handleResumeSession)

**Cambio conceptual:**
1. Parsear `corte.datos_conteo` (es `Record<string, unknown> | null`)
2. Extraer `conteo_parcial` con type guard defensivo
3. Extraer `pagos_electronicos` con type guard defensivo
4. Extraer `gastos_dia` con type guard defensivo
5. Si parseo falla, usar defaults vacios (degradacion elegante)

**Estructura esperada de datos_conteo (guardada por guardarProgreso):**
```
{
  conteo_parcial: { penny: N, nickel: N, ... bill100: N },
  pagos_electronicos: { credomatic: N, promerica: N, bankTransfer: N, paypal: N },
  gastos_dia: [{ id, concept, amount, category, hasInvoice, timestamp }] | null
}
```

**Importante:** Los campos son `Record<string, unknown>` en el tipo Corte.
Se necesitan type guards o assertions seguras para convertir a `CashCount`
y `ElectronicPayments`.

**Validacion TDD (RED):**
- Test 10: `handleResumeSession` extrae `conteo_parcial` como `cashCount`
- Test 11: `handleResumeSession` extrae `pagos_electronicos` como `electronicPayments`
- Test 12: Si `datos_conteo` es null, usa defaults (no explota)
- Test 13: Si `datos_conteo` tiene estructura inesperada, usa defaults

---

### M5: Pasar datos de conteo a CashCounter

**Archivo:** `src/pages/Index.tsx`
**Lineas:** 340-357 (renderizado CashCounter)

**Cambio conceptual:**
Pasar props adicionales:
- `initialCashCount={initialData.cashCount}`
- `initialElectronicPayments={initialData.electronicPayments}`
- `initialDailyExpenses={initialData.dailyExpenses}` (ya existe pero siempre [])

---

## SCOPE C: Modulos (Evaluar necesidad)

### M6: Extension usePhaseManager para fase inicial configurable

**Archivo:** `src/hooks/usePhaseManager.ts`

**Cambio conceptual:**
Aceptar parametro opcional `initialPhase` que permita iniciar en fase arbitraria:
- Si `initialPhase = 2`: `currentPhase: 2, phase1Completed: true`
- Si `initialPhase = 3`: `currentPhase: 3, phase1Completed: true, phase2Completed: true`

**Riesgo:** Phase 2 necesita `deliveryCalculation` que se calcula en Phase 1.
Sin esos datos, Phase 2 no puede funcionar. Scope C requiere tambien restaurar
`deliveryCalculation` desde `corte.datos_entrega`.

**Recomendacion:** Postergar Scope C. El 95% del tiempo del corte esta en Phase 1
(conteo fisico). Si el usuario pierde la sesion y reanuda, volver a Phase 1 con
datos pre-llenados (Scope B) es una experiencia aceptable.

---

## Orden de Ejecucion Recomendado

```
SCOPE A (Blocker Fix — 3 modulos)
  ├─ ORDEN #24: TDD RED M1+M2 — Tests para testigo + skipWizard + tipo extendido
  ├─ ORDEN #25: GREEN M1+M2 — Implementar extraccion testigo + tipo
  ├─ ORDEN #26: TDD RED M3 — Tests para props CashCounter
  └─ ORDEN #27: GREEN M3 — Pasar skipWizard a CashCounter

SCOPE B (Datos Conteo — 2 modulos)
  ├─ ORDEN #28: TDD RED M4 — Tests parseo datos_conteo
  ├─ ORDEN #29: GREEN M4 — Implementar extraccion con type guards
  ├─ ORDEN #30: TDD RED M5 — Tests props conteo
  └─ ORDEN #31: GREEN M5 — Pasar initialCashCount + initialElectronicPayments

SCOPE C (Postergar — documentar decision)
```

---

## Criterios de Aceptacion

### Scope A (Minimo Viable)
- [ ] "Reanudar sesion" NO muestra StoreSelectionForm
- [ ] "Reanudar sesion" inicia Phase 1 directamente (sin modal instrucciones)
- [ ] Testigo se muestra pre-llenado (no vacio)
- [ ] Datos pre-existentes (store, cajero, ventas) preservados
- [ ] Tests regresion existentes pasan sin cambios

### Scope B (Progreso Restaurado)
- [ ] Denominaciones previamente contadas aparecen pre-llenadas
- [ ] Pagos electronicos previos aparecen pre-llenados
- [ ] Gastos del dia previos aparecen pre-llenados
- [ ] Si datos_conteo es null o corrupto, funciona con defaults (no explota)

---

## Decision Arquitectonica Pendiente

**Para la Autoridad:**

1. **Aprobar Scope A solamente?** (3 modulos, ~4 ordenes)
   - Resuelve el blocker inmediato
   - Usuario entra a conteo pero pierde progreso parcial

2. **Aprobar Scope A + B?** (5 modulos, ~8 ordenes)
   - Resuelve blocker + restaura conteo
   - Usuario ve sus denominaciones pre-llenadas

3. **Aprobar Scope A + B + C?** (8 modulos, ~12+ ordenes)
   - Restauracion completa de fase
   - Mayor complejidad y riesgo (usePhaseManager, deliveryCalculation)

**Recomendacion del Director:** Scope A + B. El Scope C tiene alto riesgo
por dependencias de Phase 2 en datos calculados de Phase 1, y el beneficio
marginal es bajo (Phase 2/3 son rapidas).

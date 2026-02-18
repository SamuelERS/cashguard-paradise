# Arquitectura Correcta: Wizard + Supabase Unificados

**Fecha:** 2026-02-17
**Caso:** `04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/`

---

## Principio Rector

> El wizard modal (`InitialWizardModal`) es la **única** interfaz para CASH_CUT.
> Los hooks de Supabase **alimentan** al wizard — nunca lo reemplazan.

---

## Diagrama de Flujo Correcto

```
OperationSelector
  │
  ├─ CASH_CUT ──► detectActiveCashCutSession() (Supabase)
  │                │
  │                ├─ Sesión activa → guardar sucursalId → abrir wizard
  │                └─ Sin sesión   → abrir wizard normalmente
  │                │
  │                └──► InitialWizardModal (6 pasos)
  │                       ├─ Step1: Protocolo Anti-Fraude (sin datos)
  │                       ├─ Step2: useSucursales() → selección sucursal
  │                       ├─ Step3: useEmpleadosSucursal(sucId) → cajero
  │                       ├─ Step4: useEmpleadosSucursal(sucId) → testigo ≠ cajero
  │                       ├─ Step5: Input venta esperada SICAR
  │                       └─ Step6: Gastos del día (opcional)
  │                       │
  │                       └──► handleWizardComplete()
  │                              ├─ useCorteSesion().crearCorte() (Supabase)
  │                              └──► CashCounter (Phase 1 → 2 → 3)
  │
  ├─ CASH_COUNT ──► MorningCountWizard
  └─ DELIVERY_VIEW ──► DeliveryDashboardWrapper
```

---

## Contratos de Datos por Paso

### Step 2 — Selección de Sucursal

| Fuente Anterior | Fuente Correcta | Hook |
|-----------------|-----------------|------|
| `STORES[]` de `paradise.ts` | `sucursales` tabla Supabase | `useSucursales()` |

**Contrato del hook:**
```typescript
// useSucursales() retorna:
{
  sucursales: Array<{
    id: string;
    nombre: string;
    codigo: string;
    activa: boolean;
  }>;
  cargando: boolean;
  error: string | null;
}
```

**Mapeo al wizard:**
```typescript
const availableStores = sucursales.map((s) => ({
  id: s.id,
  name: s.nombre,
  address: `Codigo ${s.codigo}`,
  phone: '',
  schedule: '',
}));
```

---

### Step 3 y 4 — Cajero y Testigo

| Fuente Anterior | Fuente Correcta | Hook |
|-----------------|-----------------|------|
| `EMPLOYEES[]` de `paradise.ts` | `empleados` + `empleado_sucursales` | `useEmpleadosSucursal(sucursalId)` |

**Contrato del hook:**
```typescript
// useEmpleadosSucursal(sucursalId) retorna:
{
  empleados: Array<{
    id: string;
    nombre: string;
    cargo: string | undefined;
  }>;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}
```

**Consulta Supabase (2 queries encadenadas):**
1. `empleado_sucursales` → `.select('empleado_id').eq('sucursal_id', id)` → IDs únicos
2. `empleados` → `.select('id,nombre,activo').in('id', ids).eq('activo', true).order('nombre')` → datos

**Validación anti-fraude:** testigo ≠ cajero (ya existente en wizard, no cambia)

---

### Detección de Sesión Activa

| Componente Anterior | Componente Correcto | Ubicación |
|---------------------|---------------------|-----------|
| `CortePage.tsx` | `Index.tsx` → `detectActiveCashCutSession()` | Ya migrado |

**Consulta:**
```typescript
tables.cortes()
  .select('id,sucursal_id')
  .in('estado', ['INICIADO', 'EN_PROGRESO'])
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle()
```

**Comportamiento post-DACC-CIERRE:**
- Sesión activa → `activeCashCutSucursalId = sucursalId` → wizard se abre → **sucursal pre-seleccionada automáticamente** via `initialSucursalId` prop (implementado DACC-CIERRE)
- Sin sesión → wizard se abre normalmente (sin pre-selección)
- Estado muerto `routeCashCutToCortePage` **eliminado** de Index.tsx (DACC-CIERRE)

---

### Persistencia de Sesión al Completar Wizard

| Componente Anterior | Componente Correcto | Hook |
|---------------------|---------------------|------|
| `CorteOrquestador.tsx` | `handleWizardComplete()` en `Index.tsx` | `useCorteSesion()` |

**Integración futura (no implementada aún):**
```typescript
const handleWizardComplete = async (data) => {
  // 1. Crear corte en Supabase
  const sesion = await corteSesion.crearCorte({
    sucursal_id: data.selectedStore,
    cajero_id: data.selectedCashier,
    testigo_id: data.selectedWitness,
    venta_esperada: parseFloat(data.expectedSales),
  });

  // 2. Pasar datos al CashCounter (flujo existente sin cambios)
  setInitialData({ ...data, dailyExpenses: data.dailyExpenses || [] });
  setShowWizard(false);
  setShowCashCounter(true);
};
```

---

## Componentes que NO Cambian

| Componente | Razón |
|-----------|-------|
| `Step1ProtocolRules.tsx` | Sin fuente de datos externa |
| `Step5SicarInput.tsx` | Input manual, sin datos externos |
| `Step6Expenses.tsx` | Input manual con `DailyExpensesManager` |
| `CashCounter.tsx` + phases | Flujo de conteo independiente de datos iniciales |
| `CashCalculation.tsx` | Reporte final independiente |

---

## Componentes a Desactivar / Integrar

| Componente | Acción | Justificación |
|-----------|--------|---------------|
| `CortePage.tsx` | Desactivar | Detección de sesión ya migrada a `Index.tsx` |
| `CorteOrquestador.tsx` | Desactivar | Fases se mapean al wizard + phases existente |
| `CorteInicio.tsx` | Desactivar | Creación de corte migra a `handleWizardComplete` |
| `CorteReanudacion.tsx` | Desactivar | Reanudación migra al wizard (pre-selección sucursal) |

---

## Siguiente Paso

→ Ver `03_Plan_Implementacion.md` — Task list paso a paso

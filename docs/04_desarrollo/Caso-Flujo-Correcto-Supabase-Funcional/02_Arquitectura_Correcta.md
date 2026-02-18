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

**Comportamiento post-DACC-R2:**
- Sesión activa → `activeCashCutSucursalId = sucursalId` → wizard se abre → **sucursal pre-seleccionada automáticamente** via `initialSucursalId` prop (implementado DACC-CIERRE)
- **POLÍTICA A (DACC-R2):** Si hay sesión activa, su `sucursal_id` gobierna la sincronización, independientemente de la selección del wizard. El usuario puede cambiar sucursal en el wizard para datos locales, pero la sync Supabase sigue vinculada a la sesión activa.
- Sin sesión → wizard se abre normalmente (sin pre-selección)
- Estado muerto `routeCashCutToCortePage` **eliminado** de Index.tsx (DACC-CIERRE)
- **DACC-CLEANUP:** `CortePage.tsx`, `CorteOrquestador.tsx` y 4 componentes huérfanos **eliminados** definitivamente. Todas las referencias en código y tests limpiadas.

---

### Persistencia de Sesión al Completar Wizard — ✅ IMPLEMENTADO (DACC-CIERRE-SYNC-UX + DACC-R2)

| Componente Anterior | Componente Correcto | Hook |
|---------------------|---------------------|------|
| `CorteOrquestador.tsx` | `handleWizardComplete()` en `Index.tsx` | `useCorteSesion()` |

**Implementación actual (`Index.tsx` — post DACC-R2):**
```typescript
const handleWizardComplete = async (data) => {
  setInitialData({ ...data, dailyExpenses: data.dailyExpenses || [] });
  setShowWizard(false);
  setShowCashCounter(true);

  if (isSupabaseConfigured && currentMode === OperationMode.CASH_CUT) {
    // POLÍTICA A: sesión activa → su sucursal gobierna sync
    const sucursalParaSync = activeCashCutSucursalId ?? data.selectedStore;
    setSyncSucursalId(sucursalParaSync);

    if (!activeCashCutSucursalId) {
      // Ciclo de vida correcto: sincronizando → sincronizado | error
      setSyncEstado('sincronizando');
      try {
        await iniciarCorte({ sucursal_id: sucursalParaSync, ... });
        setSyncEstado('sincronizado');
        setUltimaSync(new Date().toISOString());
      } catch (err) {
        setSyncEstado('error');
      }
    } else {
      // Sesión activa reanudada — sync ya existe en Supabase
      setSyncEstado('sincronizado');
    }
  }
};
```

---

### Sincronización Progreso en CashCounter — ✅ IMPLEMENTADO (DACC-CIERRE-SYNC-UX)

**Flujo de autosave:**
```
CashCounter (Phase 1 conteo)
  │
  ├─ useCashCounterOrchestrator (debounce 600ms)
  │     └─ onGuardarProgreso(datos) callback
  │
  └─ Index.tsx handleGuardarProgreso()
        └─ corteSesion.guardarProgreso(datosProgreso)
              └─ Supabase tabla cortes (JSONB)
```

**Props de sincronización visual:**
```typescript
<CashCounter
  // ...datos iniciales...
  onGuardarProgreso={isCashCut ? handleGuardarProgreso : undefined}
  syncEstado={isCashCut && syncSucursalId ? syncEstado : undefined}
  ultimaSync={ultimaSync}
  syncError={syncError}
/>
```

**CashCounter muestra `CorteStatusBanner`** con estados:
- `sincronizado` → verde "Guardado"
- `sincronizando` → animación
- `error` → rojo con mensaje

**Degradación graceful:** Si Supabase no está configurado, no se pasan props sync → banner no se renderiza → conteo funciona 100% offline.

---

## Componentes que NO Cambian

| Componente | Razón |
|-----------|-------|
| `Step1ProtocolRules.tsx` | Sin fuente de datos externa |
| `Step5SicarInput.tsx` | Input manual, sin datos externos |
| `Step6Expenses.tsx` | Input manual con `DailyExpensesManager` |
| `CashCalculation.tsx` | Reporte final independiente |

---

## Componentes Eliminados (DACC-CLEANUP 2026-02-17)

| Componente | Estado | Justificación |
|-----------|--------|---------------|
| `CortePage.tsx` | **ELIMINADO** | Detección de sesión ya migrada a `Index.tsx` |
| `CorteOrquestador.tsx` | **ELIMINADO** | Fases se mapean al wizard + phases existente |
| `CorteInicio.tsx` | **ELIMINADO** | Huérfano de CorteOrquestador (creación migrada a `handleWizardComplete`) |
| `CorteReanudacion.tsx` | **ELIMINADO** | Huérfano de CorteOrquestador (reanudación migrada al wizard) |
| `CorteResumen.tsx` | **ELIMINADO** | Huérfano de CorteOrquestador |
| `CorteConteoAdapter.tsx` | **ELIMINADO** | Huérfano de CorteOrquestador |

**Preservados (vivos):**
| Componente | Razón |
|-----------|-------|
| `CorteStatusBanner.tsx` | Importado por `CashCounter.tsx` — banner visual sincronización |
| `useCorteSesion.ts` | Importado por `Index.tsx` — persistencia Supabase |

---

## Siguiente Paso

→ Ver `03_Plan_Implementacion.md` — Task list paso a paso (todas las fases COMPLETADAS)

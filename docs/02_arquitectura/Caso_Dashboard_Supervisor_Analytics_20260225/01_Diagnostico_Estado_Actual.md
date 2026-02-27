# Diagnóstico — Estado Actual Dashboard Supervisor

## 1. Qué existe hoy

### Rutas registradas (`src/App.tsx`)

```
/supervisor                  → redirect → /supervisor/cortes
/supervisor/cortes           → CortesDelDia    (tab "Hoy")
/supervisor/corte/:id        → CorteDetalle    (detalle de un corte)
/supervisor/historial        → CorteHistorial  (tab "Historial")
```

### TABS en `SupervisorDashboard.tsx`

```typescript
const TABS = [
  { label: 'Hoy',       href: '/supervisor/cortes'   },
  { label: 'Historial', href: '/supervisor/historial' },
];
```

### Hooks en `src/hooks/supervisor/`

| Archivo                             | Propósito                                  |
|-------------------------------------|--------------------------------------------|
| `queryKeys.ts`                      | Cache keys TanStack Query                  |
| `useSupervisorTodayFeed.ts`         | Feed en tiempo real para tab "Hoy"         |
| `useSupervisorLiveInvalidation.ts`  | Invalidación automática por Realtime       |
| `useSupervisorCorteDetalleFeed.ts`  | Feed de un corte individual                |

### Cache keys actuales (`queryKeys.ts`)

```typescript
export const queryKeys = {
  supervisor: {
    today:     ()           => ['supervisor', 'today']         as const,
    detail:    (id: string) => ['supervisor', 'detail', id]    as const,
    history:   (fp = 'all') => ['supervisor', 'history', fp]   as const,
  },
} as const;
```

---

## 2. Gaps identificados

| Gap | Severidad | Descripción |
|-----|-----------|-------------|
| G-01 | 🔴 Alta | No existe tab "Resumen" en `SupervisorDashboard.tsx` |
| G-02 | 🔴 Alta | No existe ruta `/supervisor/resumen` en `App.tsx` |
| G-03 | 🔴 Alta | No existe hook `useSupervisorAnalytics.ts` |
| G-04 | 🔴 Alta | No existe componente `CortesResumen.tsx` |
| G-05 | 🟡 Media | No existe clave `analytics` en `queryKeys.ts` |

---

## 3. Por qué no se puede improvisar

### 3.1 JSONB requires defensive parsing

El campo `datos_conteo` en la tabla `cortes` es `Record<string, unknown> | null`.
No se puede hacer cast directo — `CorteDetalle.tsx` ya establece el patrón:

```typescript
// ✅ Correcto — extraído de CorteDetalle.tsx
const conteoParcialRaw = datosConteo?.conteo_parcial;
if (typeof conteoParcialRaw === 'object' && conteoParcialRaw !== null &&
    !Array.isArray(conteoParcialRaw)) {
  cashCount = conteoParcialRaw as Partial<CashCount>;
}
```

Un hook que haga `corte.datos_conteo.gastos_dia as DailyExpense[]` sin guards
causaría un crash en runtime silencioso.

### 3.2 Timezone El Salvador

Todos los filtros de fecha deben usar `America/El_Salvador` (UTC-6).
El patrón ya existe en `useSupervisorQueries.ts`:

```typescript
const TIMEZONE_NEGOCIO = 'America/El_Salvador';
function fechaAISORange(fechaYYYYMMDD: string) {
  return {
    inicio: `${fechaYYYYMMDD}T00:00:00.000-06:00`,
    fin:    `${fechaYYYYMMDD}T23:59:59.999-06:00`,
  };
}
```

### 3.3 Solo cortes FINALIZADOS

Los analytics solo tienen sentido sobre cortes `estado = 'FINALIZADO'`.
Cortes `INICIADO` o `EN_PROGRESO` tienen datos parciales e inconsistentes.

### 3.4 `venta_esperada` puede ser null

```typescript
// Corte.venta_esperada: number | null
// Siempre guardar con null-coalescing
const ventaEsperada = corte.venta_esperada ?? 0;
```

---

## 4. Solución propuesta (vista de alto nivel)

```
Tab "Resumen" → ruta /supervisor/resumen → CortesResumen.tsx
                                            ↓
                              useSupervisorAnalytics(filtros)
                                            ↓
                              queryKeys.supervisor.analytics(fp)
                                            ↓
                              tables.cortes()
                                .select('*, sucursales(id, nombre, codigo, activa)')
                                .eq('estado', 'FINALIZADO')
                                .gte('finalizado_at', inicio)
                                .lte('finalizado_at', fin)
                                            ↓
                              Agregación local:
                              - Por sucursal: totalCash, totalElectronic, totalExpenses
                              - Diferencia: totalGeneral - totalExpenses - venta_esperada
                              - KPIs globales: cortes, sobrantes, faltantes, exactos
```

**4 archivos a crear/modificar** — ver plan en `docs/plans/2026-02-25-supervisor-analytics-dashboard.md`.

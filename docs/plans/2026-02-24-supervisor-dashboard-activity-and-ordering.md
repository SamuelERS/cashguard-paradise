# Supervisor Dashboard Activity And Ordering Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Hacer que el dashboard supervisor muestre cortes activos y finalizados de forma consistente (incluyendo pruebas recientes como Plaza Merliot), con orden cronológico operativo y presentación más clara en `Hoy` e `Historial`.

**Architecture:** Se implementará una estrategia de timeline operativo: cada corte tendrá un timestamp de orden (`finalizado_at ?? created_at`) y un estado visible. `Hoy` mostrará actividad del día (activos + finalizados) por secciones; `Historial` mantendrá filtros y ordenará por actividad relevante sin perder trazabilidad anti-fraude.

**Tech Stack:** React 18 + TypeScript, Vitest + Testing Library, Supabase JS, Tailwind.

---

## Skills requeridas durante ejecución

- `@test-driven-development`
- `@systematic-debugging`
- `@verification-before-completion`
- `@frontend-design`

---

### Task 1: Contrato RED para actividad en pestaña Hoy (activos + finalizados)

**Files:**
- Create: `src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts`
- Modify: `src/hooks/useSupervisorQueries.ts`
- Test: `src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts`

**Step 1: Write the failing test**

```ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useSupervisorQueries.obtenerCortesDelDia', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('incluye EN_PROGRESO/INICIADO y FINALIZADO del día, ordenados por timestamp operativo', async () => {
    const finalizados = [
      { id: 'f1', estado: 'FINALIZADO', created_at: '2026-02-24T16:00:00.000Z', finalizado_at: '2026-02-24T22:00:00.000Z', sucursales: null },
    ];
    const activos = [
      { id: 'a1', estado: 'EN_PROGRESO', created_at: '2026-02-24T23:00:00.000Z', finalizado_at: null, sucursales: null },
    ];

    const cortesMock = vi.fn()
      .mockReturnValueOnce({
        select: () => ({ eq: () => ({ gte: () => ({ lte: () => ({ order: () => Promise.resolve({ data: finalizados, error: null }) }) }) }) }),
      })
      .mockReturnValueOnce({
        select: () => ({ in: () => ({ gte: () => ({ lte: () => ({ order: () => Promise.resolve({ data: activos, error: null }) }) }) }) }),
      });

    vi.doMock('@/lib/supabase', () => ({ tables: { cortes: cortesMock } }));
    const { useSupervisorQueries } = await import('../useSupervisorQueries');
    const { result } = renderHook(() => useSupervisorQueries());

    let rows: unknown[] = [];
    await act(async () => {
      rows = await result.current.obtenerCortesDelDia();
    });

    expect(rows).toHaveLength(2);
    expect((rows[0] as { id: string }).id).toBe('a1');
    expect((rows[1] as { id: string }).id).toBe('f1');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts`
Expected: FAIL porque `obtenerCortesDelDia` actualmente solo consulta `FINALIZADO`.

**Step 3: Write minimal implementation**

```ts
// src/hooks/useSupervisorQueries.ts
const [finalizadosRes, activosRes] = await Promise.all([
  tables.cortes()
    .select('*, sucursales(id, nombre, codigo, activa)')
    .eq('estado', 'FINALIZADO')
    .gte('finalizado_at', inicio)
    .lte('finalizado_at', fin)
    .order('finalizado_at', { ascending: false }),
  tables.cortes()
    .select('*, sucursales(id, nombre, codigo, activa)')
    .in('estado', ['INICIADO', 'EN_PROGRESO'])
    .gte('created_at', inicio)
    .lte('created_at', fin)
    .order('created_at', { ascending: false }),
]);

const merged = [...(finalizadosRes.data ?? []), ...(activosRes.data ?? [])]
  .map(toCorteConSucursal)
  .sort((a, b) => {
    const ta = Date.parse(a.finalizado_at ?? a.created_at);
    const tb = Date.parse(b.finalizado_at ?? b.created_at);
    return tb - ta;
  });
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/useSupervisorQueries.ts src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts
git commit -m "fix(supervisor): include active cuts in today activity feed"
```

---

### Task 2: RED de presentación en pestaña Hoy (secciones y vacíos inteligentes)

**Files:**
- Create: `src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
- Modify: `src/components/supervisor/CortesDelDia.tsx`
- Modify: `src/components/supervisor/CorteListaItem.tsx`
- Test: `src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/hooks/useSupervisorQueries', () => ({
  useSupervisorQueries: () => ({
    cargando: false,
    error: null,
    obtenerCortesDelDia: async () => [
      { id: 'a1', estado: 'EN_PROGRESO', created_at: '2026-02-24T23:00:00.000Z', finalizado_at: null, correlativo: 'CORTE-1', cajero: 'A', venta_esperada: 0, datos_conteo: null, sucursales: { id: 's1', nombre: 'Plaza Merliot', codigo: 'M', activa: true } },
      { id: 'f1', estado: 'FINALIZADO', created_at: '2026-02-24T16:00:00.000Z', finalizado_at: '2026-02-24T22:00:00.000Z', correlativo: 'CORTE-2', cajero: 'B', venta_esperada: 0, datos_conteo: null, sucursales: { id: 's2', nombre: 'Los Héroes', codigo: 'H', activa: true } },
    ],
  }),
}));

it('separa Activos ahora y Finalizados hoy', async () => {
  const { CortesDelDia } = await import('../CortesDelDia');
  render(<CortesDelDia />);

  expect(await screen.findByText('Activos ahora')).toBeInTheDocument();
  expect(screen.getByText('Finalizados hoy')).toBeInTheDocument();
  expect(screen.getByText('Plaza Merliot')).toBeInTheDocument();
  expect(screen.getByText('Los Héroes')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
Expected: FAIL porque hoy no separa secciones y solo contempla “finalizados”.

**Step 3: Write minimal implementation**

```tsx
// src/components/supervisor/CortesDelDia.tsx
const activos = cortes.filter(c => c.estado === 'INICIADO' || c.estado === 'EN_PROGRESO');
const finalizados = cortes.filter(c => c.estado === 'FINALIZADO');

// Render:
// 1) sección Activos ahora
// 2) sección Finalizados hoy
// 3) empty-state específico si ambos vacíos
```

```tsx
// src/components/supervisor/CorteListaItem.tsx
// agregar badge de estado visible: EN PROGRESO / INICIADO / FINALIZADO / ABORTADO
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CortesDelDia.tsx src/components/supervisor/CorteListaItem.tsx src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx
git commit -m "feat(supervisor): split today view into active and finalized sections"
```

---

### Task 3: RED para orden cronológico operativo en Historial

**Files:**
- Create: `src/hooks/__tests__/useSupervisorQueries.historial-operational-order.test.ts`
- Modify: `src/hooks/useSupervisorQueries.ts`
- Test: `src/hooks/__tests__/useSupervisorQueries.historial-operational-order.test.ts`

**Step 1: Write the failing test**

```ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

it('en estado TODOS ordena por timestamp operativo (finalizado_at ?? created_at)', async () => {
  const rows = [
    { id: 'c1', estado: 'ABORTADO', created_at: '2026-02-24T10:00:00.000Z', finalizado_at: '2026-02-24T23:00:00.000Z', sucursales: null },
    { id: 'c2', estado: 'EN_PROGRESO', created_at: '2026-02-24T22:30:00.000Z', finalizado_at: null, sucursales: null },
  ];

  // mock query TODOS -> devuelve rows desordenados
  // assert salida c1 primero por finalizado_at
  expect(true).toBe(false);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useSupervisorQueries.historial-operational-order.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
// src/hooks/useSupervisorQueries.ts (dentro de obtenerHistorial)
const datos = (data ?? []).map(toCorteConSucursal);
const datosOrdenados = datos.sort((a, b) => {
  const ta = Date.parse(a.finalizado_at ?? a.created_at);
  const tb = Date.parse(b.finalizado_at ?? b.created_at);
  return tb - ta;
});

return { datos: datosOrdenados, total: count ?? 0, pagina: paginaActual };
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useSupervisorQueries.historial-operational-order.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/useSupervisorQueries.ts src/hooks/__tests__/useSupervisorQueries.historial-operational-order.test.ts
git commit -m "fix(supervisor): order historial by operational timeline"
```

---

### Task 4: RED para mejor presentación de datos en ambas pestañas

**Files:**
- Create: `src/components/supervisor/__tests__/CorteListaItem.presentation.test.tsx`
- Modify: `src/components/supervisor/CorteListaItem.tsx`
- Modify: `src/components/supervisor/CorteHistorial.tsx`
- Modify: `src/components/supervisor/CortesDelDia.tsx`
- Test: `src/components/supervisor/__tests__/CorteListaItem.presentation.test.tsx`

**Step 1: Write the failing test**

```tsx
it('muestra etiqueta temporal correcta por estado (Creado/Finalizado) y badge de estado', async () => {
  // corte EN_PROGRESO: "Creado 03:40 p. m."
  // corte FINALIZADO: "Finalizado 04:12 p. m."
  expect(true).toBe(false);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/CorteListaItem.presentation.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
// src/components/supervisor/CorteListaItem.tsx
const esFinalizado = corte.estado === 'FINALIZADO';
const referenciaTiempo = esFinalizado ? corte.finalizado_at : corte.created_at;
const etiquetaTiempo = esFinalizado ? 'Finalizado' : 'Creado';

// render badge + etiquetaTiempo + hora
```

```tsx
// src/components/supervisor/CorteHistorial.tsx y CortesDelDia.tsx
// usar headers de sección compactos con conteos + mantener lista escaneable en móvil
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/supervisor/__tests__/CorteListaItem.presentation.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CorteListaItem.tsx src/components/supervisor/CorteHistorial.tsx src/components/supervisor/CortesDelDia.tsx src/components/supervisor/__tests__/CorteListaItem.presentation.test.tsx
git commit -m "feat(supervisor-ui): improve status badges and temporal labels"
```

---

### Task 5: Regresión completa + evidencia de producción local

**Files:**
- Modify: `src/hooks/__tests__/useSupervisorQueries.static.test.ts` (solo si requieren ajustes por nueva lógica)
- Modify: `docs/04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/04_Verificacion.md`
- Modify: `docs/04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/05_DACC-R2_Reporte_Entrega.md`

**Step 1: Write failing checks (si aplica)**

```ts
// actualizar contratos estáticos para reflejar lógica dual
expect(source).toMatch(/INICIADO/);
expect(source).toMatch(/EN_PROGRESO/);
expect(source).toMatch(/FINALIZADO/);
```

**Step 2: Run test to verify it fails (si aplica)**

Run: `npx vitest run src/hooks/__tests__/useSupervisorQueries.static.test.ts`
Expected: FAIL antes de ajustar regex/contrato.

**Step 3: Write minimal implementation**

- Ajustar test estático solo a nuevo contrato real (sin sobreespecificar).
- Documentar evidencia de validación manual:
- Filtro `Sucursal=Plaza Merliot` + `Estado=Todos` muestra corte de prueba.
- `Hoy` muestra corte activo en sección de activos.

**Step 4: Run full verification**

Run:
- `npx vitest run src/hooks/__tests__/useSupervisorQueries.* src/components/supervisor/__tests__/*.test.tsx`
- `npm run build`

Expected: PASS en tests y build.

**Step 5: Commit**

```bash
git add src/hooks/__tests__/useSupervisorQueries.static.test.ts docs/04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/04_Verificacion.md docs/04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/05_DACC-R2_Reporte_Entrega.md
git commit -m "test(docs): align supervisor contracts and verification evidence"
```

---

## Criterios de aceptación finales

1. En `Hoy`, un corte `EN_PROGRESO` del día aparece sin requerir finalización.
2. En `Hoy`, los datos se muestran por secciones (`Activos ahora`, `Finalizados hoy`) y no como lista confusa.
3. En `Historial`, `Estado=Todos` devuelve cortes activos/finalizados/abortados del rango.
4. En `Historial`, el orden es por timestamp operativo (`finalizado_at ?? created_at`) en modo `Todos`.
5. `Estado=Finalizado` mantiene comportamiento estricto por `finalizado_at`.
6. Tests nuevos y existentes relevantes quedan verdes + `npm run build` verde.


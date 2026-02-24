# Supervisor Hoy Smart Layout (Task 2) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mejorar la pestaña `Hoy` del dashboard supervisor para mostrar actividad real del día con estructura clara: secciones `Activos ahora` y `Finalizados hoy`, manteniendo la trazabilidad y sin tocar lógica de negocio sensible.

**Architecture:** Se hará una mejora de presentación sobre el contrato de datos ya corregido (`obtenerCortesDelDia` ahora trae activos + finalizados). La UI de `Hoy` agrupará por estado operativo y reutilizará `CorteListaItem` para consistencia entre pestañas. Se implementará con TDD: primero contrato visual en tests, luego cambios mínimos en componentes.

**Tech Stack:** React 18, TypeScript, Vitest, Testing Library, Tailwind CSS.

---

## Skills requeridas durante ejecución

- `@test-driven-development`
- `@systematic-debugging`
- `@verification-before-completion`
- `@frontend-design`

---

### Task 1: RED de layout por secciones en `Hoy`

**Files:**
- Create: `src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
- Modify: `src/components/supervisor/CortesDelDia.tsx`
- Test: `src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/hooks/useSupervisorQueries', () => ({
  useSupervisorQueries: () => ({
    cargando: false,
    error: null,
    obtenerCortesDelDia: async () => [
      {
        id: 'a1',
        correlativo: 'CORTE-2026-02-24-M-001',
        estado: 'EN_PROGRESO',
        sucursales: { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
        cajero: 'Irvin Abarca',
        created_at: '2026-02-24T21:43:13.000Z',
        finalizado_at: null,
        venta_esperada: 232,
        datos_conteo: null,
      },
      {
        id: 'f1',
        correlativo: 'CORTE-2026-02-24-H-001',
        estado: 'FINALIZADO',
        sucursales: { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
        cajero: 'Jonathan Melara',
        created_at: '2026-02-24T17:00:00.000Z',
        finalizado_at: '2026-02-24T19:20:00.000Z',
        venta_esperada: 200,
        datos_conteo: null,
      },
    ],
  }),
}));

import { CortesDelDia } from '../CortesDelDia';

describe('CortesDelDia - activity layout', () => {
  it('muestra secciones Activos ahora y Finalizados hoy con sus filas', async () => {
    render(<CortesDelDia />);

    expect(await screen.findByText('Activos ahora')).toBeInTheDocument();
    expect(screen.getByText('Finalizados hoy')).toBeInTheDocument();

    expect(screen.getByText('Plaza Merliot')).toBeInTheDocument();
    expect(screen.getByText('Los Héroes')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
Expected: FAIL porque `CortesDelDia` aún no renderiza secciones por estado.

**Step 3: Write minimal implementation**

```tsx
// src/components/supervisor/CortesDelDia.tsx
const activos = cortes.filter(c => c.estado === 'INICIADO' || c.estado === 'EN_PROGRESO');
const finalizados = cortes.filter(c => c.estado === 'FINALIZADO');

// Render principal:
// - Sección "Activos ahora" solo si activos.length > 0
// - Sección "Finalizados hoy" solo si finalizados.length > 0
// - Empty state global solo si ambos arrays están vacíos
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CortesDelDia.tsx src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx
git commit -m "feat(supervisor): split today view into active and finalized sections"
```

---

### Task 2: RED para metadatos visuales claros por estado (reutilizable en ambas pestañas)

**Files:**
- Create: `src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx`
- Modify: `src/components/supervisor/CorteListaItem.tsx`
- Test: `src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CorteListaItem } from '../CorteListaItem';

const onClick = vi.fn();

it('muestra badge de estado y etiqueta temporal según estado', () => {
  render(
    <CorteListaItem
      corte={{
        id: 'a1',
        correlativo: 'CORTE-A1',
        estado: 'EN_PROGRESO',
        sucursales: { id: 's1', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
        cajero: 'Irvin',
        created_at: '2026-02-24T21:43:13.000Z',
        finalizado_at: null,
        venta_esperada: 232,
        datos_conteo: null,
      } as never}
      onClick={onClick}
    />,
  );

  expect(screen.getByText('EN PROGRESO')).toBeInTheDocument();
  expect(screen.getByText(/Creado/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx`
Expected: FAIL porque hoy no hay badge/etiqueta temporal explícita por estado.

**Step 3: Write minimal implementation**

```tsx
// src/components/supervisor/CorteListaItem.tsx
const estadoLabel = corte.estado.replace('_', ' ');
const esFinalizado = corte.estado === 'FINALIZADO';
const referenciaTiempo = esFinalizado ? corte.finalizado_at : corte.created_at;
const etiquetaTiempo = esFinalizado ? 'Finalizado' : 'Creado';

// Render en bloque central:
// - Badge estado
// - Línea temporal "Creado 03:12 p. m." / "Finalizado 04:20 p. m."
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CorteListaItem.tsx src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx
git commit -m "feat(supervisor-ui): add state badge and temporal label in list rows"
```

---

### Task 3: RED para empty states inteligentes en `Hoy`

**Files:**
- Modify: `src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
- Modify: `src/components/supervisor/CortesDelDia.tsx`
- Test: `src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`

**Step 1: Write the failing test**

```tsx
it('si no hay finalizados pero sí activos, NO muestra empty state global', async () => {
  // mock obtenerCortesDelDia => solo EN_PROGRESO
  // assert: sección Activos ahora visible
  // assert: texto "Sin cortes finalizados" NO visible
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx -t "solo activos"`
Expected: FAIL en layout actual.

**Step 3: Write minimal implementation**

```tsx
// src/components/supervisor/CortesDelDia.tsx
const hayActividad = activos.length > 0 || finalizados.length > 0;

if (!hayActividad) {
  // empty state global (sin actividad)
}

if (activos.length > 0) {
  // render sección activos
}

if (finalizados.length === 0 && activos.length > 0) {
  // render hint liviano "Sin finalizados aún" (opcional)
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CortesDelDia.tsx src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx
git commit -m "fix(supervisor-ui): make today empty states activity-aware"
```

---

### Task 4: Verificación integral + build

**Files:**
- Modify: `docs/04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/04_Verificacion.md` (si el equipo requiere evidencia documental)

**Step 1: Run focused tests**

Run:
- `npx vitest run src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts`
- `npx vitest run src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx`

Expected: PASS.

**Step 2: Run regression tests supervisor**

Run:
- `npx vitest run src/hooks/__tests__/useSupervisorQueries.static.test.ts src/hooks/__tests__/useSupervisorQueries.runtime.test.ts src/hooks/__tests__/useSupervisorQueries.historial-status.test.ts`

Expected: PASS.

**Step 3: Run build**

Run: `npm run build`
Expected: PASS.

**Step 4: Manual verification checklist**

1. Abrir `http://localhost:5173/supervisor/cortes`.
2. Confirmar sección `Activos ahora` visible con `CORTE-2026-02-24-M-001` y/o `CORTE-2026-02-24-H-001`.
3. Confirmar que no aparece empty-state global cuando sí hay activos.
4. Verificar badges/etiquetas temporales legibles en cada fila.

**Step 5: Commit**

```bash
git add src/components/supervisor/CortesDelDia.tsx src/components/supervisor/CorteListaItem.tsx src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts
git commit -m "feat(supervisor): smart today layout with active/finalized sections"
```

---

## Criterios de aceptación de Task 2

1. `Hoy` muestra `Activos ahora` cuando existen `INICIADO/EN_PROGRESO` del día.
2. `Hoy` muestra `Finalizados hoy` cuando existen `FINALIZADO` del día.
3. Empty-state global solo aparece cuando no hay actividad del día (ni activos ni finalizados).
4. Cada fila muestra estado visible y referencia temporal coherente (`Creado` vs `Finalizado`).
5. Tests nuevos + regresión supervisor pasan y `npm run build` pasa.

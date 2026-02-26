# CorteDetalle Entrega Live UX Compacta Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mejorar la tabla `Progreso de entrega en vivo` para que ocupe menos espacio, priorice monitoreo en caliente y comunique desvíos con señales visuales claras (rojo/amarillo) sin tocar lógica de negocio ni Supabase.

**Architecture:** Mantener el origen de datos actual (`datos_entrega.live_delivery_*`) y actuar únicamente en la capa de presentación/derivación local de filas. Se agrega semántica visual de estado por fila (exacto/faltante/sobrante), se compacta columna de hora mostrando solo hora local y se fija prioridad de ubicación del bloque live justo después del `Panel operativo del corte`. El cálculo financiero global y contratos de backend quedan intactos.

**Tech Stack:** React 19, TypeScript, TailwindCSS, Vitest, Testing Library.

---

## Scope funcional exacto

1. **Compactar columna Hora**:
- Mantener header `Hora`.
- Mostrar solo hora local (`hh:mm a. m./p. m.`), sin fecha.

2. **Semáforo por fila de tabla live**:
- `Exacto` (entregado == esperado): estilo neutro amarillo.
- `Faltante` (entregado < esperado): estilo rojo.
- `Sobrante` (entregado > esperado): estilo rojo.

3. **Orden de bloques en detalle**:
- El bloque `Progreso de entrega en vivo` debe quedar inmediatamente después del `Panel operativo del corte` cuando exista.
- El resto de bloques mantienen su orden inteligente actual.

4. **No-regression constraints**:
- No cambiar estructura de payloads Supabase.
- No modificar cálculos de `totalContado`, `diferencia`, `ventaEsperada`.
- Sin cambios en RPCs/migraciones.

---

## Skills de ejecución

- `@test-driven-development`
- `@verification-before-completion`

---

### Task 1: Contrato RED de UX compacta para tabla live

**Files:**
- Create: `src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx`
- Modify: `src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx`
- Reuse fixture style from: `src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx`

**Step 1: Write failing test (hora compacta)**

```tsx
it('muestra solo hora local sin fecha en la columna Hora', async () => {
  render(<CorteDetalle />);
  await screen.findByText(/progreso de entrega en vivo/i);

  expect(screen.getByText(/06:07 p\. m\./i)).toBeInTheDocument();
  expect(screen.queryByText(/25\/02\/2026/i)).not.toBeInTheDocument();
});
```

**Step 2: Write failing test (estado visual por fila)**

```tsx
it('muestra estado Exacto/Faltante/Sobrante con colores semanticos', async () => {
  render(<CorteDetalle />);
  await screen.findByText(/progreso de entrega en vivo/i);

  expect(screen.getByText(/exacto/i)).toHaveClass('text-amber-300');
  expect(screen.getByText(/faltante/i)).toHaveClass('text-red-400');
  expect(screen.getByText(/sobrante/i)).toHaveClass('text-red-400');
});
```

**Step 3: Write failing test (bloque live debajo del panel operativo)**

```tsx
it('ubica Progreso de entrega en vivo inmediatamente despues del panel operativo', async () => {
  render(<CorteDetalle />);

  const panel = await screen.findByText(/panel operativo del corte/i);
  const live = await screen.findByText(/progreso de entrega en vivo/i);

  const relation = panel.compareDocumentPosition(live);
  expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
```

**Step 4: Run tests to verify RED**
- Run: `npm run test -- src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx`
- Expected: FAIL por hora con fecha, ausencia de estados visuales nuevos y/o orden no fijado.

**Step 5: Commit checkpoint**

```bash
git add src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx
git commit -m "test(supervisor): definir contrato UX compacto para entrega live"
```

---

### Task 2: GREEN mínimo para hora compacta (sin fecha)

**Files:**
- Modify: `src/components/supervisor/CorteDetalle.tsx`
- Test: `src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx`

**Step 1: Write minimal implementation**

```ts
function formatearHoraLocal(isoString: string | null): string {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('es', {
      timeZone: 'America/El_Salvador',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(isoString));
  } catch {
    return '—';
  }
}
```

- Aplicar `formatearHoraLocal(row.lastCapturedAt)` solo en la tabla live.
- No tocar otros usos de `formatearFechaHora` fuera de la tabla.

**Step 2: Run test to verify GREEN parcial**
- Run: `npm run test -- src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx`
- Expected: al menos el caso de hora compacta pasa.

**Step 3: Commit checkpoint**

```bash
git add src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx
git commit -m "feat(supervisor): compactar hora en tabla entrega live"
```

---

### Task 3: GREEN mínimo para señal visual rojo/amarillo por fila

**Files:**
- Modify: `src/components/supervisor/CorteDetalle.tsx`
- Modify: `src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx`

**Step 1: Expand row model in implementation**

```ts
type EntregaLiveRow = {
  stepKey: keyof CashCount;
  label: string;
  expected: number;
  delivered: number;
  missing: number;
  delta: number;
  status: 'EXACTO' | 'FALTANTE' | 'SOBRANTE';
  lastCapturedAt: string | null;
};
```

- `delta = delivered - expected`
- `status`:
  - `delta === 0` -> `EXACTO`
  - `delta < 0` -> `FALTANTE`
  - `delta > 0` -> `SOBRANTE`

**Step 2: Render visual indicator in existing row (sin nueva columna)**

```tsx
<td className="py-1.5 text-right tabular-nums">
  <span className={row.status === 'EXACTO' ? 'text-amber-300' : 'text-red-400'}>
    {row.missing}
  </span>
  <span className={row.status === 'EXACTO' ? 'text-amber-300' : 'text-red-400'}>
    {row.status === 'EXACTO' ? ' Exacto' : row.status === 'FALTANTE' ? ' Faltante' : ' Sobrante'}
  </span>
</td>
```

**Step 3: Run test to verify GREEN**
- Run: `npm run test -- src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx`
- Expected: PASS casos de estado visual.

**Step 4: Commit checkpoint**

```bash
git add src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx
git commit -m "feat(supervisor): agregar semaforo de estado por fila en entrega live"
```

---

### Task 4: Fijar ubicación del bloque live inmediatamente después del panel

**Files:**
- Modify: `src/components/supervisor/CorteDetalle.tsx`
- Modify: `src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx`
- Test: `src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx`

**Step 1: Write failing test for card placement (if still failing)**
- En `CorteDetalle.ux-hierarchy.test.tsx`, agregar assert de relación de orden:
  - `panel operativo` antes de `progreso de entrega en vivo`
  - `progreso de entrega en vivo` antes de `resumen financiero`

**Step 2: Implement minimal order pinning**
- Separar `entrega-live` del arreglo `operationalCards` y renderizarlo inmediatamente tras el panel.
- Mantener `operationalCardsOrdenadas` para los demás bloques.

**Step 3: Run tests to verify GREEN**
- Run: `npm run test -- src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx`
- Expected: PASS.

**Step 4: Commit checkpoint**

```bash
git add src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx
git commit -m "feat(supervisor): priorizar bloque entrega live debajo del panel operativo"
```

---

### Task 5: Refactor + regresión completa + verificación manual

**Files:**
- Modify (si hace falta limpieza): `src/components/supervisor/CorteDetalle.tsx`
- Verify tests in:
  - `src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx`
  - `src/components/supervisor/__tests__/CorteDetalle.live-delivery-sync.test.tsx`
  - `src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx`
  - `src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx`

**Step 1: Refactor de legibilidad**
- Extraer helper pequeño para clase de color por estado live.
- Evitar duplicación de strings (`Exacto`, `Faltante`, `Sobrante`).

**Step 2: Regression suite**
- Run: `npm run test -- src/components/supervisor/__tests__`
- Expected: PASS total.

**Step 3: Build verification**
- Run: `npm run build`
- Expected: PASS.

**Step 4: Manual QA (local)**
- Abrir `http://localhost:5177/supervisor/corte/<id>`.
- Verificar:
  - columna Hora sin fecha;
  - estados visuales rojo/amarillo por fila;
  - bloque live debajo de panel operativo;
  - tabla sigue actualizando 1x1 en vivo.

**Step 5: Commit checkpoint**

```bash
git add src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__
git commit -m "refactor(supervisor): consolidar UX compacta de entrega live y validar regresion"
```

---

## Criterios de aceptación

- La columna `Hora` ya no muestra fecha.
- En cada fila live existe señal rápida de estado (`Exacto` amarillo, `Faltante/Sobrante` rojo).
- El bloque live aparece inmediatamente después del panel operativo en detalle.
- Sin cambios en lógica de negocio ni backend.
- Suite supervisor + build en verde.

## Riesgos y mitigación

- Riesgo: tests frágiles por clases Tailwind exactas.
- Mitigación: assert principal por texto de estado; clase solo en casos críticos.

- Riesgo: confusión del término `Faltante` cuando hay sobrante.
- Mitigación: conservar columna por consistencia, agregar etiqueta explícita `Sobrante`.

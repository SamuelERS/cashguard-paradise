# Corte Detalle Fusion Gerencia + Resumen + Header Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidar `Entrega a gerencia` + `Resumen financiero` en un bloque único más compacto, reubicarlo justo debajo del `Panel operativo del corte`, y limpiar el header superior eliminando duplicación visual del correlativo sin alterar lógica de negocio.

**Architecture:** Se mantiene intacta la lógica de datos y cálculos (`entrega`, `totalContado`, `diferencia`, SICAR, semáforo). El cambio es únicamente de composición/jerarquía visual en `CorteDetalle`: extraer una sola card de “cierre + entrega”, moverla en el flujo superior y trasladar el correlativo al contexto del panel operativo (Snapshot) en vez del encabezado grande. La validación se hace por contrato de UI con pruebas de orden DOM, presencia de filas clave y ausencia de headings legacy duplicados.

**Tech Stack:** React 18 + TypeScript + Tailwind + Vitest + Testing Library

---

**Skill refs para ejecución:** @test-driven-development, @frontend-design, @verification-before-completion

### Task 1: Definir contrato RED para bloque financiero consolidado

**Files:**
- Modify: `src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx`
- Modify: `src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx`

**Step 1: Write the failing test**

Agregar en `CorteDetalle.executive-summary.test.tsx` un caso nuevo que exija un único bloque consolidado:

```tsx
it('consolida entrega y resumen financiero en una sola card operativa', async () => {
  detailFeedMock.corte = BASE_FIXTURE;
  render(<CorteDetalle />);

  const heading = await screen.findByText(/cierre y entrega/i);
  const card = heading.closest('div');
  expect(card).not.toBeNull();

  const scoped = within(card as HTMLElement);
  expect(scoped.getByText(/monto a entregar/i)).toBeInTheDocument();
  expect(scoped.getByText(/monto restante en caja/i)).toBeInTheDocument();
  expect(scoped.getByText(/efectivo contado/i)).toBeInTheDocument();
  expect(scoped.getByText(/pagos electrónicos/i)).toBeInTheDocument();
  expect(scoped.getByText(/total contado/i)).toBeInTheDocument();
  expect(scoped.getByText(/venta esperada \(sicar\)/i)).toBeInTheDocument();
  expect(scoped.getByText(/diferencia/i)).toBeInTheDocument();

  expect(screen.queryByText(/^entrega a gerencia$/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/^resumen financiero$/i)).not.toBeInTheDocument();
});
```

Actualizar `CorteDetalle.readability.test.tsx` para esperar el nuevo heading consolidado en lugar de dos bloques separados.

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx
```

Expected: FAIL (no existe heading `Cierre y entrega`, y aún existen headings separados).

**Step 3: Write minimal implementation**

En `CorteDetalle.tsx`, reemplazar las cards separadas `entrega-gerencia` + `resumen-financiero` por una sola card `cierre-entrega`:

```tsx
operationalCards.push({
  key: 'cierre-entrega',
  activityMs: Math.max(actividadEntregaLiveMs, actividadBaseMs),
  fallbackOrder: 20,
  node: (
    <div key="cierre-entrega" className={cardClassName}>
      <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
        Cierre y entrega
      </p>
      <div className="divide-y divide-white/[0.06]">
        {entrega.amountToDeliver !== null && <MetaFila label="Monto a entregar" valor={formatCurrency(entrega.amountToDeliver)} mono destacado />}
        {entrega.amountRemaining !== null && <MetaFila label="Monto restante en caja" valor={formatCurrency(entrega.amountRemaining)} mono />}
        {resumenDisponible && (
          <>
            <MetaFila label="Efectivo contado" valor={formatCurrency(datos.totalEfectivo)} mono destacado />
            {datos.totalElectronico > 0 && <MetaFila label="Pagos electrónicos" valor={formatCurrency(datos.totalElectronico)} mono />}
            <MetaFila label="Total contado" valor={formatCurrency(totalContado)} mono destacado />
            <MetaFila label="Venta esperada (SICAR)" valor={formatCurrency(ventaEsperada)} mono />
            <MetaFila label="Diferencia" valor={diferenciaTexto} mono colorClase={diferenciaColorClase} />
          </>
        )}
      </div>
    </div>
  ),
});
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test -- src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx
git commit -m "test(ui): define merged cierre-entrega contract"
```

### Task 2: Definir contrato RED para limpieza de header y reubicación del correlativo

**Files:**
- Modify: `src/components/supervisor/__tests__/CorteDetalle.compact-operational-header.test.tsx`

**Step 1: Write the failing test**

Modificar el test legacy para exigir:
- no renderizar `Corte #...` como heading grande encima del panel,
- mantener badge en vivo,
- mostrar correlativo dentro del bloque `Snapshot` del panel operativo.

```tsx
it('elimina header duplicado y reubica correlativo en Snapshot', async () => {
  render(<CorteDetalle />);

  const heading = await screen.findByText(/panel operativo del corte/i);
  const panel = heading.closest('section') ?? heading.closest('div');
  expect(panel).not.toBeNull();

  const scoped = within(panel as HTMLElement);
  expect(scoped.getByText(/snapshot/i)).toBeInTheDocument();
  expect(scoped.getByText(/correlativo/i)).toBeInTheDocument();
  expect(scoped.getByText('CORTE-2026-02-25-H-002')).toBeInTheDocument();

  expect(screen.queryByText(/corte #corte-2026-02-25-h-002/i)).not.toBeInTheDocument();
  expect(screen.getByText(/en vivo/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- src/components/supervisor/__tests__/CorteDetalle.compact-operational-header.test.tsx
```

Expected: FAIL (header legacy aún visible, correlativo no está en Snapshot).

**Step 3: Write minimal implementation**

En `CorteDetalle.tsx`:
- Simplificar el bloque superior: mantener navegación y estado live, quitar el `h2` grande `Corte #{...}`.
- Agregar fila en tarjeta Snapshot:

```tsx
<MetaFila label="Correlativo" valor={corte.correlativo} mono colorClase="text-white/80" />
```

- Mantener `SemaforoIndicador` visible pero integrado de forma compacta (sin título duplicado).

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test -- src/components/supervisor/__tests__/CorteDetalle.compact-operational-header.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__/CorteDetalle.compact-operational-header.test.tsx
git commit -m "test(ui): lock compact header without duplicated corte title"
```

### Task 3: Asegurar orden visual final del bloque consolidado en jerarquía superior

**Files:**
- Modify: `src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx`

**Step 1: Write the failing test**

Actualizar el contrato de orden para reflejar jerarquía esperada:
`Panel operativo del corte -> Cierre y entrega -> Progreso de entrega en vivo -> resto de cards operativas`.

```tsx
it('mantiene orden panel operativo -> cierre y entrega -> entrega live', async () => {
  render(<CorteDetalle />);

  const panelHeading = await screen.findByText(/panel operativo del corte/i);
  const cierreHeading = await screen.findByText(/cierre y entrega/i);
  const liveHeading = await screen.findByText(/progreso de entrega en vivo/i);

  expect(panelHeading.compareDocumentPosition(cierreHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(cierreHeading.compareDocumentPosition(liveHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx
```

Expected: FAIL (orden actual no cumple nueva jerarquía).

**Step 3: Write minimal implementation**

En `CorteDetalle.tsx`, ajustar el render principal para colocar la card `cierre-entrega` inmediatamente debajo del panel operativo y antes de `entregaLiveCard`, manteniendo ordenación por actividad para el resto.

```tsx
<section aria-label="panel operativo del corte">...</section>
{cierreEntregaCard}
{entregaLiveCard}
{operationalCardsOrdenadasSinCierreEntrega.map((card) => card.node)}
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test -- src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx
git commit -m "test(ui): enforce top hierarchy with merged cierre-entrega block"
```

### Task 4: Regression quirúrgica + build + version gate (sin tocar lógica)

**Files:**
- Verify only:
  - `src/components/supervisor/CorteDetalle.tsx`
  - `src/components/supervisor/__tests__/CorteDetalle.compact-operational-header.test.tsx`
  - `src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx`
  - `src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx`
  - `src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx`

**Step 1: Run focused regression suite**

Run:
```bash
npm run test -- src/components/supervisor/__tests__/CorteDetalle.compact-operational-header.test.tsx src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx
```

Expected: PASS

**Step 2: Run build gate**

Run:
```bash
npm run build
```

Expected: PASS (`dist/` generado sin errores)

**Step 3: Run workspace status check**

Run:
```bash
git status --short
```

Expected: Solo archivos de UI/test del alcance.

**Step 4: Final commit**

```bash
git add src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__/CorteDetalle.compact-operational-header.test.tsx src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx
git commit -m "feat(supervisor): merge cierre-entrega card and clean corte header hierarchy"
```

**Step 5: Pre-merge sanity note**

Confirmar explícitamente en revisión manual local (`npm run dev`) que:
- el correlativo aparece una sola vez,
- el punto rojo/semáforo no domina visualmente,
- no cambió ningún cálculo financiero (solo layout/jerarquía).

# Supervisor Live + Corte Detallado Legible Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mostrar al supervisor, en lectura clara y en vivo, el detalle real del dinero del corte (incluyendo entrega y verificación), manteniendo una sola fuente de verdad en Supabase.

**Architecture:** Mantener `cortes` como estado canónico y enriquecer el detalle con `datos_conteo` + `datos_entrega` + `datos_verificacion` + snapshots append-only (`corte_conteo_snapshots`). Persistir datos faltantes desde el flujo nocturno (fase 2/3) sin romper contratos actuales. Agregar canal Realtime para refresco inmediato en `CortesDelDia` y `CorteDetalle`, con fallback al polling existente.

**Tech Stack:** React 18 + TypeScript, Supabase JS v2 (Postgres + Realtime), Vitest + Testing Library.

---

## Investigación (hechos confirmados)
- Ya se persiste en Supabase:
  - `cortes.datos_conteo` (conteo parcial, pagos, gastos).
  - `corte_conteo_snapshots` (append-only, capturas por fase/tiempo).
- No se está persistiendo actualmente (en práctica real):
  - `cortes.datos_entrega`.
  - `cortes.datos_verificacion`.
  - `cortes.datos_reporte`.
- En UI supervisor actual:
  - `CorteDetalle` solo consume `datos_conteo` (no usa `datos_entrega` ni snapshots para timeline vivo).
  - `CortesDelDia` depende de polling cada 60s (sin Realtime).

## Supabase: trabajo paralelo que puedes ejecutar ya

### SQL recomendado (sin romper compatibilidad)

```sql
-- 1) Índices para consultas live por updated_at
create index if not exists idx_cortes_sucursal_updated_at
  on public.cortes (sucursal_id, updated_at desc);

create index if not exists idx_cortes_estado_updated_at
  on public.cortes (estado, updated_at desc);

-- 2) Realtime publication (idempotente)
do $$
begin
  begin
    alter publication supabase_realtime add table public.cortes;
  exception when duplicate_object then
    null;
  end;

  begin
    alter publication supabase_realtime add table public.corte_conteo_snapshots;
  exception when duplicate_object then
    null;
  end;
end $$;

-- 3) Replica identity FULL para payloads UPDATE completos
alter table public.cortes replica identity full;
alter table public.corte_conteo_snapshots replica identity full;
```

### Nota
- **No se requieren columnas nuevas** para este alcance: `datos_entrega`, `datos_verificacion`, `datos_reporte` ya existen.
- Lo faltante es **escritura desde frontend + lectura legible + realtime**.

---

### Task 1: Baseline RED de brechas de persistencia y lectura

**Files:**
- Create: `src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx`
- Modify: `src/hooks/__tests__/useCorteSesion.test.ts`
- Test: `src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx`

**Step 1: Write failing test (detalle legible debe mostrar entrega y gastos)**

```tsx
it('muestra bloque de entrega y gastos cuando datos_entrega/datos_conteo existen', async () => {
  // mock obtenerCorteDetalle() con datos_entrega.amount_to_deliver y gastos_dia.items
  // expect pantalla: "Entrega a gerencia", "Monto a entregar", "Gastos del día"
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx`
Expected: FAIL (actualmente CorteDetalle no renderiza entrega/gastos legibles).

**Step 3: Write failing test (persistencia useCorteSesion debe aceptar datos_entrega/datos_verificacion)**

```ts
it('guardarProgreso persiste datos_entrega y datos_verificacion en cortes.update', async () => {
  // llamar guardarProgreso con payload extendido
  // expect updateCall.datos_entrega y updateCall.datos_verificacion definidos
});
```

**Step 4: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useCorteSesion.test.ts -t "datos_entrega"`
Expected: FAIL (payload actual no contempla esos campos).

**Step 5: Commit RED**

```bash
git add src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx src/hooks/__tests__/useCorteSesion.test.ts
git commit -m "test(corte): reproduce missing delivery persistence and unreadable supervisor detail"
```

---

### Task 2: Persistir fase 2/3 en `cortes` (GREEN)

**Files:**
- Modify: `src/types/auditoria.ts`
- Modify: `src/hooks/useCashCounterOrchestrator.ts`
- Modify: `src/pages/Index.tsx`
- Modify: `src/hooks/useCorteSesion.ts`
- Test: `src/hooks/__tests__/useCorteSesion.test.ts`

**Step 1: Expandir contrato de progreso con campos opcionales**

```ts
export interface DatosProgreso {
  fase_actual: number;
  conteo_parcial: Record<string, unknown> | null;
  pagos_electronicos: Record<string, unknown> | null;
  gastos_dia: Record<string, unknown> | null;
  datos_entrega?: Record<string, unknown> | null;
  datos_verificacion?: Record<string, unknown> | null;
  datos_reporte?: Record<string, unknown> | null;
}
```

**Step 2: En orquestador, construir payload extendido (solo cuando aplique)**

```ts
const datosEntrega = deliveryCalculation ? {
  amount_to_deliver: deliveryCalculation.amountToDeliver,
  amount_remaining: deliveryCalculation.amountRemaining ?? 50,
  denominations_to_deliver: deliveryCalculation.denominationsToDeliver,
  denominations_to_keep: deliveryCalculation.denominationsToKeep,
} : null;

const datosVerificacion = deliveryCalculation?.verificationBehavior
  ? { behavior: deliveryCalculation.verificationBehavior }
  : null;
```

**Step 3: Propagar payload en `Index.handleGuardarProgreso` y `useCorteSesion.guardarProgreso`**

```ts
.update({
  fase_actual: datos.fase_actual,
  estado: nuevoEstado,
  datos_conteo: datosConteo,
  datos_entrega: datos.datos_entrega ?? corteActual.datos_entrega,
  datos_verificacion: datos.datos_verificacion ?? corteActual.datos_verificacion,
  datos_reporte: datos.datos_reporte ?? corteActual.datos_reporte,
  updated_at: new Date().toISOString(),
})
```

**Step 4: Run tests to verify GREEN**

Run: `npx vitest run src/hooks/__tests__/useCorteSesion.test.ts -t "datos_entrega|datos_verificacion|guardarProgreso"`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/types/auditoria.ts src/hooks/useCashCounterOrchestrator.ts src/pages/Index.tsx src/hooks/useCorteSesion.ts src/hooks/__tests__/useCorteSesion.test.ts
git commit -m "feat(corte): persist delivery and verification payloads in supabase"
```

---

### Task 3: Modelo legible para supervisor (GREEN)

**Files:**
- Create: `src/components/supervisor/corteDetalleModel.ts`
- Create: `src/components/supervisor/__tests__/corteDetalleModel.test.ts`
- Modify: `src/components/supervisor/CorteDetalle.tsx`
- Test: `src/components/supervisor/__tests__/corteDetalleModel.test.ts`

**Step 1: Write failing mapper tests**

```ts
it('normaliza datos de conteo + entrega + verificación a un view model legible', () => {
  // input: corte con datos_conteo + datos_entrega + datos_verificacion
  // output: totals, labels, gastos normalizados, alertas y texto amigable
});
```

**Step 2: Run test to verify RED**

Run: `npx vitest run src/components/supervisor/__tests__/corteDetalleModel.test.ts`
Expected: FAIL (mapper no existe).

**Step 3: Implement mapper and plug in CorteDetalle**

```ts
export function buildCorteDetalleModel(corte: CorteConSucursal): CorteDetalleModel {
  // normalizar null-safe JSONB
  // generar bloques: resumen, entrega, pagos, gastos, denominaciones
}
```

**Step 4: Run tests to verify GREEN**

Run: `npx vitest run src/components/supervisor/__tests__/corteDetalleModel.test.ts src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/corteDetalleModel.ts src/components/supervisor/__tests__/corteDetalleModel.test.ts src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx
git commit -m "feat(supervisor): readable corte detail model with delivery and expenses blocks"
```

---

### Task 4: Live updates Realtime en supervisor (GREEN)

**Files:**
- Create: `src/hooks/useSupervisorRealtime.ts`
- Create: `src/hooks/__tests__/useSupervisorRealtime.test.ts`
- Modify: `src/components/supervisor/CortesDelDia.tsx`
- Modify: `src/components/supervisor/CorteDetalle.tsx`
- Test: `src/hooks/__tests__/useSupervisorRealtime.test.ts`

**Step 1: Write failing Realtime hook tests**

```ts
it('se suscribe a cambios de cortes y dispara onChange', () => {
  // mock supabase.channel().on().subscribe()
  // assert filtros con corte_id cuando aplique
});
```

**Step 2: Run RED**

Run: `npx vitest run src/hooks/__tests__/useSupervisorRealtime.test.ts`
Expected: FAIL (hook no existe).

**Step 3: Implement hook + integración**

```ts
useSupervisorRealtime({
  corteId,
  onChange: () => void cargarDetalle(),
});

useSupervisorRealtime({
  onChange: () => void cargarCortes(),
});
```

**Step 4: Run GREEN**

Run: `npx vitest run src/hooks/__tests__/useSupervisorRealtime.test.ts src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/useSupervisorRealtime.ts src/hooks/__tests__/useSupervisorRealtime.test.ts src/components/supervisor/CortesDelDia.tsx src/components/supervisor/CorteDetalle.tsx
git commit -m "feat(supervisor): add supabase realtime refresh for day list and detail"
```

---

### Task 5: UX de lectura rápida en detalle (GREEN)

**Files:**
- Modify: `src/components/supervisor/CorteDetalle.tsx`
- Create: `src/components/supervisor/__tests__/CorteDetalle.live-badge.test.tsx`
- Test: `src/components/supervisor/__tests__/CorteDetalle.live-badge.test.tsx`

**Step 1: Write failing test (estado vivo y timestamp legible)**

```tsx
it('muestra badge EN VIVO y ultima actualización para cortes en progreso', async () => {
  // estado EN_PROGRESO + updated_at
  // expect badge "EN VIVO" y "Actualizado hh:mm:ss"
});
```

**Step 2: Run RED**

Run: `npx vitest run src/components/supervisor/__tests__/CorteDetalle.live-badge.test.tsx`
Expected: FAIL.

**Step 3: Implement minimal UI**

```tsx
{corte.estado === 'EN_PROGRESO' && (
  <span className="...">EN VIVO</span>
)}
<MetaFila label="Última actualización" valor={formatearFechaHora(corte.updated_at)} />
```

**Step 4: Run GREEN**

Run: `npx vitest run src/components/supervisor/__tests__/CorteDetalle.live-badge.test.tsx src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__/CorteDetalle.live-badge.test.tsx
git commit -m "feat(supervisor): highlight live cuts and last-update context in detail view"
```

---

### Task 6: Verificación final + build + reinicio (obligatorio por tarea)

**Files:**
- Modify: `docs/qa/nocturnal-active-session-regression.md` (agregar bloque supervisor live)
- Create: `docs/qa/supervisor-live-corte-detalle.md`

**Step 1: Run regression pack**

Run:
```bash
npx vitest run \
  src/hooks/__tests__/useCorteSesion.test.ts \
  src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts \
  src/hooks/__tests__/useSupervisorRealtime.test.ts \
  src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx \
  src/components/supervisor/__tests__/CorteDetalle.live-badge.test.tsx \
  src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx
```
Expected: PASS total.

**Step 2: Build**

Run: `npm run build`
Expected: `✓ built`.

**Step 3: Restart local app**

Run:
```bash
# matar proceso previo en 5173 y relanzar
lsof -ti tcp:5173 | xargs kill -9
npm run dev -- --host 0.0.0.0 --port 5173
```
Expected: Vite arriba en `http://localhost:5173`.

**Step 4: Manual QA smoke (supervisor live)**

```md
- Iniciar corte nocturno en sucursal A.
- Abrir /supervisor/cortes en otro tab.
- Cambiar conteo/pagos/gastos en flujo nocturno.
- Ver refresco en vivo (<3s) en lista/detalle sin recargar.
- Confirmar bloque "Entrega a gerencia" visible al entrar a fase 2/3.
```

**Step 5: Commit docs/checklist**

```bash
git add docs/qa/supervisor-live-corte-detalle.md docs/qa/nocturnal-active-session-regression.md
git commit -m "docs(qa): add supervisor live-detail validation checklist"
```

---

## Guardrails
- Aplicar `@systematic-debugging` antes de cada fix no trivial.
- Aplicar `@test-driven-development` estrictamente RED → GREEN → REFACTOR.
- Aplicar `@verification-before-completion` antes de declarar éxito.
- Usar commits pequeños con `@commit-work`.
- DRY + YAGNI: no crear tablas nuevas mientras `datos_entrega/datos_verificacion/datos_reporte` cubran el caso.

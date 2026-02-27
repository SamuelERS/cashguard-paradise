# Mapa de Datos Disponibles — Supabase

> Todos los campos confirmados mediante inspección directa de código fuente.

---

## 1. Tabla `cortes` — campos usados para analytics

| Campo           | Tipo TypeScript          | Fuente confirma | Notas                              |
|-----------------|--------------------------|-----------------|------------------------------------|
| `id`            | `string`                 | `auditoria.ts`  | UUID v4                            |
| `sucursal_id`   | `string`                 | `auditoria.ts`  | FK → sucursales.id                 |
| `cajero`        | `string`                 | `auditoria.ts`  | Nombre libre                       |
| `estado`        | `EstadoCorte`            | `auditoria.ts`  | `'FINALIZADO'` para analytics      |
| `venta_esperada`| `number \| null`         | `auditoria.ts`  | SICAR — puede ser null             |
| `finalizado_at` | `string \| null`         | `auditoria.ts`  | ISO 8601, filtro principal         |
| `created_at`    | `string`                 | `auditoria.ts`  | Fallback si finalizado_at null     |
| `datos_conteo`  | `Record<string,unknown> \| null` | `auditoria.ts` | JSONB — ver sección 2  |

---

## 2. JSONB `datos_conteo` — estructura interna confirmada

Confirmado en `CorteDetalle.tsx` mediante la función `extraerDatosConteo()`.

### 2.1 `conteo_parcial` → totales de efectivo

```typescript
// Tipo: Partial<CashCount> (después de guards)
// CashCount importado de '@/types/cash'
// Función: calculateCashTotal(cashCount) → number

const conteoParcialRaw = datosConteo?.conteo_parcial;
if (typeof conteoParcialRaw === 'object' && conteoParcialRaw !== null &&
    !Array.isArray(conteoParcialRaw)) {
  const cashCount = conteoParcialRaw as Partial<CashCount>;
  const totalCash = calculateCashTotal(cashCount);
}
```

### 2.2 `pagos_electronicos` → totales electrónicos

```typescript
// Estructura interna (confirmada):
interface PagosElectronicos {
  credomatic:   number;  // default 0
  promerica:    number;  // default 0
  bankTransfer: number;  // default 0
  paypal:       number;  // default 0
}

// Parsing pattern (field-by-field typeof guards):
const p = pagosRaw as Record<string, unknown>;
const pagos: PagosElectronicos = {
  credomatic:   typeof p.credomatic   === 'number' ? p.credomatic   : 0,
  promerica:    typeof p.promerica    === 'number' ? p.promerica    : 0,
  bankTransfer: typeof p.bankTransfer === 'number' ? p.bankTransfer : 0,
  paypal:       typeof p.paypal       === 'number' ? p.paypal       : 0,
};
const totalElectronic = pagos.credomatic + pagos.promerica +
                        pagos.bankTransfer + pagos.paypal;
```

### 2.3 `gastos_dia` → gastos operacionales

```typescript
// Estructura interna (confirmada vía expenses.ts):
interface GastoDia {
  id:         string;
  concept:    string;
  amount:     number;
  category:   ExpenseCategory;
  hasInvoice: boolean;
  timestamp:  string;
}

// Parsing pattern (array OR {items:[]} object):
let gastos: GastoDia[] = [];
if (Array.isArray(gastosDiaRaw)) {
  gastos = gastosDiaRaw.filter(isDailyExpense) as GastoDia[];
} else if (typeof gastosDiaRaw === 'object' && gastosDiaRaw !== null) {
  const obj = gastosDiaRaw as Record<string, unknown>;
  if (Array.isArray(obj.items)) {
    gastos = obj.items.filter(isDailyExpense) as GastoDia[];
  }
}
const totalExpenses = gastos.reduce((acc, g) => acc + g.amount, 0);
```

---

## 3. Join con `sucursales`

```typescript
// Query pattern (confirmado en useSupervisorQueries.ts):
tables.cortes()
  .select('*, sucursales(id, nombre, codigo, activa)')
  .eq('estado', 'FINALIZADO')
  .gte('finalizado_at', rangoInicio)
  .lte('finalizado_at', rangoFin)

// Resultado tipado:
interface CorteConSucursal extends Corte {
  sucursales: Pick<Sucursal, 'id' | 'nombre' | 'codigo' | 'activa'> | null;
}
// sucursales puede ser null si FK fue eliminada (defensive)
const nombreSucursal = corte.sucursales?.nombre ?? 'Sin sucursal';
```

---

## 4. Ecuaciones financieras confirmadas

```
totalCash      = calculateCashTotal(conteo_parcial)
totalElectronic = sum(pagos_electronicos.*values)
totalGeneral   = totalCash + totalElectronic
totalExpenses  = sum(gastos_dia[*].amount)
totalAdjusted  = totalGeneral - totalExpenses
difference     = totalAdjusted - (venta_esperada ?? 0)

semaforo:
  difference > 0   → 'SOBRANTE'
  difference < 0   → 'FALTANTE'
  difference === 0 → 'EXACTO'
```

---

## 5. Filtros disponibles para la UI

| Filtro     | Tipo       | Fuente               | Observación                        |
|------------|------------|----------------------|------------------------------------|
| Fecha desde | `string` (YYYY-MM-DD) | Usuario | Default: hoy - 7 días       |
| Fecha hasta | `string` (YYYY-MM-DD) | Usuario | Default: hoy                |
| Sucursal   | `string` (UUID) | dropdown `obtenerListasFiltros()` | Opcional |

---

## 6. KPIs calculables con estos datos

| KPI                        | Fórmula                                  |
|----------------------------|------------------------------------------|
| Total cortes período        | `count(cortes WHERE estado=FINALIZADO)`  |
| Venta total (ajustada)      | `sum(totalAdjusted)`                     |
| Venta esperada total        | `sum(venta_esperada ?? 0)`               |
| Diferencia global           | `sum(difference)`                        |
| % cortes con sobrante       | `count(sobrante) / count(total) * 100`   |
| % cortes con faltante       | `count(faltante) / count(total) * 100`   |
| Total gastos período        | `sum(totalExpenses)`                     |
| Cortes por sucursal         | `groupBy(sucursal_id)`                   |
| Venta promedio por corte    | `sum(totalAdjusted) / count(cortes)`     |

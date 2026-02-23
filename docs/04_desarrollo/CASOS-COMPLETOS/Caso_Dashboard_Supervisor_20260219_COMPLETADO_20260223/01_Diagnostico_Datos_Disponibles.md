# 01 - Diagnostico: Datos Disponibles en Supabase para Dashboard Supervisor

> ⚠️ Corregido 2026-02-19: Schemas actualizados contra codigo fuente real (`src/types/auditoria.ts`, `src/lib/supabase.ts`, `src/lib/snapshots.ts`)

**Caso:** Dashboard Supervisor
**Fecha:** 19 febrero 2026
**Objetivo:** Inventario completo de datos existentes en Supabase y componentes reutilizables que alimentaran el dashboard de supervision gerencial.

---

## 1. Datos Disponibles por Tabla

### 1.1 Tabla `sucursales`

Almacena la informacion de cada punto de venta.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| nombre | TEXT | Nombre visible (ej: "Los Heroes", "Plaza Merliot") |
| codigo | TEXT | Codigo corto (1 caracter, ej: "H") usado en correlativo |
| activa | BOOLEAN | Si la sucursal esta operativa |

**Relevancia para dashboard:** Filtros por sucursal, encabezados de reportes, agrupacion de cortes. El campo `codigo` se usa en la generacion de correlativos (formato CORTE-YYYY-MM-DD-X-NNN).

---

### 1.2 Tabla `cortes`

Tabla principal. Cada fila representa un corte de caja completo.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico del corte |
| correlativo | TEXT | Correlativo unico: CORTE-YYYY-MM-DD-X-NNN |
| sucursal_id | UUID (FK) | Referencia a sucursales |
| cajero | TEXT | Nombre del cajero que realiza el corte (string plano, NO FK) |
| testigo | TEXT | Nombre del testigo (string plano, NO FK. Debe ser != cajero) |
| estado | TEXT | `'INICIADO'` \| `'EN_PROGRESO'` \| `'FINALIZADO'` \| `'ABORTADO'` (UPPERCASE) |
| fase_actual | INTEGER | Fase actual del proceso (1=conteo, 2=entrega, 3=reporte) |
| intento_actual | INTEGER | Numero de intento actual (1-based) |
| venta_esperada | NUMERIC \| NULL | Monto esperado segun SICAR |
| datos_conteo | JSONB \| NULL | Snapshot del conteo de efectivo |
| datos_entrega | JSONB \| NULL | Datos de la entrega a gerencia (Phase 2 Delivery) |
| datos_verificacion | JSONB \| NULL | Resultados de la verificacion ciega (Phase 2 Verification) |
| datos_reporte | JSONB \| NULL | Datos del reporte final |
| reporte_hash | TEXT \| NULL | Hash SHA-256 del reporte final (solo en FINALIZADO) |
| created_at | TIMESTAMPTZ | Inicio del corte (ISO 8601) |
| updated_at | TIMESTAMPTZ | Ultima modificacion (ISO 8601) |
| finalizado_at | TIMESTAMPTZ \| NULL | Finalizacion del corte (solo en FINALIZADO/ABORTADO) |
| motivo_aborto | TEXT \| NULL | Motivo de aborto (solo en ABORTADO) |

**Notas importantes:**
- `cajero` y `testigo` son strings planos (nombres), NO UUIDs ni foreign keys a `empleados`.
- `estado` usa valores UPPERCASE: `'INICIADO'`, `'EN_PROGRESO'`, `'FINALIZADO'`, `'ABORTADO'`.
- No existe campo `tipo` (apertura/cierre) ni campo `diferencia` en la tabla. La diferencia se calcula a partir de los campos JSONB en la capa de presentacion.

**Relevancia para dashboard:** Es la tabla central. Contiene todo lo necesario para detalle (JSONB fields) e historial (timestamps + filtros). La diferencia para el semaforo debe calcularse a partir de `datos_conteo` y `venta_esperada`.

---

### 1.3 Tabla `corte_intentos`

Registra cada intento (sesion de conteo) dentro de un corte. Es un log de nivel sesion, NO de nivel denominacion.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico del intento |
| corte_id | UUID (FK) | Referencia al corte padre |
| attempt_number | INTEGER | Numero de intento (1-based, debe ser > 0) |
| estado | TEXT | `'ACTIVO'` \| `'COMPLETADO'` \| `'ABANDONADO'` (UPPERCASE) |
| snapshot_datos | JSONB \| NULL | Snapshot completo de datos al momento de captura |
| motivo_reinicio | TEXT \| NULL | Motivo de reinicio (requerido si attempt_number > 1) |
| created_at | TIMESTAMPTZ | Timestamp de creacion (ISO 8601) |
| finalizado_at | TIMESTAMPTZ \| NULL | Timestamp de finalizacion (ISO 8601) |

**Nota:** Esta tabla NO es un log por denominacion. Cada fila representa un intento completo de sesion de corte (el cajero puede reiniciar el conteo, creando un nuevo intento). Los datos granulares de verificacion ciega por denominacion estan en el campo JSONB `datos_verificacion` de la tabla `cortes`.

**Relevancia para dashboard:** Permite ver cuantos intentos tuvo un corte, si se reinicio y por que motivo. El campo `snapshot_datos` contiene el estado parcial al momento de abandono.

---

### 1.4 Tabla `empleados`

Catalogo de empleados que operan las cajas.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| nombre | TEXT | Nombre completo |
| rol | TEXT \| NULL | Rol del empleado (ej: `cajero`, `supervisor`, `gerente`) |
| cargo | TEXT \| NULL | Cargo del empleado |
| activo | BOOLEAN | Si el empleado esta habilitado |

**Nota:** No existe campo `pin_hash` en esta tabla. La autenticacion por PIN debe manejarse por otro mecanismo (no hay campo de PIN hasheado en la tabla `empleados` del codigo fuente actual).

**Relevancia para dashboard:** Filtro por cajero (aunque `cortes.cajero` es string plano, se puede usar `empleados.nombre` para poblar dropdowns), nombre en listados.

---

### 1.5 Tabla `empleado_sucursales`

Relacion muchos-a-muchos entre empleados y sucursales.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| empleado_id | UUID (FK) | Referencia a empleados |
| sucursal_id | UUID (FK) | Referencia a sucursales |
| activo | BOOLEAN | Si la asignacion esta activa |

**Relevancia para dashboard:** Determinar que cajeros pertenecen a que sucursal para filtros contextuales.

---

### 1.6 Tabla de Auditoria `corte_conteo_snapshots`

Tabla append-only (trigger bloquea UPDATE/DELETE) que guarda snapshots inmutables del progreso de conteo. Tiene columnas individuales tipadas, NO un JSONB generico.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico (auto-generado) |
| corte_id | UUID (FK) | Referencia al corte activo |
| attempt_number | INTEGER | Numero de intento activo al momento del snapshot |
| fase_actual | INTEGER | Fase actual (1-3) |
| penny | INTEGER | Cantidad de pennies (1c) |
| nickel | INTEGER | Cantidad de nickels (5c) |
| dime | INTEGER | Cantidad de dimes (10c) |
| quarter | INTEGER | Cantidad de quarters (25c) |
| dollar_coin | INTEGER | Cantidad de monedas de dolar |
| bill_1 | INTEGER | Cantidad de billetes de $1 |
| bill_5 | INTEGER | Cantidad de billetes de $5 |
| bill_10 | INTEGER | Cantidad de billetes de $10 |
| bill_20 | INTEGER | Cantidad de billetes de $20 |
| bill_50 | INTEGER | Cantidad de billetes de $50 |
| bill_100 | INTEGER | Cantidad de billetes de $100 |
| credomatic | NUMERIC | Monto Credomatic |
| promerica | NUMERIC | Monto Promerica |
| bank_transfer | NUMERIC | Monto transferencia bancaria |
| paypal | NUMERIC | Monto PayPal |
| gastos_dia | JSONB \| NULL | Gastos del dia (serializado) |
| source | TEXT | Origen del snapshot: `'autosave'` \| `'manual'` \| `'fase_change'` |
| captured_at | TIMESTAMPTZ | Timestamp de captura (DB default: now()) |

**Nota:** Las columnas de denominaciones usan snake_case (ej: `dollar_coin`, `bill_1`) mientras que el codigo TypeScript usa camelCase (ej: `dollarCoin`, `bill1`). El mapeo se realiza en `src/lib/snapshots.ts` (funciones `toDbRow` / `fromDbRow`).

**Relevancia para dashboard:** Auditoria forense avanzada. Permite comparar el estado del conteo en distintos momentos para detectar inconsistencias o manipulacion. Cada snapshot tiene columnas individuales, lo que permite queries SQL directos sobre denominaciones sin parsear JSONB.

---

## 2. Campos JSONB Ricos

Los campos JSONB de la tabla `cortes` contienen la informacion mas valiosa para el dashboard.

### 2.1 `datos_conteo` (Phase 1)

Contiene el conteo completo de denominaciones y pagos electronicos.

```
{
  "denominaciones": {
    "penny": 43,
    "nickel": 20,
    "dime": 33,
    "quarter": 8,
    "dollarCoin": 1,
    "bill1": 5,
    "bill5": 3,
    "bill10": 2,
    "bill20": 4,
    "bill50": 0,
    "bill100": 1
  },
  "pagos_electronicos": {
    "credomatic": 5.32,
    "promerica": 56.12,
    "bankTransfer": 43.56,
    "paypal": 0.00
  },
  "total_efectivo": 377.20,
  "total_electronico": 105.00,
  "total_general": 482.20
}
```

**Uso en dashboard:** Desglose completo de lo contado, totales para vista resumen.

---

### 2.2 `datos_entrega` (Phase 2 Delivery)

Contiene que denominaciones se entregaron a gerencia y cuales quedaron en caja.

```
{
  "monto_entregado": 327.20,
  "monto_en_caja": 50.00,
  "denominaciones_entregadas": { ... },
  "denominaciones_en_caja": { ... },
  "pasos_entrega": [ ... ]
}
```

**Uso en dashboard:** Verificar que la entrega cuadra con el conteo.

---

### 2.3 `datos_verificacion` (Phase 2 Verification)

Resultados de la verificacion ciega anti-fraude. Es el campo mas rico para el semaforo.

```
{
  "total_intentos": 15,
  "exitos_primer_intento": 5,
  "exitos_segundo_intento": 2,
  "tercer_intento_requerido": 1,
  "overrides_forzados": 0,
  "inconsistencias_criticas": 1,
  "denominaciones_con_problemas": [
    {
      "denominacion": "dime",
      "severidad": "critical_severe",
      "intentos": [33, 40, 32]
    },
    {
      "denominacion": "quarter",
      "severidad": "warning_retry",
      "intentos": [9, 8]
    }
  ]
}
```

**Uso en dashboard:** Semaforo de verificacion, detalle de alertas criticas, metricas de precision por cajero.

---

### 2.4 `datos_reporte` (Phase 3)

Texto completo del reporte enviado por WhatsApp, ya formateado.

```
{
  "texto_completo": "... reporte WhatsApp completo ...",
  "hash_firma": "ZXRlZCI6M30=",
  "timestamp_generacion": "2026-02-19T15:30:00Z"
}
```

**Uso en dashboard:** Vista previa del reporte tal como lo recibio gerencia.

---

## 3. Queries Necesarios para el Dashboard

### 3.1 Lista de Cortes del Dia

```
SELECT cortes.*, sucursales.nombre as sucursal_nombre
FROM cortes
JOIN sucursales ON cortes.sucursal_id = sucursales.id
WHERE cortes.created_at >= HOY_INICIO
  AND cortes.created_at < HOY_FIN
  AND cortes.estado = 'FINALIZADO'
ORDER BY cortes.finalizado_at DESC
```

**Nota:** No se necesita JOIN a `empleados` porque `cortes.cajero` y `cortes.testigo` ya son strings planos con los nombres. El estado es `'FINALIZADO'` (UPPERCASE). El campo de finalizacion es `finalizado_at` (no `completed_at`).

**Campos requeridos:** hora, sucursal, cajero, total general (de `datos_conteo` JSONB), diferencia (calculada en capa de presentacion a partir de `datos_conteo` y `venta_esperada`), datos de verificacion para semaforo.

---

### 3.2 Detalle de Corte Individual

```
SELECT cortes.*, corte_intentos.*
FROM cortes
LEFT JOIN corte_intentos ON ...
WHERE cortes.id = :corte_id
```

**Campos requeridos:** Todos los JSONB desempaquetados, lista completa de intentos de verificacion.

---

### 3.3 Historial por Rango de Fechas

```
SELECT cortes.*, sucursales.nombre as sucursal_nombre
FROM cortes
JOIN sucursales ON cortes.sucursal_id = sucursales.id
WHERE cortes.created_at BETWEEN :fecha_desde AND :fecha_hasta
  AND (:sucursal_id IS NULL OR cortes.sucursal_id = :sucursal_id)
  AND (:cajero IS NULL OR cortes.cajero = :cajero)
  AND cortes.estado = 'FINALIZADO'
ORDER BY cortes.finalizado_at DESC
LIMIT 50
```

**Nota:** El filtro por cajero usa `cortes.cajero` (string plano), no un UUID FK. No se necesita JOIN a `empleados`.

---

### 3.4 Metricas Agregadas (futuro)

```
SELECT cajero,
       COUNT(*) as total_cortes
FROM cortes
WHERE created_at >= :periodo_inicio
  AND estado = 'FINALIZADO'
GROUP BY cajero
```

**Nota:** Este query es para una futura vista de metricas por cajero. No es parte del MVP. La diferencia no existe como campo en la tabla -- se calcula en la capa de presentacion a partir de `datos_conteo` (JSONB) y `venta_esperada`. Para metricas agregadas que requieran diferencia, se necesitaria una vista SQL materializada o calculo client-side.

---

## 4. Componentes Existentes Reutilizables

### 4.1 Reutilizables Directamente

| Componente | Ubicacion | Uso en Dashboard |
|------------|-----------|------------------|
| `PinModal` | `src/components/ui/pin-modal.tsx` | Autenticacion del supervisor al acceder al dashboard |
| `CorteStatusBanner` | `src/components/corte/CorteStatusBanner.tsx` | Indicador de conexion Supabase en el dashboard |
| `ConstructiveActionButton` | `src/components/shared/` | Botones de accion en el dashboard |
| `DestructiveActionButton` | `src/components/shared/` | Botones de cancelar/cerrar |
| `NeutralActionButton` | `src/components/shared/` | Botones secundarios |
| `ConfirmationModal` | `src/components/ui/confirmation-modal.tsx` | Confirmaciones de acciones |

### 4.2 Reutilizables con Adaptacion

| Componente | Ubicacion | Adaptacion Necesaria |
|------------|-----------|---------------------|
| `useCorteSesion` | `src/hooks/useCorteSesion.ts` | Actualmente solo consulta sesion activa. Necesita queries adicionales para historico |
| `DeliveryDashboard` | `src/components/deliveries/DeliveryDashboard.tsx` | Solo muestra deliveries pendientes. NO sirve para vista supervisor, pero el layout puede inspirar |

### 4.3 No Reutilizables (Solo Referencia)

| Componente | Razon |
|------------|-------|
| `CashCalculation.tsx` | Acoplado al flujo de conteo activo, no a visualizacion historica |
| `Phase2VerificationSection.tsx` | Monolitico (783+ lineas), logica de conteo ciego activo |
| `CashCounter.tsx` | Controla el flujo completo Phase 1-3, no es componente de visualizacion |

---

## 5. Gaps Identificados

| Gap | Descripcion | Prioridad |
|-----|-------------|-----------|
| Sin hook de queries historicos | `useCorteSesion` solo maneja sesion activa | Alta |
| Sin componente de tabla/lista | No existe un componente generico de listado con filtros | Alta |
| Sin logica de semaforo | La clasificacion verde/amarillo/rojo no existe como utilidad | Media |
| Sin ruta /supervisor | React Router no tiene esta ruta configurada | Alta |
| Sin RLS para supervisor | Supabase RLS necesita politica para rol supervisor | Media |
| Sin cache de queries | Las consultas al dashboard deberian tener revalidacion periodica | Baja |

---

## 6. Conclusiones

**Los datos estan completos.** Supabase tiene toda la informacion necesaria para construir un dashboard supervisor funcional:

- La tabla `cortes` con sus campos JSONB contiene el 90% de lo necesario
- La tabla `corte_intentos` aporta el 10% restante (granularidad por intento)
- Los componentes de UI compartidos (botones, modales, banners) cubren la capa visual basica
- El gap principal es la capa de queries historicos y los componentes de listado/detalle

**No se necesita modificar el esquema de base de datos.** Todo lo necesario ya esta almacenado. Solo se requiere construir las queries de lectura y los componentes de presentacion.

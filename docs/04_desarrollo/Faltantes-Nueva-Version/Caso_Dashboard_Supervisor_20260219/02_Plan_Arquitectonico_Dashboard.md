# 02 - Plan Arquitectonico: Dashboard Supervisor

> ⚠️ Corregido 2026-02-19: Schemas actualizados contra codigo fuente real (`src/types/auditoria.ts`, `src/lib/supabase.ts`, `src/lib/snapshots.ts`)

**Caso:** Dashboard Supervisor
**Fecha:** 19 febrero 2026
**Objetivo:** Dashboard minimo viable donde el gerente visualice los cortes del dia con sistema de semaforo, acceda al detalle de cada corte y consulte historial por rango de fechas.

---

## 1. Objetivo del MVP

Proveer al gerente/supervisor una herramienta de consulta que permita:

1. **Ver cortes del dia** con indicador visual de estado (semaforo verde/amarillo/rojo)
2. **Inspeccionar el detalle** de cualquier corte (conteo, entrega, verificacion, alertas)
3. **Consultar historial** filtrando por sucursal, cajero y rango de fechas
4. **Acceso protegido** mediante PIN de supervisor (reutilizando mecanismo existente)

**Lo que NO es parte del MVP:**
- Metricas agregadas por cajero (promedios, tendencias)
- Graficas o visualizaciones estadisticas
- Notificaciones push o alertas en tiempo real
- Edicion o modificacion de cortes desde el dashboard
- Exportacion a PDF o Excel

---

## 2. Arquitectura Propuesta

### 2.1 Nueva Ruta

| Ruta | Componente | Descripcion |
|------|-----------|-------------|
| `/supervisor` | `SupervisorDashboard` | Punto de entrada. Muestra PinModal si no autenticado |
| `/supervisor/cortes` | `CortesDelDia` | Lista de cortes del dia con semaforo |
| `/supervisor/corte/:id` | `CorteDetalle` | Detalle completo de un corte individual |
| `/supervisor/historial` | `CorteHistorial` | Consulta historica con filtros |

**Navegacion:** Tab bar simple con 2 opciones: "Hoy" y "Historial". El detalle se accede haciendo tap en una fila de cualquiera de las dos vistas.

---

### 2.2 Tres Vistas Principales

#### Vista A: Lista de Cortes del Dia

- Muestra todos los cortes completados del dia actual
- Cada fila tiene: hora, sucursal, cajero, total contado, diferencia, indicador semaforo
- Ordenado por hora descendente (mas reciente arriba)
- Auto-refresh cada 60 segundos (o pull-to-refresh en movil)
- Si no hay cortes: mensaje "Sin cortes registrados hoy"
- Tap en una fila navega al detalle

#### Vista B: Detalle de Corte Individual

- Header con metadata: sucursal, cajero, testigo, fecha/hora, estado
- Seccion 1: Resumen ejecutivo (total efectivo, electronico, general, diferencia con semaforo)
- Seccion 2: Conteo de denominaciones (tabla con cantidad x valor = subtotal)
- Seccion 3: Pagos electronicos desglosados (Credomatic, Promerica, Transferencia, PayPal)
- Seccion 4: Entrega a gerencia (que se entrego, que quedo en caja)
- Seccion 5: Verificacion ciega (metricas + lista de denominaciones con problemas)
- Seccion 6: Alertas detectadas (criticas en rojo, advertencias en amarillo)
- Boton "Ver Reporte Original" que muestra el texto tal como se envio por WhatsApp

#### Vista C: Historial por Rango de Fechas

- Filtros: fecha desde, fecha hasta, sucursal (dropdown), cajero (dropdown)
- Todos los filtros son opcionales excepto el rango de fechas
- Tabla de resultados identica a Vista A (hora, sucursal, cajero, total, diferencia, semaforo)
- Paginacion: maximo 50 resultados por pagina
- Tap en fila navega al mismo detalle (Vista B)

---

### 2.3 Queries Supabase

Los queries se implementaran en un hook dedicado. Todos usan el cliente Supabase ya configurado en el proyecto.

#### Query 1: Cortes del Dia

Obtiene cortes finalizados de hoy con join a sucursales. Filtra por `created_at` del dia actual usando timezone `America/El_Salvador` y `estado = 'FINALIZADO'`. Ordena por `finalizado_at DESC`. **Nota:** No se necesita JOIN a `empleados` porque `cortes.cajero` y `cortes.testigo` ya son strings planos con los nombres.

#### Query 2: Detalle de Corte

Obtiene un corte por ID con todos sus campos, incluyendo los JSONB completos. Join con sucursales para nombre de sucursal. **Nota:** Los nombres de cajero y testigo ya estan en `cortes.cajero` y `cortes.testigo` (strings planos). Opcionalmente, obtiene los registros de `corte_intentos` asociados para ver cantidad de reintentos y motivos.

#### Query 3: Historial Filtrado

Similar al Query 1 pero con rango de fechas parametrizado y filtros opcionales por sucursal (`sucursal_id`) y cajero (`cortes.cajero`, string plano). Limite de 50 resultados con ordenamiento descendente por `finalizado_at`.

#### Query 4: Listas para Filtros

Obtiene sucursales activas y empleados activos para poblar los dropdowns de filtros en la vista de historial.

---

### 2.4 Componentes Nuevos Necesarios

| Componente | Responsabilidad |
|------------|----------------|
| `SupervisorDashboard` | Layout principal con tabs, autenticacion por PIN, contenedor de vistas |
| `CortesDelDia` | Vista A - lista del dia con auto-refresh |
| `CorteDetalle` | Vista B - detalle completo con secciones expandibles |
| `CorteHistorial` | Vista C - filtros + tabla de resultados |
| `CorteListaItem` | Fila reutilizable para listas (hora, sucursal, cajero, diferencia, semaforo) |
| `SemaforoIndicador` | Circulo coloreado verde/amarillo/rojo basado en diferencia |
| `SeccionConteo` | Sub-componente: tabla de denominaciones contadas |
| `SeccionVerificacion` | Sub-componente: metricas de verificacion ciega + alertas |
| `FiltrosHistorial` | Formulario de filtros: fechas, sucursal, cajero |
| `ReporteOriginalModal` | Modal que muestra el texto del reporte WhatsApp original |

---

### 2.5 Hook Nuevo

| Hook | Responsabilidad |
|------|----------------|
| `useSupervisorQueries` | Encapsula los 4 queries Supabase. Maneja loading, error, refetch. Expone funciones tipadas para cada consulta |

---

## 3. Autenticacion

### Mecanismo

- Al acceder a `/supervisor`, se muestra `PinModal` (componente existente)
- El PIN se valida contra la tabla `empleados` filtrando por `rol = 'supervisor'` o `rol = 'gerente'`
- **Nota:** La tabla `empleados` actualmente NO tiene campo `pin_hash`. El mecanismo de validacion de PIN debe definirse como parte de la implementacion (opciones: agregar campo `pin_hash` a la tabla, usar un PIN hardcoded en configuracion, o validar contra otra fuente)
- Si el PIN es valido, se guarda un flag en sessionStorage (no localStorage, para que expire al cerrar pestana)
- El flag tiene un TTL de 4 horas. Despues de 4 horas, se solicita PIN nuevamente
- No se requiere logout explicito; cerrar la pestana o esperar 4h es suficiente

### Justificacion de PIN vs Autenticacion Completa

- El dashboard es de **solo lectura** (no modifica datos)
- Es una herramienta interna para 2-3 personas (gerente + supervisores)
- PIN es consistente con la UX existente del proyecto (cajeros ya usan PIN)
- Autenticacion completa (email/password, OAuth) seria sobredimensionada para el MVP

### Seguridad

- PIN se transmite hasheado (no en texto plano) -- **requiere definir mecanismo de almacenamiento de PIN ya que `empleados` no tiene campo `pin_hash`**
- SessionStorage se limpia al cerrar pestana
- Supabase RLS deberia tener una politica que permita SELECT en `cortes` solo para roles supervisor/gerente
- El dashboard no expone endpoints de escritura
- **Nota sobre campo `cajero`:** Dado que `cortes.cajero` es un string plano (no FK), no hay relacion directa con `empleados` para verificar permisos a nivel de fila. La seguridad depende de RLS a nivel de tabla.

---

## 4. Sistema de Semaforo

### Reglas de Clasificacion

| Color | Condicion Diferencia | Condicion Verificacion | Significado |
|-------|---------------------|----------------------|-------------|
| Verde | `ABS(diferencia) < $3.00` | Sin criticas en verificacion | Corte normal, sin problemas |
| Amarillo | `$3.00 <= ABS(diferencia) <= $10.00` | O tiene advertencias en verificacion | Requiere atencion, revisar |
| Rojo | `ABS(diferencia) > $10.00` | O tiene criticas en verificacion | Accion inmediata requerida |

### Logica de Prioridad

Si un corte cumple condiciones de multiples colores, se aplica el mas severo:
- Rojo tiene prioridad sobre Amarillo
- Amarillo tiene prioridad sobre Verde
- Verificacion ciega con criticas SIEMPRE es Rojo (sin importar la diferencia monetaria)

### Ejemplo

| Diferencia | Verificacion | Semaforo Final |
|------------|-------------|----------------|
| +$1.50 | Sin problemas | Verde |
| -$5.00 | 1 advertencia | Amarillo |
| +$2.00 | 1 critica severa | Rojo (critica de verificacion) |
| -$15.00 | Sin problemas | Rojo (diferencia > $10) |
| -$8.00 | 2 criticas | Rojo (ambos criterios) |

---

## 5. Archivos a Crear y Modificar

### Archivos Nuevos

| Archivo | Tipo | Descripcion |
|---------|------|-------------|
| `src/pages/SupervisorDashboard.tsx` | Pagina | Contenedor principal con autenticacion |
| `src/components/supervisor/CortesDelDia.tsx` | Componente | Vista lista del dia |
| `src/components/supervisor/CorteDetalle.tsx` | Componente | Vista detalle individual |
| `src/components/supervisor/CorteHistorial.tsx` | Componente | Vista historial con filtros |
| `src/components/supervisor/CorteListaItem.tsx` | Componente | Fila reutilizable |
| `src/components/supervisor/SemaforoIndicador.tsx` | Componente | Indicador visual de semaforo |
| `src/components/supervisor/SeccionConteo.tsx` | Componente | Desglose de denominaciones |
| `src/components/supervisor/SeccionVerificacion.tsx` | Componente | Metricas verificacion ciega |
| `src/components/supervisor/FiltrosHistorial.tsx` | Componente | Formulario de filtros |
| `src/components/supervisor/ReporteOriginalModal.tsx` | Componente | Modal texto reporte |
| `src/hooks/useSupervisorQueries.ts` | Hook | Queries Supabase para el dashboard |
| `src/utils/semaforoLogic.ts` | Utilidad | Funcion pura para determinar color de semaforo |

### Archivos a Modificar

| Archivo | Modificacion |
|---------|-------------|
| `src/App.tsx` o router config | Agregar ruta `/supervisor` y sub-rutas |
| `src/components/OperationSelector.tsx` | Agregar boton "Dashboard Supervisor" (opcional, puede ser ruta directa) |

---

## 6. Criterios de Aceptacion

### Vista Lista del Dia (Vista A)

- [ ] Muestra todos los cortes completados del dia actual
- [ ] Cada fila muestra: hora, sucursal, cajero, total general, diferencia, semaforo
- [ ] Semaforo muestra color correcto segun reglas definidas
- [ ] Tap en fila navega al detalle del corte
- [ ] Muestra mensaje apropiado si no hay cortes
- [ ] Se actualiza al hacer pull-to-refresh o cada 60 segundos

### Vista Detalle (Vista B)

- [ ] Muestra header con metadata completa del corte
- [ ] Seccion conteo muestra todas las denominaciones con cantidades y subtotales
- [ ] Seccion pagos electronicos muestra las 4 plataformas
- [ ] Seccion entrega muestra lo entregado y lo que quedo en caja
- [ ] Seccion verificacion muestra metricas y denominaciones con problemas
- [ ] Seccion alertas muestra criticas en rojo y advertencias en amarillo
- [ ] Boton "Ver Reporte Original" abre modal con texto WhatsApp

### Vista Historial (Vista C)

- [ ] Filtros de fecha desde/hasta funcionan correctamente
- [ ] Dropdown de sucursal filtra resultados
- [ ] Dropdown de cajero filtra resultados
- [ ] Resultados muestran misma estructura que Vista A
- [ ] Tap en fila navega al mismo detalle
- [ ] Paginacion funciona con 50 resultados por pagina

### Autenticacion

- [ ] PIN requerido al acceder a /supervisor
- [ ] Solo PINs de supervisores/gerentes son aceptados
- [ ] Sesion expira al cerrar pestana
- [ ] Sesion expira despues de 4 horas

### Generales

- [ ] TypeScript: 0 errores (cero `any`)
- [ ] Build exitoso sin warnings
- [ ] Responsive: funcional en mobile y desktop
- [ ] Consistent con design system existente (glass morphism, paleta de colores)

---

## 7. Esfuerzo Estimado

| Fase | Descripcion | Tiempo Estimado |
|------|-------------|-----------------|
| Fase 1 | Hook `useSupervisorQueries` + utilidad semaforo | 2-3 horas |
| Fase 2 | Vista A: Lista del Dia + CorteListaItem + SemaforoIndicador | 3-4 horas |
| Fase 3 | Vista B: Detalle de Corte (6 secciones) | 4-5 horas |
| Fase 4 | Vista C: Historial con filtros | 2-3 horas |
| Fase 5 | Autenticacion PIN + rutas + integracion | 2-3 horas |
| Fase 6 | Testing manual + ajustes UX | 2-3 horas |
| **Total** | | **15-21 horas** |

### Orden de Implementacion Recomendado

1. **Fase 1 primero:** Hook de queries es la base de todo. Sin datos no hay UI.
2. **Fase 2 segundo:** La lista del dia es la vista mas usada y valida el hook.
3. **Fase 5 tercero:** Autenticacion para proteger el acceso antes de continuar.
4. **Fase 3 cuarto:** Detalle es la vista mas compleja pero depende de la lista.
5. **Fase 4 quinto:** Historial reutiliza componentes de la lista.
6. **Fase 6 ultimo:** Ajustes finales con datos reales.

---

## 8. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| JSONB fields vacios en cortes antiguos | Alta | Medio | Defensive checks en UI: si campo es null, mostrar "Datos no disponibles" |
| Performance con muchos cortes en historial | Baja | Medio | Paginacion de 50 + indice en `created_at` |
| PIN de supervisor no configurado | Media | Alto | Documentar proceso de setup en README del dashboard |
| RLS de Supabase bloquea queries | Media | Alto | Verificar politicas ANTES de implementar. Crear politica si no existe |
| Timezone inconsistente en filtros | Media | Medio | Usar `America/El_Salvador` consistentemente en todas las queries |

---

## 9. Decisiones Arquitectonicas

### Por que no reutilizar DeliveryDashboard.tsx

`DeliveryDashboard.tsx` (ubicado en `src/components/deliveries/DeliveryDashboard.tsx`) existe pero esta disenado para que el encargado de entregas vea deliveries pendientes. Su proposito es operacional (recibir entregas) no supervisorial (inspeccionar cortes). Reutilizarlo forzaria un refactor mayor que construir desde cero.

### Por que componentes separados en vez de un monolito

El proyecto tiene un historial documentado de componentes monoliticos problematicos (`Phase2VerificationSection.tsx` con 783+ lineas causo multiples bugs de useEffect). El dashboard se construira con componentes pequenos y enfocados siguiendo el principio de responsabilidad unica.

### Por que sessionStorage y no un token JWT

El dashboard es una herramienta interna de solo lectura para 2-3 personas. Un sistema de tokens JWT seria sobredimensionado. SessionStorage con TTL es simple, seguro (expira al cerrar) y consistente con la filosofia del proyecto.

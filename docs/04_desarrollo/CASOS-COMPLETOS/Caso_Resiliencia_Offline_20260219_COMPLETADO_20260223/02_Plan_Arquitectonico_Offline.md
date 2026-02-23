# 02 - Plan Arquitectonico: Resiliencia Offline

> ⚠️ Corregido 2026-02-19: Nombres de funciones y tablas actualizados contra codigo fuente real
> ⚠️ Corregido 2026-02-22 (DACC forense): ConnectionStatusBanner → usar CorteStatusBanner.tsx existente (175 líneas, 6 estados), solo crear hook useConnectionStatus

**Caso:** Resiliencia Offline
**Fecha:** 19 de febrero 2026
**Estado:** Plan propuesto - Pendiente aprobacion
**Prerequisito:** Diagnostico completado (01_Diagnostico_Infraestructura_Actual.md)
**Proyecto:** CashGuard Paradise

---

## Tabla de Contenidos

1. [Objetivo](#1-objetivo)
2. [Estrategia de 3 Capas](#2-estrategia-de-3-capas)
3. [Manejo de Conflictos](#3-manejo-de-conflictos)
4. [Archivos a Modificar](#4-archivos-a-modificar)
5. [Criterios de Aceptacion](#5-criterios-de-aceptacion)
6. [Riesgos y Mitigaciones](#6-riesgos-y-mitigaciones)
7. [Esfuerzo Estimado](#7-esfuerzo-estimado)
8. [Orden de Implementacion](#8-orden-de-implementacion)

---

## 1. Objetivo

**Objetivo principal:** Integrar la infraestructura existente de `offlineQueue` con `useCorteSesion` para que todas las operaciones de persistencia contra Supabase sobrevivan a perdidas de conexion a internet, se encolen automaticamente, y se sincronicen cuando la conexion regrese.

**Principio rector:** El cajero nunca debe perder datos por falta de internet. El flujo de trabajo (conteo, verificacion, reporte) es 100% local. La sincronizacion con Supabase es una operacion en segundo plano que no debe bloquear al usuario.

**Alcance:**

- Conectar offlineQueue con las operaciones de useCorteSesion
- Agregar runtime caching para llamadas API de Supabase
- Proporcionar feedback visual del estado de conexion
- Sincronizar automaticamente cuando la conexion regrese
- Manejar conflictos con estrategia simple y predecible

**Fuera de alcance:**

- Sincronizacion bidireccional compleja (no aplica: un solo cajero por sesion)
- Offline-first para lectura de datos historicos
- Cambios en la estructura de tablas de Supabase
- Modificaciones al flujo de Phase 1, 2 o 3

---

## 2. Estrategia de 3 Capas

### Capa 1: Integracion offlineQueue con useCorteSesion

**Proposito:** Que cada operacion de escritura a Supabase tenga un fallback automatico a la cola offline cuando la red falla.

**Mecanismo:**

Crear un wrapper alrededor de las llamadas a Supabase dentro de `useCorteSesion`. Este wrapper sigue la logica:

```
1. Intentar ejecutar la operacion contra Supabase
2. Si EXITO: retornar resultado normalmente
3. Si FALLA por red (TypeError: Failed to fetch):
   a. Encolar operacion en offlineQueue via agregarOperacion()
   b. La cola persiste en localStorage
   c. Retornar al usuario como si hubiera tenido exito (optimistic update)
   d. Log de warning en consola para debugging
4. Si FALLA por otra razon (permisos, datos invalidos):
   a. NO encolar (el retry no va a resolver un error logico)
   b. Propagar el error normalmente
```

**Operaciones que se envuelven con este wrapper:**

| Operacion en useCorteSesion | Tipo Supabase | Encolable offline |
|---|---|---|
| `iniciarCorte()` | INSERT | Si - Crear registro en `cortes` con estado INICIADO + primer intento |
| `guardarProgreso()` | UPDATE | Si - Actualizar datos parciales del corte |
| `finalizarCorte()` | UPDATE | Si - Marcar como FINALIZADO con reporte_hash |
| `abortarCorte()` | UPDATE | Si - Marcar como ABORTADO con motivo |
| `reiniciarIntento()` | INSERT + UPDATE | Si - Crear nuevo intento y limpiar datos parciales |
| `recuperarSesion()` | SELECT | No - Lectura, necesita datos reales del servidor |

**Nota importante sobre operaciones de lectura:** La operacion SELECT (`recuperarSesion`) no se encola porque no tiene sentido "reintentar" una lectura. Para esta, el runtime caching de Capa 2 proporciona una capa de proteccion diferente.

**Deteccion de errores de red vs errores logicos:**

La diferenciacion es esencial para no encolar operaciones que nunca van a tener exito:

| Tipo de error | Ejemplo | Accion |
|---|---|---|
| Error de red | `TypeError: Failed to fetch`, `NetworkError` | Encolar en offlineQueue |
| Error de Supabase (permisos) | `PostgrestError: permission denied` | Propagar error, NO encolar |
| Error de Supabase (datos) | `PostgrestError: violates not-null constraint` | Propagar error, NO encolar |
| Error de timeout | `AbortError: The operation was aborted` | Encolar en offlineQueue |

### Capa 2: Runtime caching en Workbox para Supabase API

**Proposito:** Agregar una capa de caching a nivel de Service Worker para las llamadas HTTP a Supabase, proporcionando respuestas cacheadas cuando la red no esta disponible.

**Strategy: NetworkFirst**

Se utiliza NetworkFirst (no CacheFirst) porque:

- Los datos de cortes de caja cambian frecuentemente
- Siempre se prefiere el dato mas reciente del servidor
- El cache solo actua como fallback cuando la red falla
- Duracion de cache corta (maximo 1 hora) para evitar datos obsoletos

**Rutas a cachear:**

| Patron de URL | Estrategia | Cache TTL | Justificacion |
|---|---|---|---|
| `*.supabase.co/rest/v1/cortes*` | NetworkFirst | 1 hora | Operaciones principales de corte |
| `*.supabase.co/rest/v1/sucursales*` | CacheFirst | 24 horas | Datos de sucursales cambian muy poco |
| `*.supabase.co/rest/v1/empleados*` | CacheFirst | 24 horas | Lista de empleados cambia poco |
| `*.supabase.co/auth/*` | NetworkOnly | Sin cache | Auth tokens no se deben cachear |

**Beneficio para operaciones de lectura:**

Mientras Capa 1 protege las escrituras (INSERT/UPDATE), Capa 2 protege las lecturas (SELECT):

- `recuperarSesion()` puede servir datos cacheados si la red falla (busca cortes INICIADO/EN_PROGRESO)
- El ultimo estado del corte activo puede cargarse desde cache
- La lista de sucursales y empleados (usada en el wizard) funciona offline

### Capa 3: UI de estado de conexion + sincronizacion automatica

**Proposito:** Informar al cajero sobre el estado de su conexion y sincronizar automaticamente cuando la red regrese.

**Componente 1: Hook useConnectionStatus**

Un hook que encapsula la deteccion de conectividad:

- Escucha eventos `online` y `offline` del navegador
- Expone un estado reactivo `isOnline: boolean`
- Al detectar transicion `offline -> online`:
  - Ejecuta `procesarCola()` automaticamente
  - Muestra notificacion de sincronizacion exitosa
- Debounce de 2 segundos para evitar falsos positivos en conexiones inestables

**Componente 2: CorteStatusBanner (YA EXISTE — solo conectar)**

> ⚠️ Corregido 2026-02-22: Este componente YA EXISTE en `src/components/corte/CorteStatusBanner.tsx` (175 lineas). NO crear componente nuevo.

El banner **ya implementa 6 estados visuales** mas completos que los 4 propuestos originalmente:

| Estado existente | Color | Funcionalidad |
|---|---|---|
| online | Verde | Oculto o indicador minimo |
| offline | Rojo | Banner fijo con mensaje de desconexion |
| reconectando | Amber | Banner con indicador de reconexion |
| sincronizando | Azul | Banner con spinner de sincronizacion |
| pendiente | Amber | Operaciones pendientes de sincronizar |
| error | Rojo | Error con boton "Reintentar" opcional |

**Problema actual:** En `CashCounter.tsx` linea 108, `estadoConexion` esta **hardcodeado** a `"online"` — el banner nunca muestra estado real.

**Lo que falta:** Reemplazar `estadoConexion="online"` con el valor real del hook `useConnectionStatus` (Componente 1).

**Archivos existentes del banner:**
- Componente: `src/components/corte/CorteStatusBanner.tsx` (175 lineas)
- Tests: `src/components/corte/__tests__/CorteStatusBanner.test.tsx`
- Types exportados: `EstadoConexion`, `EstadoSync`, `CorteStatusBannerProps`

**Sincronizacion automatica:**

Cuando la conexion regresa (`online` event):

1. Esperar 2 segundos de debounce (confirmar que la conexion es estable)
2. Ejecutar `procesarCola()` de offlineQueue
3. Si todas las operaciones se procesan: mostrar "Sincronizado" brevemente (3s) y ocultar banner
4. Si alguna operacion falla: mantener en cola para siguiente intento (backoff exponencial ya existe en offlineQueue)

---

## 3. Manejo de Conflictos

### Estrategia: Last-Write-Wins con Timestamp

**Justificacion de la simplicidad:**

CashGuard Paradise tiene una caracteristica que simplifica enormemente el manejo de conflictos: **un solo cajero opera un corte a la vez**. No hay edicion concurrente. Los conflictos solo pueden ocurrir en un escenario muy especifico:

```
1. Cajero A inicia corte en Dispositivo 1
2. Internet se pierde, operaciones se encolan
3. Cajero A (u otra persona) abre sesion en Dispositivo 2
4. Cajero A en Dispositivo 1 recupera internet
5. Cola se procesa: operaciones del Dispositivo 1 se envian a Supabase
6. CONFLICTO: Supabase tiene datos del Dispositivo 2 que son mas recientes
```

Este escenario es raro pero posible. La estrategia para manejarlo:

### Implementacion

Cada operacion encolada incluye un campo `timestamp` (ISO 8601) que registra **cuando se genero originalmente** la operacion (no cuando se ejecuta el retry).

**Regla de resolucion:**

| Situacion | Quien gana | Razon |
|---|---|---|
| Operacion encolada tiene timestamp POSTERIOR a ultima actualizacion en Supabase | La operacion encolada se aplica | Es la accion mas reciente |
| Operacion encolada tiene timestamp ANTERIOR a ultima actualizacion en Supabase | La operacion encolada se DESCARTA | Supabase tiene datos mas recientes |

**Mecanismo:**

- Antes de ejecutar un UPDATE encolado, comparar `operacion.timestamp` con `updated_at` del registro en Supabase
- Si `operacion.timestamp > registro.updated_at`: ejecutar el UPDATE
- Si `operacion.timestamp <= registro.updated_at`: descartar la operacion, log de warning

**Para INSERTs:**

- Los INSERTs usan un UUID generado localmente como ID
- Si el INSERT falla por duplicado (`unique constraint violation`), se descarta (ya fue creado por otra via)
- Si el INSERT tiene exito, se procede normalmente

### Escenarios validados

| # | Escenario | Resultado esperado |
|---|---|---|
| 1 | Cajero pierde internet 2 minutos, reconecta, nadie toco el registro | Operaciones encoladas se aplican exitosamente |
| 2 | Cajero pierde internet, otro dispositivo actualiza el registro, cajero reconecta | Operaciones antiguas se descartan, datos mas recientes prevalecen |
| 3 | Cajero pierde internet durante `finalizarCorte()`, reconecta | Finalizacion se ejecuta desde la cola, corte se marca como FINALIZADO |
| 4 | Cajero pierde internet durante `iniciarCorte()`, reconecta | INSERT se ejecuta, corte se crea retroactivamente |
| 5 | Cajero pierde internet y nunca reconecta en ese dispositivo | Datos permanecen en localStorage indefinidamente, disponibles si vuelve a abrir la app |

---

## 4. Archivos a Modificar

### Archivos existentes a modificar

| Archivo | Cambio requerido | Descripcion |
|---|---|---|
| `src/lib/offlineQueue.ts` | Modificar | Agregar tipos especificos para operaciones Supabase (INSERT, UPDATE, DELETE). Agregar campo `timestamp` obligatorio. Agregar funcion de comparacion de timestamps para resolucion de conflictos. |
| `src/hooks/useCorteSesion.ts` | Modificar | Envolver las 5 operaciones de escritura (`iniciarCorte`, `guardarProgreso`, `finalizarCorte`, `abortarCorte`, `reiniciarIntento`) con try/catch que encole en offlineQueue cuando falla por red. Agregar logica de deteccion de error de red vs error logico. |
| `vite.config.ts` | Modificar | Agregar configuracion de `runtimeCaching` en la seccion de Workbox con las rutas de Supabase API. Definir strategies (NetworkFirst para cortes, CacheFirst para catalagos, NetworkOnly para auth). |

### Archivos nuevos a crear

| Archivo | Tipo | Descripcion |
|---|---|---|
| `src/hooks/useConnectionStatus.ts` | Hook | Hook de deteccion de estado online/offline. Escucha eventos del navegador. Expone `isOnline` reactivo. Ejecuta `procesarCola()` automaticamente al reconectar con debounce de 2 segundos. |

> ~~`src/components/shared/ConnectionStatusBanner.tsx`~~ — **NO CREAR.** `CorteStatusBanner.tsx` ya existe en `src/components/corte/` con 175 lineas y 6 estados visuales. Solo conectar hook `useConnectionStatus` al banner existente en `CashCounter.tsx`.

### Archivos de tests a crear o modificar

| Archivo | Accion | Descripcion |
|---|---|---|
| Tests existentes de offlineQueue | Extender | Agregar tests para los nuevos tipos de operaciones Supabase y la logica de comparacion de timestamps |
| Tests de useCorteSesion | Extender | Agregar tests que simulen fallo de red y verifiquen que la operacion se encola correctamente |
| Tests de useConnectionStatus | Crear | Tests para transiciones online/offline, debounce, y trigger de procesarCola |
| Tests de CorteStatusBanner | Extender | Tests existentes en `src/components/corte/__tests__/CorteStatusBanner.test.tsx` — extender para verificar integracion con hook useConnectionStatus |

---

## 5. Criterios de Aceptacion

### Capa 1: Integracion offlineQueue + useCorteSesion

- [ ] `iniciarCorte()` se encola automaticamente cuando falla por red
- [ ] `guardarProgreso()` se encola automaticamente cuando falla por red
- [ ] `finalizarCorte()` se encola automaticamente cuando falla por red
- [ ] `abortarCorte()` se encola automaticamente cuando falla por red
- [ ] `reiniciarIntento()` se encola automaticamente cuando falla por red
- [ ] Errores logicos de Supabase (permisos, constraints) NO se encolan
- [ ] Operaciones encoladas persisten en localStorage tras cerrar la app
- [ ] Operaciones encoladas incluyen timestamp ISO 8601 del momento de creacion
- [ ] El cajero no percibe diferencia en el flujo cuando la operacion se encola (optimistic update)
- [ ] TypeScript: cero tipos `any` en toda la integracion

### Capa 2: Runtime caching Workbox

- [ ] Llamadas a `cortes` usan strategy NetworkFirst con TTL de 1 hora
- [ ] Llamadas a `sucursales` usan strategy CacheFirst con TTL de 24 horas
- [ ] Llamadas a `empleados` usan strategy CacheFirst con TTL de 24 horas
- [ ] Llamadas a auth endpoints usan NetworkOnly (sin cache)
- [ ] El wizard puede cargar lista de sucursales y empleados sin conexion (desde cache)
- [ ] `recuperarSesion()` retorna datos cacheados cuando no hay red

### Capa 3: UI de estado de conexion

- [ ] Banner aparece automaticamente cuando se detecta perdida de conexion
- [ ] Banner desaparece automaticamente cuando la conexion regresa y se sincroniza
- [ ] `procesarCola()` se ejecuta automaticamente al detectar reconexion
- [ ] Debounce de 2 segundos previene falsos positivos en conexiones inestables
- [ ] Banner no bloquea la interfaz ni requiere interaccion del usuario
- [ ] Banner es responsive y se adapta a mobile/desktop
- [ ] Estados visuales: oculto, offline (amarillo), sincronizando (azul), error (rojo)

### Manejo de conflictos

- [ ] Operaciones con timestamp posterior a `updated_at` se aplican
- [ ] Operaciones con timestamp anterior a `updated_at` se descartan con log
- [ ] INSERTs duplicados se manejan gracefully (constraint violation = descartar)
- [ ] Log de warning cuando una operacion se descarta por conflicto

### Generales

- [ ] Build de produccion pasa sin errores (`npm run build`)
- [ ] TypeScript pasa sin errores (`npx tsc --noEmit`)
- [ ] Tests existentes no se rompen (regresion cero)
- [ ] Nuevos tests cubren los escenarios criticos de cada capa

---

## 6. Riesgos y Mitigaciones

### Riesgo 1: Cola crece indefinidamente sin conexion

| Aspecto | Detalle |
|---|---|
| **Riesgo** | Si el cajero opera sin internet por horas, la cola puede acumular cientos de operaciones de `guardarProgreso()` |
| **Probabilidad** | Media |
| **Impacto** | Alto - localStorage tiene limite (~5MB), cola llena puede causar errores |
| **Mitigacion** | Deduplicar operaciones UPDATE del mismo registro: si ya hay un `guardarProgreso` en cola para el mismo `corte_id`, reemplazarlo con el mas reciente en lugar de agregar otro. Solo el ultimo estado importa. |

### Riesgo 2: Datos obsoletos en cache causan confusion

| Aspecto | Detalle |
|---|---|
| **Riesgo** | Workbox sirve datos cacheados de hace 1 hora, cajero ve informacion desactualizada |
| **Probabilidad** | Baja |
| **Impacto** | Medio - El cajero podria intentar reanudar una sesion que ya fue cerrada en otro dispositivo |
| **Mitigacion** | TTL conservador (1 hora para cortes). Al reconectar, forzar refresh de datos criticos antes de mostrarlos al usuario. Mostrar timestamp de "ultima sincronizacion" en la UI. |

### Riesgo 3: navigator.onLine reporta falsos positivos

| Aspecto | Detalle |
|---|---|
| **Riesgo** | `navigator.onLine` puede reportar `true` cuando hay WiFi conectado pero sin acceso a internet real |
| **Probabilidad** | Media |
| **Impacto** | Bajo - Las operaciones fallaran y se encolaran normalmente por el try/catch |
| **Mitigacion** | El try/catch de Capa 1 es la proteccion real. `navigator.onLine` es solo para la UI (banner). Si `onLine` es true pero la llamada falla, la operacion se encola igualmente. |

### Riesgo 4: Conflicto de timestamps por reloj del dispositivo desajustado

| Aspecto | Detalle |
|---|---|
| **Riesgo** | Si el reloj del dispositivo del cajero esta adelantado, sus operaciones encoladas siempre "ganarian" en la resolucion de conflictos |
| **Probabilidad** | Baja |
| **Impacto** | Medio - Datos incorrectos podrian sobreescribir datos correctos |
| **Mitigacion** | Usar timestamp del servidor (`server_time`) cuando este disponible. En modo offline, usar `Date.now()` local como fallback. Agregar margen de tolerancia de 60 segundos en la comparacion de timestamps. |

### Riesgo 5: offlineQueue tiene bugs no descubiertos

| Aspecto | Detalle |
|---|---|
| **Riesgo** | Aunque offlineQueue tiene ~30 tests, nunca fue probada en produccion real |
| **Probabilidad** | Baja-Media |
| **Impacto** | Alto - Perdida de datos si la cola falla silenciosamente |
| **Mitigacion** | Agregar logging extensivo en las primeras versiones. Monitorear localStorage en dispositivos de prueba. Mantener `guardarProgreso()` con doble escritura (Supabase + localStorage directo) durante periodo de validacion. |

---

## 7. Esfuerzo Estimado

### Por capa

| Capa | Descripcion | Implementacion | Tests | Documentacion | Total |
|---|---|---|---|---|---|
| **Capa 1** | Integracion offlineQueue + useCorteSesion | 3-4 horas | 2-3 horas | 1 hora | **6-8 horas** |
| **Capa 2** | Runtime caching Workbox | 1-2 horas | 1 hora | 30 min | **2.5-3.5 horas** |
| **Capa 3** | UI conexion + sync automatico | 2-3 horas | 1-2 horas | 30 min | **3.5-5.5 horas** |
| **Conflictos** | Logica last-write-wins | 1-2 horas | 1-2 horas | 30 min | **2.5-4.5 horas** |

### Total estimado

| Escenario | Horas |
|---|---|
| Optimista | 14.5 horas |
| Realista | 18 horas |
| Pesimista | 21.5 horas |

### Justificacion del esfuerzo reducido

El esfuerzo es significativamente menor que construir desde cero porque:

- offlineQueue ya tiene la logica de cola FIFO, retry con backoff, y persistencia
- Los tests de offlineQueue ya existen (~30 tests)
- useCorteSesion ya tiene las funciones bien definidas (solo envolver, no reescribir)
- Workbox ya esta configurado (solo agregar runtimeCaching rules)
- El design system del proyecto ya define colores y componentes reutilizables

---

## 8. Orden de Implementacion

### Fase 1: Capa 1 - Integracion offlineQueue (Prioridad maxima)

**Razon:** Es el cambio con mayor impacto. Resuelve el problema fundamental de perdida de datos.

Tareas:
1. Extender tipos en offlineQueue para operaciones Supabase
2. Agregar campo timestamp obligatorio a operaciones
3. Crear wrapper de deteccion de errores de red vs logicos
4. Envolver `iniciarCorte()` con try/catch + enqueue
5. Envolver `guardarProgreso()` con try/catch + enqueue
6. Envolver `finalizarCorte()` con try/catch + enqueue
7. Envolver `abortarCorte()` con try/catch + enqueue
8. Envolver `reiniciarIntento()` con try/catch + enqueue
9. Implementar deduplicacion para guardarProgreso (mismo corte_id)
10. Tests de integracion

### Fase 2: Capa 3 - UI de conexion (Prioridad alta)

**Razon:** Sin feedback visual, el cajero no sabe que esta offline. Se implementa antes de Capa 2 porque es mas visible para validacion del usuario.

Tareas:
1. Crear hook useConnectionStatus
2. Implementar debounce de 2 segundos
3. Conectar procesarCola() al evento de reconexion
4. Conectar hook useConnectionStatus al CorteStatusBanner existente en CashCounter.tsx (reemplazar `estadoConexion="online"` hardcodeado)
5. Tests de hook + verificar tests existentes del banner no se rompen
6. Validacion visual de 6 estados del banner con datos reales

### Fase 3: Capa 2 - Runtime caching Workbox (Prioridad media)

**Razon:** Complementa Capa 1 protegiendo lecturas. Es configuracion, no codigo de aplicacion.

Tareas:
1. Agregar runtimeCaching para cortes (NetworkFirst, 1h)
2. Agregar runtimeCaching para sucursales (CacheFirst, 24h)
3. Agregar runtimeCaching para empleados (CacheFirst, 24h)
4. Configurar NetworkOnly para auth endpoints
5. Validar que el build genera Service Worker correcto
6. Tests manuales de comportamiento offline

### Fase 4: Manejo de conflictos (Prioridad media-baja)

**Razon:** Es un edge case poco frecuente. Se implementa al final cuando las capas principales estan estables.

Tareas:
1. Implementar comparacion de timestamps antes de UPDATE
2. Manejar constraint violations en INSERTs
3. Agregar logging de operaciones descartadas
4. Tests de escenarios de conflicto

---

**Documento anterior:** `01_Diagnostico_Infraestructura_Actual.md` - Diagnostico completo de la situacion actual

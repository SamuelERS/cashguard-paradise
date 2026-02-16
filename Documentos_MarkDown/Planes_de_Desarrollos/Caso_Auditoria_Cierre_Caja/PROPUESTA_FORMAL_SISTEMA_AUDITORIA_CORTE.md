# PROPUESTA FORMAL: Sistema de Auditoría y Control de Corte de Caja

**Producto:** ParadiseCashware / CashGuard Paradise (PWA)
**Fecha:** 2026-02-08
**Tipo:** Inspección técnica + Propuesta arquitectónica formal
**Severidad del problema:** CRÍTICA (integridad de control interno + auditoría)
**Estado:** PROPUESTA — Pendiente aprobación antes de implementación

---

## TABLA DE CONTENIDO

1. [Diagnóstico técnico actual](#1-diagnóstico-técnico-actual)
2. [Vulnerabilidades comprobadas](#2-vulnerabilidades-comprobadas)
3. [Propuesta de solución](#3-propuesta-de-solución)
4. [Entidades y estados conceptuales](#4-entidades-y-estados-conceptuales)
5. [Responsabilidades frontend vs backend](#5-responsabilidades-frontend-vs-backend)
6. [Riesgos y consideraciones](#6-riesgos-y-consideraciones)
7. [Alcance explícito](#7-alcance-explícito)

---

## 1. DIAGNÓSTICO TÉCNICO ACTUAL

### 1.1 Arquitectura relevante — Qué tenemos hoy

CashGuard Paradise es una **PWA 100% client-side** desplegada como archivos estáticos en SiteGround (Nginx). No existe backend, base de datos, ni API de ningún tipo.

**Stack confirmado:**
- React 18 + TypeScript + Vite + Tailwind + Radix UI + Framer Motion
- Despliegue: GitHub Actions → FTP → SiteGround (archivos estáticos)
- Docker: Solo para dev server (Node) o producción (Nginx estático)
- Supabase: Variables de entorno configuradas en `.env.example` pero **sin integración real en código** (0 imports, 0 llamadas)

**Flujo actual del corte/cierre (Evening Cut):**

```
OperationSelector.tsx          → Usuario elige "Corte de Caja"
  ↓
Index.tsx                      → Renderiza CashCounter con modo "evening"
  ↓
CashCounter.tsx                → Orquesta las 3 fases via usePhaseManager
  ↓
┌─ Phase 1: Conteo guiado     → useCashCounterOrchestrator + GuidedFieldView
│  (denominación por denominación, conteo ciego anti-fraude)
│
├─ Phase 2: Entrega + Verificación  → Phase2Manager.tsx
│  ├─ Phase2DeliverySection    → Instrucciones de separación ($50 queda)
│  └─ Phase2VerificationSection → Verificación ciega (3 intentos max)
│
└─ Phase 3: Reporte final     → CashCalculation.tsx
   ├─ Resultados bloqueados hasta enviar reporte WhatsApp
   ├─ generateCompleteReport() → Texto plano con firma Base64
   └─ Envío via whatsapp:// protocol o clipboard
```

**Dónde se guarda el estado:**

| Mecanismo | Qué almacena | Persiste refresh? | Persiste cierre? | Persiste incógnito? |
|-----------|-------------|-------------------|-------------------|---------------------|
| React useState | **TODO**: conteos, fases, cálculos, reportes | NO | NO | NO |
| sessionStorage | IDs de sesión de conteo (timestamps) | SI | NO | NO |
| localStorage | Lockout PIN (5 min), tema visual, deliveries | SI | SI | NO |
| Backend/DB | **NADA** — No existe | N/A | N/A | N/A |

**Hallazgo crítico:** La totalidad de los datos financieros del corte (conteos por denominación, totales, diferencias, pagos electrónicos, verificación ciega) viven **exclusivamente en React state (memoria RAM del navegador)**. Un F5, cierre de pestaña, o navegación hacia atrás destruye todo sin rastro.

### 1.2 Qué NO tenemos y por qué permite el problema

| Capacidad ausente | Consecuencia directa |
|-------------------|---------------------|
| **Correlativo único por corte** | No existe identidad del evento. Cada vez que se abre la app es "la primera vez". |
| **Sesión de corte persistente** | Refresh = todo perdido. No hay concepto de "corte en progreso". |
| **Locking de corte activo** | Nada impide abrir N pestañas simultáneas con N cortes del mismo día. |
| **Registro de intentos (attempts)** | Si el usuario reinicia, el intento previo no existe. Cero evidencia. |
| **Backend / Base de datos** | No hay fuente de verdad central. Todo depende del cliente (manipulable). |
| **Confirmación server-side de envío** | El "reporte enviado" es un `setState(true)` — no hay verificación real. |
| **Protección anti-refresh** | No hay `beforeunload`, no hay guardado automático, no hay recovery. |

### 1.3 Limitaciones técnicas reales hoy

1. **Sin infraestructura backend**: Supabase fue planeado (`.env.example` tiene variables) pero nunca se conectó. No hay paquete Supabase, Firebase, Axios ni ningún cliente HTTP en `package.json`.

2. **Sin API endpoints**: La búsqueda exhaustiva de `fetch(`, `axios`, `XMLHttpRequest`, `WebSocket` en `/src` retorna **cero resultados** en código activo. Existe un placeholder comentado en `errorLogger.ts` líneas 193-197:
   ```typescript
   // fetch('/api/logs', {
   //   method: 'POST',
   //   body: JSON.stringify(log),
   // }).catch(console.error);
   ```

3. **Hosting estático**: SiteGround sirve archivos via Nginx. No hay runtime server-side (no Node, no Python, no serverless functions).

4. **Firma digital débil**: El "hash" del reporte usa `btoa()` (Base64 encoding) truncado a 16 caracteres — es reversible y forjable por cualquiera. No es una firma criptográfica.

5. **PIN hardcodeado**: El PIN supervisor es SHA-256 de "1234", almacenado como constante en el código fuente. Validación 100% client-side.

---

## 2. VULNERABILIDADES COMPROBADAS

### 2.1 Bypass por refresh/cierre (CRÍTICA)

**Vector de ataque:**
```
1. Empleado inicia corte de caja
2. Completa Phase 1 (conteo) → ve que hay faltante
3. Cierra pestaña / F5 / navega hacia atrás
4. Reabre la app → estado limpio, zero evidencia
5. Repite hasta que "cuadre"
6. Envía el corte "bueno" como si fuera el único
```

**Evidencia técnica:** `usePhaseManager.ts` líneas 77-79 — Todo estado usa `useState()` sin persistencia. `CashCalculation.tsx` líneas 62-64 — Datos del reporte solo en memoria.

**No existe** `beforeunload` handler que advierta al usuario ni guarde progreso.

### 2.2 Bypass por modo incógnito (CRÍTICA)

**Vector:** Abrir la PWA en ventana de incógnito genera un contexto completamente limpio. Incluso el lockout de PIN (localStorage) no existe en incógnito. El usuario tiene:
- 0 intentos previos registrados
- 0 cortes previos del día
- Acceso completo sin restricciones

### 2.3 Bypass del bloqueo de resultados (ALTA)

**Vector:** `reportSent` es un `useState(false)` en `CashCalculation.tsx` línea 63. El mecanismo "Resultados Bloqueados" es puramente visual — controlado por un booleano de React en memoria del cliente. Adicionalmente:
- El auto-timeout de 10 segundos cambia `reportSent` a `true` sin verificación
- "Ya lo envié" no tiene confirmación server-side
- Navegar hacia atrás y volver reinicia todo

### 2.4 Bypass del lockout de PIN (ALTA)

**Vector:** El lockout de 3 intentos se almacena en `localStorage` key `delivery_pin_lockout`. Un usuario con acceso a DevTools puede:
1. Abrir Application → localStorage
2. Eliminar la key
3. Refresh → lockout eliminado, 3 intentos nuevos

**Evidencia:** `DeliveryDashboardWrapper.tsx` líneas 17-62 — Sin validación de integridad del dato.

### 2.5 Ausencia total de audit trail (CRÍTICA)

No existe registro persistente de:
- Que un corte fue iniciado
- Que un corte fue completado
- Que un corte fue abandonado/reiniciado
- Cuántos intentos hubo
- Si el reporte WhatsApp fue realmente enviado o solo "confirmado" por el usuario

La única evidencia que existe del corte es el **mensaje de WhatsApp** — que depende de que el empleado lo envíe honestamente, y que el supervisor lo conserve.

---

## 3. PROPUESTA DE SOLUCIÓN

### 3.1 Principio rector

> **La fuente de verdad de un corte de caja debe ser server-side.** El cliente (navegador/PWA) es un canal de captura, no el custodio de la información. Ningún estado crítico debe depender exclusivamente de memoria volátil del browser.

### 3.2 Componentes nuevos propuestos

#### A. Backend: Servicio de Auditoría de Cortes

Un servicio backend (propuesta: **Supabase** ya configurado en `.env.example`, o alternativamente un API serverless) que expone los siguientes recursos conceptuales:

| Recurso | Propósito |
|---------|-----------|
| `POST /cortes/iniciar` | Crear sesión de corte con correlativo único. Retorna `corte_id`. |
| `PATCH /cortes/{id}/progreso` | Guardar estado parcial (Phase 1 completada, Phase 2 en progreso, etc.) |
| `POST /cortes/{id}/finalizar` | Marcar corte como completado. Registra datos finales. Inmutable después. |
| `POST /cortes/{id}/abortar` | Marcar corte como abortado. Requiere motivo. Auditable. |
| `GET /cortes/activo?sucursal={id}&fecha={hoy}` | Consultar si hay corte activo para esa sucursal/fecha. |
| `GET /cortes/{id}/intentos` | Lista de intentos (attempts) para un corte. |
| `POST /cortes/{id}/intentos` | Registrar nuevo intento. Incrementa attempt_number. |

#### B. Modelo de datos: Entidad `Corte`

```
Corte {
  id:                UUID (generado server-side)
  correlativo:       string  "CORTE-2026-02-08-HEROES-001"
  sucursal_id:       string  (ej: "heroes", "merliot")
  fecha:             date    (solo fecha, sin hora)
  estado:            enum    (INICIADO | EN_PROGRESO | FINALIZADO | ABORTADO)
  cajero_id:         string
  testigo_id:        string
  attempt_number:    integer (1, 2, 3...)
  fase_actual:       integer (1, 2, 3)

  // Datos financieros (se llenan progresivamente)
  conteo_efectivo:   JSON    (denominaciones + totales)
  pagos_electronicos: JSON   (credomatic, promerica, etc.)
  total_general:     number
  venta_esperada:    number
  diferencia:        number
  verificacion_ciega: JSON   (behavior + attempts)

  // Metadatos de auditoría
  created_at:        timestamp
  updated_at:        timestamp
  finalizado_at:     timestamp | null
  reporte_enviado:   boolean
  reporte_hash:      string (SHA-256 real del contenido)
  ip_cliente:        string
  user_agent:        string
}
```

#### C. Modelo de datos: Entidad `CorteIntento` (Attempt)

```
CorteIntento {
  id:                UUID
  corte_id:          UUID (FK → Corte)
  attempt_number:    integer (1, 2, 3...)
  motivo_reinicio:   string | null  ("Error de conteo", "Cierre accidental", etc.)
  estado:            enum (INICIADO | COMPLETADO | ABANDONADO)
  datos_snapshot:    JSON  (foto del estado al momento del intento)
  created_at:        timestamp
  abandoned_at:      timestamp | null
  ip_cliente:        string
}
```

### 3.3 Flujo propuesto — Sesión de corte con control

```
┌─────────────────────────────────────────────────────────────┐
│  EMPLEADO ABRE LA APP                                        │
│                                                              │
│  GET /cortes/activo?sucursal=heroes&fecha=2026-02-08         │
│                                                              │
│  ┌── Caso A: No hay corte activo ──────────────────────┐    │
│  │  → Botón "Iniciar Corte" habilitado                  │    │
│  │  → POST /cortes/iniciar                              │    │
│  │  → Server genera correlativo CORTE-2026-02-08-H-001  │    │
│  │  → Server retorna corte_id + correlativo             │    │
│  │  → Estado: INICIADO, attempt: 1                      │    │
│  │  → Cliente guarda corte_id en memoria + localStorage │    │
│  │  → Inicia Phase 1 normalmente                        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌── Caso B: Hay corte INICIADO/EN_PROGRESO ───────────┐    │
│  │  → Pantalla: "Tienes un corte en progreso"           │    │
│  │  → Opciones:                                         │    │
│  │     [Reanudar] → Carga estado guardado, continúa     │    │
│  │     [Nuevo intento] → POST /cortes/{id}/intentos     │    │
│  │       → attempt_number++                             │    │
│  │       → Pantalla: "Este es tu intento #2"            │    │
│  │       → Queda registrado permanentemente             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌── Caso C: Corte FINALIZADO del día ─────────────────┐    │
│  │  → Pantalla: "El corte del día ya fue completado"    │    │
│  │  → Muestra: correlativo + hora + cajero + resultado  │    │
│  │  → No se permite crear otro corte                    │    │
│  │  → (Excepción: PIN supervisor para reabrir)          │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Guardado progresivo (anti-pérdida por cierre)

Durante el corte activo, el cliente envía actualizaciones al backend en momentos clave:

| Evento | Acción backend |
|--------|---------------|
| Phase 1 completada (conteo terminado) | `PATCH /cortes/{id}/progreso` con conteo_efectivo + fase_actual=1 |
| Phase 2 delivery completada | `PATCH /cortes/{id}/progreso` con datos delivery + fase_actual=2 |
| Phase 2 verificación completada | `PATCH /cortes/{id}/progreso` con verificacion_ciega |
| Phase 3 reporte generado | `PATCH /cortes/{id}/progreso` con total_general, diferencia |
| Reporte WhatsApp enviado | `POST /cortes/{id}/finalizar` con reporte_hash |

**Si el usuario cierra el navegador en cualquier punto**, al reabrir:
- `GET /cortes/activo` retorna el corte con su estado parcial
- El cliente puede reconstruir la pantalla desde los datos guardados
- El usuario ve: "Tu corte está en Phase 2 — ¿Deseas continuar?"

### 3.5 Correlativo único — Generación server-side

**Formato propuesto:** `CORTE-{YYYY-MM-DD}-{SUCURSAL_CODE}-{SECUENCIAL}`

**Ejemplos:**
- `CORTE-2026-02-08-HEROES-001` (primer corte del día en Los Héroes)
- `CORTE-2026-02-08-HEROES-001-A2` (segundo intento del mismo corte)
- `CORTE-2026-02-08-MERLIOT-001` (primer corte en Plaza Merliot)

**Reglas:**
1. El correlativo se genera **server-side** al crear el corte
2. No se puede duplicar (constraint UNIQUE en DB: `sucursal + fecha + secuencial`)
3. El cliente lo recibe y lo muestra, pero no lo genera
4. Intentos adicionales se identifican con sufijo `-A2`, `-A3`
5. Un corte FINALIZADO no puede generar más intentos (a menos que un supervisor lo reabra con PIN)

### 3.6 Reintentos visibles — El usuario sabe que "esto cuenta"

Cuando el usuario inicia un nuevo intento (porque cerró el browser, se equivocó, etc.):

```
┌─────────────────────────────────────────────────┐
│  ⚠️ NUEVO INTENTO DE CORTE                      │
│                                                  │
│  Correlativo: CORTE-2026-02-08-HEROES-001-A2    │
│  Este es tu intento #2 del día.                  │
│                                                  │
│  Intento anterior:                               │
│  • Iniciado: 3:15 PM por Tito Gomez             │
│  • Estado: ABANDONADO (cierre de navegador)      │
│  • Fase alcanzada: Phase 2                       │
│                                                  │
│  ⚠️ Todos los intentos quedan registrados        │
│     y son visibles para supervisión.             │
│                                                  │
│  Motivo del reinicio (obligatorio):              │
│  [ Error de conteo          ▼ ]                  │
│                                                  │
│  [Continuar con intento #2]                      │
└─────────────────────────────────────────────────┘
```

**Efecto disuasorio:** El empleado sabe que reiniciar NO borra el intento anterior. El supervisor verá "Attempt 1: ABANDONADO, Attempt 2: FINALIZADO" y puede preguntar por qué.

### 3.7 Dónde viviría la "memoria persistente"

**Opción recomendada: Supabase (PostgreSQL + Auth + Realtime)**

Justificación:
- Ya existe configuración preparada en `.env.example` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Supabase ofrece PostgreSQL (relacional, ACID, constraints), Auth (JWT tokens), y Row Level Security
- SDK oficial para JavaScript/TypeScript — se integra directamente al frontend React
- Tier gratuito suficiente para el volumen (pocas sucursales, pocos cortes/día)
- No requiere mantener servidor propio (serverless)

**Alternativa:** Cloudflare Workers + D1 (SQLite serverless) si se prefiere evitar Supabase.

**Alternativa mínima viable:** API serverless en Vercel/Netlify Functions + cualquier DB PostgreSQL.

**Lo que NO es aceptable:** Solo localStorage o IndexedDB. Incógnito los borra. El cliente es manipulable.

---

## 4. ENTIDADES Y ESTADOS CONCEPTUALES

### 4.1 Diagrama de estados del Corte

```
                    ┌───────────┐
        Crear       │           │
    ───────────────►│ INICIADO  │
                    │           │
                    └─────┬─────┘
                          │
                   Guardar progreso
                          │
                    ┌─────▼─────┐
                    │           │
                    │EN_PROGRESO│◄──── Reanudación
                    │           │      (refresh/cierre)
                    └──┬────┬───┘
                       │    │
              Finalizar│    │Abortar (motivo obligatorio)
                       │    │
                 ┌─────▼┐  ┌▼────────┐
                 │      │  │         │
                 │FINAL │  │ABORTADO │
                 │      │  │         │
                 └──────┘  └─────────┘
                 (inmutable) (auditable)
```

**Reglas de transición:**
- `INICIADO → EN_PROGRESO`: Automático al completar Phase 1
- `EN_PROGRESO → FINALIZADO`: Solo cuando reporte fue enviado y datos completos
- `EN_PROGRESO → ABORTADO`: Explícito con motivo, o automático si se crea nuevo intento
- `FINALIZADO → *`: No se puede modificar (inmutable). Solo supervisor puede reabrir.
- `ABORTADO → *`: No se puede reactivar. Queda como evidencia de auditoría.

### 4.2 Entidades del sistema

```
Sucursal
  ├── id, nombre, código
  └── [1:N] → Corte

Corte (evento del día)
  ├── id, correlativo, fecha, sucursal, estado
  ├── cajero, testigo
  ├── datos financieros (JSON progresivo)
  ├── metadatos auditoría (timestamps, IP, user-agent)
  └── [1:N] → CorteIntento

CorteIntento (attempt)
  ├── id, corte_id, attempt_number
  ├── motivo_reinicio, estado
  ├── datos_snapshot (foto del estado al abandonar)
  └── timestamps

Supervisor (futuro)
  ├── id, nombre
  └── PIN hash (server-side)
```

---

## 5. RESPONSABILIDADES FRONTEND vs BACKEND

### 5.1 Lo que hace el Backend (fuente de verdad)

| Responsabilidad | Detalle |
|----------------|---------|
| **Generar correlativo** | Único, secuencial, no reutilizable. UNIQUE constraint en DB. |
| **Crear sesión de corte** | Registrar inicio con timestamp, IP, user-agent. |
| **Locking por sucursal/día** | Rechazar creación si ya existe corte FINALIZADO para ese día. |
| **Almacenar progreso** | Guardar estado parcial en cada fase completada. |
| **Registrar intentos** | Cada reinicio crea un CorteIntento con motivo y snapshot. |
| **Marcar finalización** | Solo cuando datos completos + reporte enviado. Inmutable después. |
| **Validar PIN supervisor** | Mover validación de PIN a server-side (hash comparado en DB). |
| **Proveer dashboard supervisor** | API para listar cortes del día/semana con intentos. |
| **Almacenar hash de reporte** | SHA-256 real del contenido del reporte (verificable). |

### 5.2 Lo que hace el Frontend (canal de captura)

| Responsabilidad | Detalle |
|----------------|---------|
| **Captura de datos** | Conteo guiado, pagos electrónicos, verificación ciega. Sin cambios al UX actual. |
| **Sincronización con backend** | Enviar progreso en momentos clave (fin de fase). |
| **Recuperación de estado** | Al abrir, consultar si hay corte activo y restaurar UI. |
| **Generación de reporte** | Texto para WhatsApp (sin cambios). |
| **Envío WhatsApp** | Protocol handler / clipboard (sin cambios). |
| **Mostrar correlativo** | Visible en header durante todo el proceso. |
| **Mostrar número de intento** | "Intento #2" visible si no es el primero. |
| **Advertencia de cierre** | `beforeunload` handler: "Tienes un corte en progreso". |
| **Cache offline** | Service worker cachea la app. Datos pendientes se envían al reconectar. |

### 5.3 Lo que DEJA DE HACER el Frontend

| Antes (solo cliente) | Después (con backend) |
|---------------------|----------------------|
| `reportSent = useState(false)` decide si resultados se muestran | Backend confirma que reporte fue registrado |
| `localStorage` para lockout PIN | Backend valida PIN y maneja intentos |
| `btoa()` como "firma digital" | SHA-256 server-side con secret key (HMAC) |
| Cero registro de cortes previos | Backend tiene historial completo por sucursal |
| Empleado puede repetir infinitamente | Backend muestra "Intento #N" y guarda todos |

---

## 6. RIESGOS Y CONSIDERACIONES

### 6.1 Riesgos técnicos

| Riesgo | Mitigación |
|--------|-----------|
| **Latencia de red** | Guardado progresivo es no-bloqueante. La captura continúa mientras se sincroniza. Reintentos con exponential backoff. |
| **Sin conectividad (offline)** | Cola local (IndexedDB) de operaciones pendientes. Service worker intercepta y encola. Sincroniza al reconectar. |
| **Supabase downtime** | Rate limitado a operaciones críticas (inicio, progreso, finalización). La captura local funciona sin backend — solo la persistencia se posterga. |
| **Migración de datos existentes** | No hay datos existentes que migrar. La app actual no persiste nada. Migración = zero. |
| **Complejidad añadida al frontend** | Se introduce un `useCorteSesion()` hook que encapsula toda la lógica de sync. El resto de componentes no cambia. |

### 6.2 Riesgos operativos

| Riesgo | Mitigación |
|--------|-----------|
| **Empleado sin internet** | App sigue funcionando offline. Datos se sincronizan después. Correlativo se genera al reconectar (o se pre-asigna si hay batching). |
| **Resistencia al cambio** | UX del conteo NO cambia. Solo se agrega: pantalla de reanudación, indicador de intento, advertencia al cerrar. |
| **Supervisor necesita ver intentos** | Dashboard web simple (Supabase tiene dashboard + se puede crear vista Postgres). |
| **PIN supervisor compartido** | Migrar a PINs individuales por supervisor (tabla `supervisores` en DB). Cada uno con su hash. |

### 6.3 Consideraciones de privacidad

- Los datos financieros viajan cifrados via HTTPS (Supabase usa TLS)
- Row Level Security (RLS) de Supabase limita acceso por sucursal
- No se almacenan datos personales sensibles más allá de nombres (ya presentes en reportes WhatsApp)
- Hash del reporte permite verificar integridad sin exponer contenido

---

## 7. ALCANCE EXPLÍCITO

### 7.1 Qué SÍ cubre esta propuesta

- Diagnóstico del estado actual con evidencia de código real
- Identificación de 5 vulnerabilidades comprobadas con vectores de ataque
- Propuesta arquitectónica de backend (Supabase) con modelo de datos
- Flujo completo de sesión de corte con estados y transiciones
- Sistema de correlativos únicos no reutilizables
- Registro de intentos (attempts) con motivo y snapshot
- Reanudación de corte tras cierre de navegador
- División clara de responsabilidades frontend/backend
- Análisis de riesgos técnicos y operativos

### 7.2 Qué NO cubre esta propuesta (fuera de alcance)

- **Implementación de código** — Requiere orden explícita adicional
- **Schema SQL final** — Se definirá en fase de implementación
- **Endpoints exactos (REST/RPC)** — Se diseñarán con la API de Supabase
- **Tests E2E del flujo** — Se planificarán post-aprobación
- **Dashboard de supervisor** — Fase posterior (requiere decisión de UI)
- **Migración de PIN a server-side** — Puede hacerse en fase separada
- **Sistema de roles/permisos** — Se define cuando haya Auth implementado
- **Notificaciones push** — Fase futura (notificar supervisor de anomalías)
- **Reportería histórica** — Fase futura (tendencias por sucursal/cajero)
- **Cambios al flujo UX del conteo** — El conteo guiado, verificación ciega, y anti-fraude existentes no se modifican

### 7.3 Dependencias para implementación

1. **Cuenta Supabase activa** con proyecto creado (tier gratuito suficiente)
2. **Variables de entorno reales** en `.env` (URL + anon key)
3. **Paquete `@supabase/supabase-js`** como nueva dependencia
4. **Decisión sobre PINs**: ¿Migrar a PIN por supervisor o mantener PIN único?
5. **Definición de sucursales**: ¿Lista fija o configurable?
6. **Política de reintentos**: ¿Límite máximo de attempts por día? ¿Requiere aprobación supervisor después de N intentos?

---

## RESUMEN EJECUTIVO

**Estado actual:** CashGuard Paradise es una PWA 100% client-side sin backend. Toda la información financiera del corte de caja existe exclusivamente en la memoria volátil del navegador. No hay correlativo, no hay sesión persistente, no hay registro de intentos, no hay auditoría. Un empleado puede reiniciar el proceso indefinidamente hasta obtener un resultado favorable, sin dejar rastro.

**Propuesta:** Introducir un backend (Supabase/PostgreSQL) que actúe como fuente de verdad. Cada corte recibe un correlativo único generado server-side. El estado se guarda progresivamente. Los reintentos se registran con motivo y snapshot. Al reabrir la app, el corte se reanuda o se crea un nuevo intento visible. Un corte finalizado es inmutable. El supervisor puede ver todos los intentos.

**Impacto en UX existente:** Mínimo. El flujo de conteo, verificación ciega, y anti-fraude no cambian. Se agrega: pantalla de reanudación, indicador de intento, advertencia al cerrar, correlativo visible.

**Impacto en seguridad:** Máximo. Se cierra la vulnerabilidad fundamental de bypass por reinicio. La fuente de verdad deja de ser el navegador y pasa a ser el servidor.

---

*Documento generado como propuesta formal. No se ha modificado código. Pendiente aprobación antes de cualquier implementación.*

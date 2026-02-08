# 07 — Política Operativa Offline/Online

**Fecha:** 2026-02-08
**Caso:** Caso_Guia_Arquitectonica_Auditoria_Corte_20260208
**Cubre:** Comportamiento del sistema con y sin conexión a internet, reglas operativas, modo emergencia
**No cubre:** Implementación técnica de cola offline (ver 04), testing (ver 08)

---

## Principio rector

> **Sin servidor, no hay autoridad. Sin autoridad, no hay corte válido.**

Este principio define toda la política offline. Si una operación financiera crítica no puede ser verificada por el servidor, no es válida.

## Definición de estados de conectividad

### Online

- Conexión activa con el backend (Supabase)
- Latencia < 5 segundos en operaciones de lectura/escritura
- El sistema opera con funcionalidad completa

### Offline

- Sin conexión con el backend
- Causas: Wi-Fi caído, servidor no disponible, DNS failure, timeout > 5 segundos
- El sistema opera en modo restringido

### Intermitente

- Conexión inestable con paquetes perdidos
- Operaciones de lectura funcionan, escrituras pueden fallar
- El sistema opera con precaución

## Escenarios operativos

### Escenario A: Sin internet ANTES de iniciar corte

**Situación:** El empleado abre la app para iniciar el corte de caja, pero no hay conexión a internet.

**Comportamiento del sistema:**

```
[Empleado abre app]
       │
[Intentar GET /cortes/activo]
       │
[Timeout 5 segundos]
       │
[Sin respuesta]
       │
[Mostrar pantalla de "Sin conexión"]
       │
[BLOQUEAR inicio de corte]
       │
[Mensaje: "Conexión requerida para iniciar el corte.
           Verifique su conexión a internet e intente nuevamente."]
       │
[Botón: "Reintentar conexión"]
```

**Reglas:**

1. **No se puede iniciar un corte sin conexión.** El correlativo se genera server-side; sin servidor, no hay correlativo.
2. **No se muestra el flujo de conteo.** La pantalla de "sin conexión" es la única vista disponible.
3. **El botón "Reintentar" hace un health check** al backend antes de permitir continuar.
4. **No hay bypass.** Ni PIN supervisor ni modo debug pueden saltar esta restricción.

**Justificación:** Un corte sin correlativo server-side no tiene identidad. No puede ser auditado, no puede ser rastreado, no puede ser verificado. Es como si no existiera.

### Escenario B: Internet se cae DURANTE el corte

**Situación:** El empleado está en medio de un conteo (Phase 1, 2 o 3) y la conexión se pierde.

**Comportamiento del sistema:**

```
[Empleado está contando]
       │
[PATCH /cortes/{id}/progreso falla]
       │
[Retry #1 después de 2 segundos]
       │
[Retry #2 después de 4 segundos]
       │
[Retry #3 después de 8 segundos]
       │
[Retry #4 después de 16 segundos]
       │
[Todos los retries fallaron]
       │
[Banner amarillo: "⚠️ Sin conexión.
 Tu progreso se guardará cuando se restaure la conexión."]
       │
[PERMITIR continuar conteo localmente]
       │
[Encolar operaciones pendientes]
```

**Reglas:**

1. **El conteo NO se bloquea.** El empleado puede seguir contando denominaciones normalmente.
2. **Los datos se guardan localmente** en React state + localStorage como cache.
3. **Se encolan las operaciones fallidas** para reintento automático cuando vuelva la conexión.
4. **Se muestra un banner persistente** indicando estado offline (no intrusivo, no bloquea UI).
5. **El guardado progresivo se reanuda automáticamente** cuando se detecta reconexión.

**Detección de reconexión:**

```
1. Listener en navigator.onLine (evento 'online')
2. Health check al backend: GET /health
3. Si responde 200 → procesar cola de operaciones pendientes
4. Si falla → seguir en modo offline, reintentar en 30 segundos
```

**Cola de operaciones pendientes:**

```
Cola offline = [
  { type: 'PATCH', url: '/cortes/{id}/progreso', body: {...}, timestamp: '...' },
  { type: 'PATCH', url: '/cortes/{id}/progreso', body: {...}, timestamp: '...' },
]

Al reconectar:
1. Procesar cola en orden FIFO (primero en entrar, primero en salir)
2. Cada operación tiene timestamp para resolver conflictos
3. Si conflicto (server tiene datos más recientes) → server gana
4. Si éxito → remover de cola
5. Si fallo persistente → mantener en cola, reintentar
```

### Escenario B2: Bloqueo en finalización sin internet

**Situación:** El empleado completó todo el conteo y quiere finalizar (enviar reporte), pero no hay conexión.

**Comportamiento del sistema:**

```
[Empleado presiona "Enviar Reporte"]
       │
[POST /cortes/{id}/finalizar falla]
       │
[Mostrar modal: "⚠️ Conexión requerida para finalizar"]
       │
[Mensaje: "Tu conteo está guardado localmente.
           La finalización requiere conexión al servidor
           para generar la firma digital del reporte."]
       │
[Opciones:
  - "Reintentar conexión" (health check + retry)
  - "Guardar y finalizar después" (mantener en cola)]
       │
[NO se puede marcar como FINALIZADO sin servidor]
```

**Reglas:**

1. **La finalización SIEMPRE requiere conexión.** El hash del reporte se genera server-side.
2. **Los datos del conteo están a salvo** (guardados en state + localStorage).
3. **Al reconectar:** El sistema automáticamente intenta finalizar con los datos locales.
4. **No hay firma digital offline.** Sin servidor, el reporte no tiene hash verificable.

### Escenario C: Empleado intenta bypass sin internet

**Situación:** El empleado conoce la vulnerabilidad actual (refresh = reinicio) e intenta explotarla en un entorno con backend.

**Comportamiento del sistema con backend:**

```
[Empleado hace refresh/cierra pestaña]
       │
[App se reinicia]
       │
[GET /cortes/activo]
       │
[Servidor retorna corte existente con datos parciales]
       │
[Pantalla de reanudación:]
"Tu corte CORTE-2026-02-08-H-001 está en Phase 2.
 ¿Deseas continuar donde lo dejaste?"
       │
[Opciones:
  - "Continuar" → Restaurar estado desde servidor
  - "Nuevo intento" → Registrar intento como ABANDONADO (motivo obligatorio)]
```

**Reglas:**

1. **Refresh NO destruye el corte.** El servidor mantiene el estado.
2. **El correlativo no cambia.** Mismo corte, mismos datos, misma identidad.
3. **Si elige "Nuevo intento":** Se registra el intento anterior como ABANDONADO con motivo.
4. **El supervisor ve todo.** Cada intento queda registrado permanentemente.
5. **No hay forma de "desaparecer" un corte iniciado.** Una vez creado, existe para siempre.

**Sin internet + intento de bypass:**

```
[Empleado hace refresh sin internet]
       │
[GET /cortes/activo falla]
       │
[Verificar localStorage: ¿existe corte_id activo?]
       │
[SI existe:]
"Tu último corte puede tener datos pendientes.
 Conexión requerida para verificar el estado."
[Botón: "Reintentar conexión"]
       │
[NO existe:]
[Pantalla "Sin conexión" del Escenario A]
```

## Modo emergencia offline (opcional — Fase futura)

### Definición

Un modo excepcional que permite realizar un corte SIN conexión a internet, bajo condiciones estrictas de supervisión.

### Activación

- Requiere PIN de supervisor
- Solo disponible si la sucursal ha estado offline > 30 minutos
- Genera correlativo local temporal: `CORTE-{fecha}-{sucursal}-OFFLINE-{timestamp}`
- Registra motivo del modo emergencia obligatoriamente

### Restricciones del modo emergencia

1. **Correlativo temporal:** Se reemplaza por correlativo definitivo al sincronizar
2. **Sin firma digital:** Reporte se marca como "Pendiente de validación server"
3. **Sincronización obligatoria:** Al reconectar, datos se envían al servidor
4. **Conflicto resolution:** Si ya existe un corte server-side para esa fecha, el supervisor debe resolver manualmente
5. **Audit trail reforzado:** Se registra: quién activó, cuándo, motivo, duración offline

### Flujo modo emergencia

```
[Supervisor ingresa PIN]
       │
[Modal: "⚠️ MODO EMERGENCIA OFFLINE"]
       │
[Mensaje: "Este corte se realizará sin conexión al servidor.
           Los datos se sincronizarán cuando se restaure la conexión.
           ¿Desea continuar?"]
       │
[Ingresar motivo: "________________"]
       │
[Iniciar corte con correlativo temporal]
       │
[Flujo normal Phase 1 → Phase 2 → Phase 3]
       │
[Reporte se genera localmente SIN firma digital]
       │
[Banner permanente: "🔴 MODO OFFLINE — Pendiente sincronización"]
       │
[Al reconectar:]
  1. Enviar datos completos al servidor
  2. Servidor valida y asigna correlativo definitivo
  3. Generar firma digital real
  4. Marcar como sincronizado
  5. Notificar al supervisor que la sincronización fue exitosa
```

### Decisión sobre implementación

El modo emergencia offline es **opcional y de fase futura**. La primera implementación del sistema de auditoría debe funcionar exclusivamente con conectividad. Razones:

1. **Complejidad:** Sync offline→online introduce conflictos difíciles de resolver
2. **Volumen:** Las sucursales Paradise tienen internet estable (< 1% downtime)
3. **Prioridad:** Resolver la vulnerabilidad de bypass es más urgente
4. **Riesgo:** Modo offline mal implementado podría crear más problemas que los que resuelve

## Indicadores de estado de conexión en la UI

### Banner de conectividad

| Estado | Color | Icono | Mensaje | Posición |
|--------|-------|-------|---------|----------|
| Online | Verde | ✅ | (No se muestra) | — |
| Offline | Amarillo | ⚠️ | "Sin conexión — progreso guardado localmente" | Top bar fijo |
| Reconectando | Azul | 🔄 | "Reconectando..." | Top bar fijo |
| Error sync | Rojo | ❌ | "Error de sincronización — reintentando" | Top bar fijo |

### Implementación técnica del detector

```
1. navigator.onLine → Estado inicial
2. window.addEventListener('online', handler)
3. window.addEventListener('offline', handler)
4. Health check periódico cada 30 segundos (solo si offline)
5. Exponential backoff en reintentos: 2s, 4s, 8s, 16s, 30s (cap)
```

## Matriz de decisión por operación

| Operación | Online | Offline | Justificación |
|-----------|--------|---------|---------------|
| Consultar corte activo | ✅ Permitido | ❌ Bloqueado | Requiere dato real del servidor |
| Iniciar corte nuevo | ✅ Permitido | ❌ Bloqueado | Correlativo es server-side |
| Contar denominaciones | ✅ Permitido | ✅ Permitido | Operación local, datos en cache |
| Guardar progreso | ✅ Inmediato | ⏳ Encolado | Se envía al reconectar |
| Verificación ciega | ✅ Permitido | ✅ Permitido | Operación local pura |
| Generar reporte | ✅ Permitido | ⚠️ Sin firma | Hash requiere servidor |
| Finalizar corte | ✅ Permitido | ❌ Bloqueado | Inmutabilidad requiere servidor |
| Enviar WhatsApp | ✅ Permitido | ❌ Bloqueado | Requiere internet |
| Nuevo intento | ✅ Permitido | ❌ Bloqueado | INSERT server-side |

## Principios obligatorios

- Backend como fuente de verdad
- No monolitos, no archivos gigantes
- No lógica crítica solo en frontend
- No estado crítico no persistente
- Cobertura mínima de tests: 70%
- Compatibilidad CI/CD obligatoria

---

**Siguiente:** → Ver `08_Testing_CICD.md`

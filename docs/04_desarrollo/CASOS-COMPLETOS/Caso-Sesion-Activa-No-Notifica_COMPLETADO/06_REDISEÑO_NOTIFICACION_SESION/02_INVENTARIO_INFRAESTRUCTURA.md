# 02 — Inventario de Infraestructura Existente: Abort/Resume/Restart

**Caso:** CASO-SANN-R2 — Rediseño de Notificación de Sesión Activa
**Fase DIRM:** Investigación Arquitectónica (CERO CÓDIGO)
**Fecha:** 2026-02-18
**Estado:** ✅ Completado

---

## Resumen

El hook `useCorteSesion.ts` YA tiene implementada toda la infraestructura backend necesaria para abortar, reanudar y reiniciar sesiones de corte. **NINGUNA de estas funciones tiene botones o UI asociada actualmente.** El sistema solo usa reanudación automática vía el banner informativo.

---

## Archivo Fuente

**Ruta:** `src/hooks/useCorteSesion.ts`
**Tamaño:** ~600 líneas
**Estado:** Producción activa (usado por `Index.tsx`)

---

## Funciones Disponibles (Sin UI)

### 1. `abortarCorte(motivo: string)` — Líneas 344-403

**Propósito:** Marca la sesión activa como ABORTADO en Supabase.

**Qué hace:**
1. Valida que exista `corteActual` (sesión activa)
2. Actualiza el corte en Supabase: `estado = 'ABORTADO'`, `motivo_aborto = motivo`
3. Marca el intento activo como `ABANDONADO` con snapshot de datos parciales
4. Limpia el estado local (`corteActual = null`, `intentoActual = null`)

**Parámetros:**
- `motivo: string` — Razón del aborto (ej: "Usuario decidió cancelar", "Sesión duplicada detectada")

**Retorno:** `Promise<void>` — Throw error si falla

**Estado actual:** ✅ Implementada, ❌ Sin botón UI

---

### 2. `recuperarSesion()` — Líneas 502-552

**Propósito:** Busca y recupera una sesión activa de Supabase.

**Qué hace:**
1. Consulta Supabase: cortes con `estado IN ('INICIADO', 'EN_PROGRESO')`
2. Ordena por `created_at DESC`, toma el más reciente (`limit(1)`)
3. Si encuentra sesión: restaura `corteActual` y `intentoActual` en estado local
4. Si NO encuentra: no hace nada (estado limpio)

**Parámetros:** Ninguno

**Retorno:** `Promise<void>`

**Estado actual:** ✅ Implementada, ✅ Se llama automáticamente en `useEffect` al montar (líneas 558-565)

---

### 3. `reiniciarIntento(motivo: string)` — Líneas 409-496

**Propósito:** Crea un nuevo intento para la sesión existente sin abortar el corte.

**Qué hace:**
1. Valida que exista `corteActual`
2. Marca el intento actual como `ABANDONADO` con snapshot
3. Crea un NUEVO intento con `numero_intento` incrementado
4. Resetea `fase_actual = 0` (empieza desde el inicio del wizard)
5. Limpia datos intermedios del intento anterior

**Parámetros:**
- `motivo: string` — Razón del reinicio (ej: "Datos incorrectos", "Cambio de cajero")

**Retorno:** `Promise<void>`

**Estado actual:** ✅ Implementada, ❌ Sin botón UI

---

## Estado Local del Hook

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `corteActual` | `CorteNocturno \| null` | Sesión de corte activa (o null) |
| `intentoActual` | `CorteIntento \| null` | Intento activo dentro del corte |
| `cargando` | `boolean` | Flag de operación en curso |
| `error` | `string \| null` | Mensaje de error (si existe) |

---

## Máquina de Estados (Supabase)

### Corte Nocturno
```
INICIADO ──→ EN_PROGRESO ──→ FINALIZADO
    │              │
    └──────────────┴──→ ABORTADO
```

### Intento de Corte
```
ACTIVO ──→ COMPLETADO
   │
   └──→ ABANDONADO
```

---

## Auto-Recuperación Actual (useEffect)

```
Mount del hook
    ↓
useEffect detecta sucursal_id disponible
    ↓
Llama recuperarSesion()
    ↓
Si hay sesión activa → restaura estado local
    ↓
Index.tsx detecta hasActiveSession=true
    ↓
Pasa props al wizard → banner informativo aparece
    ↓
Reanudación AUTOMÁTICA (sin intervención usuario)
```

**Problema:** El usuario NO tiene opción de decidir. La reanudación es forzada.

---

## Mapping Función → Acción UI Propuesta

| Función Backend | Acción UI que necesita | Contexto |
|-----------------|----------------------|----------|
| `recuperarSesion()` | Botón "Reanudar Sesión" | Usuario quiere continuar donde dejó |
| `abortarCorte(motivo)` | Botón "Abortar Sesión" | Usuario quiere descartar y empezar limpio |
| `reiniciarIntento(motivo)` | Botón "Reiniciar Intento" (opcional) | Usuario quiere empezar de cero sin abortar |

---

## Hallazgo Clave

> **CERO de las 3 funciones (abort/resume/restart) tiene UI asociada.**
> El sistema SOLO usa reanudación automática vía banner.
> La infraestructura backend está COMPLETA y LISTA para conectar con botones UI.
> NO se requiere trabajo backend — solo trabajo de UI/UX.

---

## Referencias

- `src/hooks/useCorteSesion.ts` — Código fuente completo
- `src/types/auditoria.ts` — Tipos `EstadoCorte`, `EstadoIntento`
- `src/pages/Index.tsx` — Función `detectActiveCashCutSession()`

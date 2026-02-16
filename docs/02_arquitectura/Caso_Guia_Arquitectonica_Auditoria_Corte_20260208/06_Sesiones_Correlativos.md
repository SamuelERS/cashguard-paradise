# 06 — Manejo de Sesiones, Correlativos y Persistencia

**Fecha:** 2026-02-08
**Caso:** Caso_Guia_Arquitectonica_Auditoria_Corte_20260208
**Cubre:** Generación de correlativos, manejo de sesión de corte, guardado progresivo, recovery
**No cubre:** Política offline (ver 07), testing (ver 08)

---

## Correlativo único

### Formato

```
CORTE-{YYYY-MM-DD}-{CODIGO_SUCURSAL}-{SECUENCIAL}
```

### Ejemplos

- `CORTE-2026-02-08-H-001` — Primer corte del día en Los Héroes
- `CORTE-2026-02-08-H-001-A2` — Segundo intento del mismo corte
- `CORTE-2026-02-08-M-001` — Primer corte en Plaza Merliot

### Reglas

1. **Generado server-side:** El cliente no genera ni sugiere el correlativo
2. **Unique global:** Constraint `UNIQUE` en la tabla `cortes`
3. **No reutilizable:** Un correlativo asignado jamás se reasigna, ni siquiera si el corte se aborta
4. **Secuencial por día:** `001` es el primer corte de esa sucursal en esa fecha; `002` solo si se permite más de uno (excepción supervisor)
5. **Sufijo de intento:** Los intentos adicionales se identifican con `-A2`, `-A3`, etc. dentro del mismo correlativo base

### Generación (pseudocódigo server-side)

```
1. Recibir: sucursal_id, fecha
2. Buscar: ¿existe corte para (sucursal_id, fecha)?
3. Si no existe:
   - secuencial = 001
   - correlativo = "CORTE-{fecha}-{codigo_sucursal}-{secuencial}"
   - INSERT corte
4. Si existe y estado = FINALIZADO:
   - Rechazar (solo un corte finalizado por día)
   - Excepción: PIN supervisor → secuencial++
5. Si existe y estado = INICIADO/EN_PROGRESO:
   - Retornar corte existente (para reanudación)
```

## Sesión de corte

### Inicio del corte

```
Cliente                              Servidor
  │                                     │
  │  GET /cortes/activo                 │
  │  ?sucursal=heroes&fecha=2026-02-08  │
  │────────────────────────────────────►│
  │                                     │
  │  Caso A: No hay corte activo        │
  │◄────────────────────────────────────│  { corte: null }
  │                                     │
  │  POST /cortes/iniciar               │
  │  { sucursal_id, cajero, testigo }   │
  │────────────────────────────────────►│
  │                                     │  Genera correlativo
  │                                     │  INSERT corte + intento #1
  │◄────────────────────────────────────│  { id, correlativo, estado: INICIADO }
  │                                     │
  │  Caso B: Corte activo existe        │
  │◄────────────────────────────────────│  { corte: { id, correlativo, estado, fase, datos } }
  │                                     │
  │  → Mostrar pantalla de reanudación  │
```

### Guardado progresivo

El cliente envía actualizaciones al servidor en momentos clave:

| Momento | Datos enviados | Campo actualizado |
|---------|---------------|-------------------|
| Phase 1 completa | Denominaciones contadas, totales | `conteo_efectivo`, `fase_actual=1` |
| Phase 2 delivery completa | Datos de entrega, montos | `entrega_gerencia`, `fase_actual=2` |
| Phase 2 verificación completa | VerificationBehavior | `verificacion_ciega` |
| Phase 3 reporte generado | Total general, diferencia | `total_general`, `diferencia`, `venta_esperada` |
| Reporte WhatsApp enviado | Hash del reporte | `reporte_hash`, `reporte_enviado=true`, estado→FINALIZADO |

**Implementación:** Cada guardado es un `PATCH /cortes/{id}/progreso` no-bloqueante. La UI no espera la respuesta para continuar (optimistic update). Si falla, se reintenta con exponential backoff.

### Recovery tras cierre/refresh

```
1. App se abre (o F5)
2. useCorteSesion ejecuta GET /cortes/activo
3. Servidor retorna corte con datos parciales
4. Cliente reconstruye estado:
   - fase_actual = 2 → saltar Phase 1, mostrar Phase 2
   - conteo_efectivo = {...} → restaurar conteos
   - verificacion_ciega = null → iniciar verificación
5. Mostrar: "Tu corte está en Phase 2 — ¿Deseas continuar?"
```

### Nuevo intento (reinicio explícito)

Cuando el usuario elige "Nuevo intento" en lugar de reanudar:

```
1. POST /cortes/{id}/intentos { motivo: "Error de conteo" }
2. Servidor:
   - Marca intento anterior como ABANDONADO
   - Crea nuevo CorteIntento con attempt_number++
   - Actualiza corte.attempt_actual
3. Cliente:
   - Muestra "Este es tu intento #2"
   - Limpia estado local
   - Reinicia desde Phase 1
```

## Persistencia local (cache)

Además del backend, el cliente mantiene un cache local para performance:

| Storage | Qué guarda | Propósito |
|---------|-----------|-----------|
| React state | Datos de la sesión activa | Rendering y UX |
| localStorage | `corte_id` activo | Recovery rápido sin esperar GET |
| IndexedDB (opcional) | Cola de operaciones pendientes | Sync offline |

**Regla crítica:** localStorage y IndexedDB son **cache**, no fuente de verdad. Si hay conflicto entre local y servidor, el servidor gana.

## Flujo completo (diagrama secuencial)

```
[Empleado abre app]
       │
[GET /cortes/activo]────────► ¿Hay corte activo?
       │                           │
       │                    ┌──────┴──────┐
       │                    │             │
       │                   NO            SÍ
       │                    │             │
       │              [Iniciar nuevo]  [Reanudación]
       │              POST /iniciar    ¿Reanudar?
       │                    │         ┌───┴───┐
       │                    │        SÍ      NO
       │                    │         │    [Nuevo intento]
       │                    │         │    POST /intentos
       │                    │         │       │
       │              ┌─────┴─────────┴───────┘
       │              │
       │        [Conteo Phase 1]
       │              │
       │        [PATCH progreso]───────► Server guarda
       │              │
       │        [Phase 2 delivery]
       │              │
       │        [PATCH progreso]───────► Server guarda
       │              │
       │        [Phase 2 verificación]
       │              │
       │        [PATCH progreso]───────► Server guarda
       │              │
       │        [Phase 3 reporte]
       │              │
       │        [POST finalizar]───────► Server marca FINALIZADO
       │              │                  Inmutable desde aquí
       │        [Reporte WhatsApp]
       │              │
       │           [FIN]
```

## Principios obligatorios

- Backend como fuente de verdad
- No monolitos, no archivos gigantes
- No lógica crítica solo en frontend
- No estado crítico no persistente
- Cobertura mínima de tests: 70%
- Compatibilidad CI/CD obligatoria

---

**Siguiente:** → Ver `07_Politica_Offline.md`

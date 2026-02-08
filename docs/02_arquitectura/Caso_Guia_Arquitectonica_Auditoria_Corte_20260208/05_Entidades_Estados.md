# 05 — Entidades y Estados Conceptuales

**Fecha:** 2026-02-08
**Caso:** Caso_Guia_Arquitectonica_Auditoria_Corte_20260208
**Cubre:** Modelo de datos conceptual, máquina de estados, reglas de transición
**No cubre:** Schema SQL final, implementación de endpoints

---

## Entidades del sistema

### Entidad: Sucursal

```
Sucursal {
  id            string    PK       -- "heroes", "merliot", etc.
  nombre        string             -- "Los Héroes", "Plaza Merliot"
  codigo        string    UNIQUE   -- Código corto para correlativo ("H", "M")
  activa        boolean            -- Si la sucursal está operativa
  created_at    timestamp
}
```

**Nota:** Se define como catálogo. El volumen esperado es < 10 sucursales.

### Entidad: Corte

El corte es el evento financiero principal. Representa "el conteo del día" para una sucursal.

```
Corte {
  id                  UUID        PK      -- Generado server-side
  correlativo         string      UNIQUE  -- "CORTE-2026-02-08-H-001"
  sucursal_id         string      FK      -- Referencia a Sucursal
  fecha               date                -- Solo fecha (sin hora)
  estado              enum                -- INICIADO | EN_PROGRESO | FINALIZADO | ABORTADO
  cajero_nombre       string              -- Nombre del cajero
  testigo_nombre      string              -- Nombre del testigo
  attempt_actual      integer             -- Número de intento actual (1, 2, 3...)
  fase_actual         integer             -- Fase alcanzada (1, 2, 3)

  -- Datos financieros (JSON, se llenan progresivamente)
  conteo_efectivo     JSONB | null        -- Denominaciones + totales
  pagos_electronicos  JSONB | null        -- Credomatic, promerica, etc.
  entrega_gerencia    JSONB | null        -- Delivery calculation
  verificacion_ciega  JSONB | null        -- VerificationBehavior completo
  total_general       decimal | null
  venta_esperada      decimal | null
  diferencia          decimal | null

  -- Metadatos de auditoría
  reporte_enviado     boolean     DEFAULT false
  reporte_hash        string | null       -- SHA-256 del contenido del reporte
  ip_cliente          string | null
  user_agent          string | null

  -- Timestamps
  created_at          timestamp           -- Momento de inicio
  updated_at          timestamp           -- Última actualización
  finalizado_at       timestamp | null    -- Momento de finalización
}
```

**Constraints:**
- `UNIQUE(sucursal_id, fecha)` cuando estado = FINALIZADO — solo un corte finalizado por día
- `correlativo` es UNIQUE global

### Entidad: CorteIntento

Registra cada attempt (incluyendo abandonados) como evidencia de auditoría.

```
CorteIntento {
  id                  UUID        PK
  corte_id            UUID        FK      -- Referencia a Corte
  attempt_number      integer             -- 1, 2, 3...
  motivo_reinicio     string | null       -- Obligatorio si attempt > 1
  estado              enum                -- INICIADO | COMPLETADO | ABANDONADO
  fase_alcanzada      integer             -- Hasta qué fase llegó
  datos_snapshot      JSONB | null        -- Foto del estado al abandonar
  ip_cliente          string | null
  created_at          timestamp
  abandoned_at        timestamp | null
}
```

## Máquina de estados del Corte

```
                      ┌───────────┐
          Crear       │           │
      ───────────────►│ INICIADO  │
                      │           │
                      └─────┬─────┘
                            │
                     Guardar progreso
                     (Phase 1 completada)
                            │
                      ┌─────▼─────┐
                      │           │
                      │EN_PROGRESO│◄──── Reanudación
                      │           │
                      └──┬────┬───┘
                         │    │
                Finalizar│    │Abortar
                         │    │
                   ┌─────▼┐  ┌▼────────┐
                   │FINAL │  │ABORTADO │
                   │      │  │         │
                   └──────┘  └─────────┘
```

### Reglas de transición

| Desde | Hacia | Condición | Acción |
|-------|-------|-----------|--------|
| (nuevo) | INICIADO | `POST /cortes/iniciar` + no existe corte FINALIZADO para ese día | Generar correlativo, registrar Attempt #1 |
| INICIADO | EN_PROGRESO | Phase 1 completada → `PATCH /cortes/{id}/progreso` | Guardar conteo_efectivo, fase_actual=1 |
| EN_PROGRESO | EN_PROGRESO | Cualquier fase completada → `PATCH /cortes/{id}/progreso` | Actualizar datos parciales |
| EN_PROGRESO | FINALIZADO | Reporte enviado → `POST /cortes/{id}/finalizar` | Guardar hash, marcar reporte_enviado, inmutable |
| EN_PROGRESO | ABORTADO | Nuevo intento creado, o abort explícito | Registrar motivo, snapshot del estado |
| FINALIZADO | — | **Inmutable** (excepto supervisor con PIN) | — |
| ABORTADO | — | **Inmutable** (queda como evidencia) | — |

### Estados del CorteIntento

| Estado | Significado |
|--------|------------|
| INICIADO | Attempt en curso, usuario está contando |
| COMPLETADO | Attempt llegó a Phase 3 y envió reporte |
| ABANDONADO | Attempt interrumpido (cierre, refresh, nuevo intento) |

## Reglas de negocio del modelo

### R1. Un corte por día por sucursal

- Constraint: No se puede crear un corte si ya existe uno con estado FINALIZADO para la misma `sucursal_id + fecha`
- Excepción: Un supervisor puede "reabrir" (crear nuevo corte con referencia al anterior)

### R2. Intentos son acumulativos

- Cada vez que el usuario reinicia, se crea un nuevo CorteIntento
- El intento previo pasa a estado ABANDONADO
- El campo `attempt_actual` del Corte se incrementa
- No hay límite hard-coded de intentos (pero el supervisor ve todos)

### R3. Datos parciales son válidos

- Un corte EN_PROGRESO puede tener `conteo_efectivo` lleno pero `verificacion_ciega` null
- Esto permite guardado progresivo y recovery
- Solo FINALIZADO requiere todos los campos críticos llenos

### R4. El hash asegura integridad

- Al finalizar, se genera SHA-256 del contenido del reporte
- Este hash se almacena en el corte
- Permite verificar que el reporte WhatsApp corresponde al corte registrado

## Principios obligatorios

- Backend como fuente de verdad
- No monolitos, no archivos gigantes
- No lógica crítica solo en frontend
- No estado crítico no persistente
- Cobertura mínima de tests: 70%
- Compatibilidad CI/CD obligatoria

---

**Siguiente:** → Ver `06_Sesiones_Correlativos.md`

# 04 — Arquitectura Propuesta (Alto Nivel)

**Fecha:** 2026-02-08
**Caso:** Caso_Guia_Arquitectonica_Auditoria_Corte_20260208
**Cubre:** Visión de arquitectura objetivo, capas, componentes nuevos
**No cubre:** Código, endpoints exactos, schema SQL final

---

## Diagrama de capas

```
┌──────────────────────────────────────────────────┐
│               CAPA DE PRESENTACIÓN                │
│  (React + TypeScript — SIN CAMBIOS al UX actual)  │
│  CashCounter, GuidedFieldView, CashCalculation    │
└──────────────┬───────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────┐
│          CAPA DE LÓGICA LOCAL (existente)          │
│  usePhaseManager, useGuidedCounting,               │
│  useCashCounterOrchestrator, useBlindVerification  │
└──────────────┬───────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────┐
│      CAPA DE SINCRONIZACIÓN (NUEVA)               │
│  useCorteSesion — hook que encapsula:              │
│  - Consulta de corte activo                        │
│  - Guardado progresivo                             │
│  - Gestión de intentos                             │
│  - Recovery tras cierre/refresh                    │
│  - Cola offline (si aplica)                        │
└──────────────┬───────────────────────────────────┘
               │ HTTPS
┌──────────────▼───────────────────────────────────┐
│            CAPA DE BACKEND (NUEVA)                 │
│  Supabase (PostgreSQL + Auth + RLS)                │
│  - Tablas: cortes, corte_intentos, sucursales      │
│  - Row Level Security por sucursal                 │
│  - Constraints UNIQUE para correlativos            │
│  - Triggers para timestamps automáticos            │
└──────────────────────────────────────────────────┘
```

## Componentes nuevos

### 1. Hook `useCorteSesion`

**Ubicación propuesta:** `src/hooks/useCorteSesion.ts`

**Responsabilidades:**
- Al montar: consultar si hay corte activo para la sucursal/fecha actual
- Retornar estado del corte: `null | INICIADO | EN_PROGRESO | FINALIZADO | ABORTADO`
- Proveer funciones: `iniciarCorte()`, `guardarProgreso()`, `finalizarCorte()`, `registrarIntento()`
- Manejar reconexión y recovery de estado

**No es responsable de:**
- La lógica del conteo (eso sigue en useGuidedCounting)
- La UI (eso sigue en los componentes React)
- La verificación ciega (eso sigue en useBlindVerification)

### 2. Cliente Supabase

**Ubicación propuesta:** `src/lib/supabase.ts`

**Responsabilidades:**
- Inicializar cliente Supabase con variables de entorno
- Exportar cliente tipado para uso en hooks
- Manejar auth si se implementa (fase futura)

### 3. Tipos del dominio de auditoría

**Ubicación propuesta:** `src/types/auditoria.ts`

**Responsabilidades:**
- Interfaces TypeScript para Corte, CorteIntento, EstadoCorte
- Type guards para validación runtime
- Enums para estados y motivos de reinicio

### 4. Componente de reanudación

**Ubicación propuesta:** `src/components/corte/CorteReanudacion.tsx`

**Responsabilidades:**
- Pantalla que aparece cuando existe un corte activo al abrir la app
- Opciones: Reanudar / Nuevo intento (con motivo obligatorio)
- Mostrar info del corte previo (correlativo, fase alcanzada, timestamp)

## Componentes existentes afectados

| Componente | Cambio |
|-----------|--------|
| `CashCounter.tsx` | Integrar `useCorteSesion`. Guardar progreso al cambiar de fase. |
| `CashCalculation.tsx` | Enviar datos finales al backend al finalizar. Reemplazar `reportSent` local por confirmación server. |
| `Index.tsx` / `OperationSelector.tsx` | Consultar corte activo antes de permitir iniciar. Mostrar pantalla de reanudación si existe. |
| `usePhaseManager.ts` | Recibir estado inicial desde backend (para recovery). |

## Componentes que NO cambian

- `GuidedFieldView.tsx` — UI de conteo (sigue igual)
- `Phase2DeliverySection.tsx` — Instrucciones de entrega (sigue igual)
- `Phase2VerificationSection.tsx` — Verificación ciega (sigue igual)
- `useGuidedCounting.ts` — Lógica de navegación entre denominaciones
- `useBlindVerification.ts` — Lógica de 3 intentos
- Todos los tests matemáticos (174 tests, TIER 0-4)

## Backend: Supabase

**Justificación de elección:**
1. Variables de entorno ya configuradas en `.env.example`
2. PostgreSQL relacional con ACID y constraints
3. Auth integrado (JWT) para fase futura
4. Row Level Security por sucursal
5. SDK TypeScript oficial — integración directa al frontend
6. Tier gratuito suficiente para el volumen operativo
7. No requiere mantener servidor propio

**Tablas principales:**
- `sucursales` — Catálogo de sucursales
- `cortes` — Evento principal del corte de caja
- `corte_intentos` — Registro de cada attempt

→ Detalle del modelo en `05_Entidades_Estados.md`

## Principios obligatorios

- Backend como fuente de verdad
- No monolitos, no archivos gigantes
- No lógica crítica solo en frontend
- No estado crítico no persistente
- Cobertura mínima de tests: 70%
- Compatibilidad CI/CD obligatoria

---

**Siguiente:** → Ver `05_Entidades_Estados.md`

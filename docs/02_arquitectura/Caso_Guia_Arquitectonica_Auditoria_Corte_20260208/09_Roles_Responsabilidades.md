# 09 — Roles de Agentes y Responsabilidades por Capa

**Fecha:** 2026-02-08
**Caso:** Caso_Guia_Arquitectonica_Auditoria_Corte_20260208
**Cubre:** Quién hace qué, separación de responsabilidades frontend/backend, límites de cada capa
**No cubre:** Implementación técnica, configuración de herramientas

---

## Principio de separación

> **Cada capa tiene un dueño. Cada dueño tiene límites. Nadie cruza los límites del otro.**

La arquitectura propuesta tiene 4 capas claramente definidas. Cada una tiene responsabilidades exclusivas que no deben mezclarse.

## Mapa de capas y responsables

```
┌────────────────────────────────────────────────┐
│  CAPA 1: PRESENTACIÓN                          │
│  Responsable: Componentes React                │
│  Límite: Solo renderizar, no decidir           │
└────────────────┬───────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────┐
│  CAPA 2: LÓGICA LOCAL                          │
│  Responsable: Hooks React                      │
│  Límite: Lógica de UX, no de negocio crítico   │
└────────────────┬───────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────┐
│  CAPA 3: SINCRONIZACIÓN                        │
│  Responsable: Hook useCorteSesion              │
│  Límite: Comunicar, no almacenar verdad        │
└────────────────┬───────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────┐
│  CAPA 4: BACKEND                               │
│  Responsable: Supabase (PostgreSQL + RLS)      │
│  Límite: Almacenar y validar, no renderizar    │
└────────────────────────────────────────────────┘
```

## Capa 1: Presentación

### Responsable

Componentes React existentes + nuevos componentes de auditoría.

### Responsabilidades

| Debe hacer | No debe hacer |
|------------|---------------|
| Renderizar datos recibidos por props | Calcular totales financieros |
| Capturar input del usuario | Validar reglas de negocio |
| Mostrar estados visuales (loading, error, success) | Decidir si un corte puede iniciar |
| Navegación entre vistas | Generar correlativos |
| Animaciones y transiciones | Comunicarse directamente con backend |
| Mostrar banner de conectividad | Almacenar datos financieros críticos |

### Componentes clave

| Componente | Responsabilidad específica |
|-----------|---------------------------|
| `CashCounter.tsx` | Orquestar fases, recibir datos de `useCorteSesion` |
| `GuidedFieldView.tsx` | Capturar conteo por denominación (sin cambios) |
| `Phase2VerificationSection.tsx` | Verificación ciega (sin cambios) |
| `CashCalculation.tsx` | Mostrar resultados, enviar reporte |
| `CorteReanudacion.tsx` (nuevo) | Pantalla de reanudación/nuevo intento |
| `CorteStatusBanner.tsx` (nuevo) | Banner de conectividad y estado del corte |

### Regla de oro

> Los componentes React son **canales de captura y visualización**, no custodios de información.

## Capa 2: Lógica local

### Responsable

Hooks React existentes que manejan la lógica de UX del flujo de conteo.

### Responsabilidades

| Debe hacer | No debe hacer |
|------------|---------------|
| Manejar navegación entre denominaciones | Persistir datos al backend |
| Calcular totales locales (para display) | Generar correlativos |
| Validar inputs (formato, rango) | Decidir si el corte es válido |
| Manejar fases (Phase 1 → 2 → 3) | Registrar intentos de auditoría |
| Verificación ciega (3 intentos) | Comunicarse con servidor |
| Timing y animaciones | Almacenar estado crítico |

### Hooks clave

| Hook | Responsabilidad específica | Cambio requerido |
|------|---------------------------|-----------------|
| `usePhaseManager.ts` | Máquina de estados de fases | Recibir estado inicial desde backend |
| `useGuidedCounting.ts` | Navegación entre denominaciones | Sin cambios |
| `useCashCounterOrchestrator.ts` | Orquestación del flujo | Sin cambios |
| `useBlindVerification.ts` | Lógica de 3 intentos | Sin cambios |

### Regla de oro

> Los hooks locales son **cerebros de UX**, no cerebros de negocio. La UX se ejecuta localmente; las decisiones de negocio se validan en el servidor.

## Capa 3: Sincronización

### Responsable

Hook `useCorteSesion` (nuevo) — el puente entre frontend y backend.

### Responsabilidades

| Debe hacer | No debe hacer |
|------------|---------------|
| Consultar corte activo al montar | Renderizar UI |
| Enviar guardado progresivo (PATCH) | Calcular totales |
| Gestionar intentos (crear, abandonar) | Manejar navegación entre denominaciones |
| Detectar estado offline/online | Ejecutar verificación ciega |
| Encolar operaciones pendientes | Decidir qué denominaciones contar |
| Manejar retry con exponential backoff | Mostrar animaciones |
| Proveer funciones a componentes | Almacenar verdad (es intermediario) |
| Recovery tras cierre/refresh | Generar correlativos (eso es server-side) |

### Interface pública del hook

```typescript
interface UseCorteSesionReturn {
  // Estado
  corteActivo: Corte | null;
  estado: EstadoCorte | null;
  isLoading: boolean;
  isOnline: boolean;
  error: string | null;

  // Acciones
  iniciarCorte: (params: IniciarCorteParams) => Promise<Corte>;
  guardarProgreso: (datos: DatosProgreso) => Promise<void>;
  finalizarCorte: (reporteHash: string) => Promise<void>;
  registrarIntento: (motivo: string) => Promise<CorteIntento>;

  // Recovery
  reanudarCorte: () => void;
  descartarYNuevoIntento: (motivo: string) => Promise<void>;
}
```

### Regla de oro

> `useCorteSesion` es el **único punto de contacto** entre el frontend y el backend. Ningún otro hook o componente debe hacer llamadas HTTP directas.

## Capa 4: Backend

### Responsable

Supabase (PostgreSQL + Auth + Row Level Security).

### Responsabilidades

| Debe hacer | No debe hacer |
|------------|---------------|
| Generar correlativos únicos | Renderizar UI |
| Validar unicidad (UNIQUE constraints) | Calcular layouts |
| Registrar inicio/finalización con timestamp | Manejar estado de React |
| Almacenar datos financieros (JSONB) | Ejecutar lógica del flujo de conteo |
| Aplicar Row Level Security por sucursal | Decidir animaciones |
| Generar hash de reporte (SHA-256) | Interactuar con usuario |
| Registrar IP + User-Agent | Manejar eventos de teclado |
| Triggers automáticos (timestamps) | Generar reportes WhatsApp |
| Prevenir estados inconsistentes | Gestionar localStorage |

### Tablas y su responsable

| Tabla | Responsabilidad | Constraints clave |
|-------|----------------|-------------------|
| `sucursales` | Catálogo de sucursales | `codigo` UNIQUE |
| `cortes` | Evento principal de auditoría | `correlativo` UNIQUE, `(sucursal_id, fecha)` conditional UNIQUE |
| `corte_intentos` | Registro de cada intento | FK a `cortes`, `attempt_number` incremental |

### Regla de oro

> El backend es la **fuente de verdad**. Si hay conflicto entre datos locales y datos del servidor, el servidor gana. Siempre.

## Flujo de responsabilidad en acción

### Ejemplo: Iniciar un corte

```
Capa 1 (Presentación):
  - Usuario presiona "Iniciar Corte"
  - Componente llama iniciarCorte() del hook

Capa 2 (Lógica local):
  - (No participa en esta acción)

Capa 3 (Sincronización):
  - useCorteSesion.iniciarCorte() ejecuta
  - Envía POST /cortes/iniciar al servidor
  - Recibe correlativo y estado INICIADO

Capa 4 (Backend):
  - Verifica: ¿existe corte FINALIZADO para sucursal+fecha?
  - Si no: Genera correlativo, INSERT corte, INSERT intento #1
  - Si sí: Rechaza con error

Capa 3 (vuelta):
  - Actualiza corteActivo con respuesta del servidor

Capa 1 (vuelta):
  - Re-renderiza con correlativo visible
  - Transiciona a pantalla de conteo
```

### Ejemplo: Guardar progreso

```
Capa 1 (Presentación):
  - Phase 1 se completa
  - Componente llama guardarProgreso() con datos del conteo

Capa 2 (Lógica local):
  - usePhaseManager transiciona a Phase 2

Capa 3 (Sincronización):
  - useCorteSesion.guardarProgreso() ejecuta
  - Envía PATCH /cortes/{id}/progreso (no-bloqueante)
  - Si falla: Encola para retry
  - Si offline: Almacena en cola local

Capa 4 (Backend):
  - Actualiza conteo_efectivo JSONB
  - Actualiza fase_actual = 1
  - Actualiza updated_at automáticamente

Capa 1 (continúa):
  - NO espera respuesta del servidor (optimistic update)
  - Muestra Phase 2 inmediatamente
```

## Antipatrones prohibidos

### 1. Componente que habla directo con backend

```
❌ PROHIBIDO:
CashCounter.tsx → fetch('/api/cortes') → setState()

✅ CORRECTO:
CashCounter.tsx → useCorteSesion.guardarProgreso() → backend
```

### 2. Hook local que decide reglas de negocio del servidor

```
❌ PROHIBIDO:
usePhaseManager.ts → if (corteExiste) { rechazar() }

✅ CORRECTO:
useCorteSesion.ts → POST /iniciar → servidor decide → retorna resultado
```

### 3. Backend que genera UI

```
❌ PROHIBIDO:
Supabase Function → return '<div>Resultado</div>'

✅ CORRECTO:
Supabase → return { totalGeneral: 377.20, diferencia: -171.45 }
Frontend → renderizar con componentes React
```

### 4. Datos críticos solo en frontend

```
❌ PROHIBIDO:
const [reporteSent, setReporteSent] = useState(false);  // Solo en RAM

✅ CORRECTO:
useCorteSesion.finalizarCorte(hash) → servidor marca FINALIZADO
```

## Principios obligatorios

- Backend como fuente de verdad
- No monolitos, no archivos gigantes
- No lógica crítica solo en frontend
- No estado crítico no persistente
- Cobertura mínima de tests: 70%
- Compatibilidad CI/CD obligatoria

---

**Siguiente:** → Ver `10_Convenciones_Obligatorias.md`

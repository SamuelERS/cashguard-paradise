# Caso: Resiliencia Offline — Modo Sin Conexión Robusto

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-19 |
| **Fecha actualización** | 2026-02-19 |
| **Estado** | 🔴 Pendiente |
| **Prioridad** | Crítica |
| **Responsable** | Claude Code (Opus 4.6) |

## Resumen

El sistema guarda progreso en Supabase, pero si el internet se corta a media operación: el cajero puede quedar bloqueado, el progreso puede perderse, y no hay modo offline real. Para una tienda real esto es CRÍTICO — el internet no es 100% confiable.

## Contexto

CashGuard Paradise ya tiene una cola offline (`offlineQueue.ts`) con infraestructura completa: FIFO, retry con backoff exponencial, persistencia localStorage. El problema es que esta cola NO está conectada a nada en la aplicación. Además, Workbox solo hace precaching de assets estáticos — no cachea llamadas API en runtime.

## Hallazgos de Investigación

### Lo que YA Existe (infraestructura lista)
- **`src/lib/offlineQueue.ts`** — Cola offline completa:
  - `agregarOperacion()`: Agrega operación a la cola
  - `procesarCola()`: Procesa FIFO con retry
  - Backoff exponencial: `[2000, 4000, 8000, 16000, 30000]` ms
  - `MAX_REINTENTOS = 5`
  - Persistencia vía `localStorage`
- **Tests offline queue**: 7 suites, ~30 tests (infraestructura probada)
- **`useCorteSesion.ts`**: Maneja sesiones con `guardarProgreso()` y `recuperarSesion()`

### HALLAZGO CRÍTICO
- **`offlineQueue.ts` está exportada pero NO importada/usada en NINGÚN archivo de la app**
- La cola existe pero nadie la consume — es código muerto funcional
- `guardarProgreso()` llama directo a Supabase sin fallback offline

### Lo que FALTA
- Integrar `offlineQueue` con `useCorteSesion` (wrapper que encole operaciones fallidas)
- **Runtime caching en Workbox** para llamadas API a Supabase (actualmente solo precaching de assets)
- Detección de estado de conexión (online/offline) con UI para el cajero
- Sincronización automática cuando vuelve la conexión
- Manejo de conflictos (si el cajero hizo cambios offline y online cambió)

## Documentos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_Diagnostico_Infraestructura_Actual.md` | Análisis de offlineQueue.ts, useCorteSesion.ts y Workbox config | ✅ Completado |
| `02_Plan_Arquitectonico_Offline.md` | Estrategia: integración cola, runtime caching, sync, conflictos | ✅ Completado |
| `03_Plan_Implementacion.md` | Plan TDD bite-sized para integrar modo offline | 🔴 Pendiente (crear al iniciar desarrollo) |

## Resultado

[Completar cuando el modo offline esté integrado y probado]

## Referencias

- `src/lib/offlineQueue.ts` — Cola offline (existe, NO integrada)
- `src/hooks/useCorteSesion.ts` — Hook de sesiones Supabase
- `vite.config.ts` — Configuración VitePWA/Workbox (solo precaching)
- Tests: `src/lib/__tests__/offlineQueue.test.ts`

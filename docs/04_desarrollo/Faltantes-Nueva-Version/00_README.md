# Faltantes Nueva Versión — Índice Maestro

> ⚠️ **Auditoría 2026-02-19:** 21 errores factuales corregidos en Casos 2-7 tras verificación exhaustiva contra código fuente. Caso #8 (UX/UI) registrado con 5 imprecisiones corregidas vs documento original.

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-19 |
| **Fecha actualización** | 2026-02-19 |
| **Estado** | 🔴 Pendiente |
| **Prioridad** | Alta |
| **Responsable** | Claude Code (Opus 4.6) + SamuelERS |

## Resumen

Catálogo completo de los 8 problemas identificados en CashGuard Paradise que requieren resolución antes de la siguiente versión mayor. Cada problema tiene su propia carpeta con diagnóstico, plan arquitectónico y guía de implementación modular.

## Contexto

Documento origen: `Faltantes-Nueva-Version.md` — análisis conversacional de qué le falta al proyecto después de cerrar el caso SANN-R4 (sesiones Supabase). Los datos ya están en Supabase. Lo que falta es consumirlos, probarlos en la vida real y completar funcionalidades pendientes.

## Directiva Aplicada

**DIRM (Directiva de Investigación y Resolución Modular):**
- Fase actual: Investigación + Planificación Arquitectónica
- Restricción: Prohibido código funcional hasta aprobación explícita
- Regla de oro: 1 archivo = 1 tarea validable

## Casos Registrados

| # | Carpeta | Problema | Prioridad | Estado | Impacto |
|---|---------|----------|-----------|--------|---------|
| 1 | `Caso_Pruebas_Vida_Real_20260219/` | Pruebas en tienda real con datos reales | 🔴 Crítica | 🔴 Pendiente | Bloquea producción |
| 2 | `../CASOS-COMPLETOS/Caso_Dashboard_Supervisor_20260219_COMPLETADO_20260223/` | Dashboard gerencial para consultar cortes | 🔴 Alta | ✅ Completado | Visibilidad supervisorial habilitada |
| 3 | `Caso_Resiliencia_Offline_20260219/` | Modo offline robusto (internet intermitente) | 🔴 Crítica | 🔴 Pendiente | Bloquea operación tienda |
| 4 | `Caso_Imagenes_Denominaciones_20260219/` | Renombrar imágenes (6 mismatches, NO faltan) | 🟡 Media | 🔴 Pendiente | UX visual incompleta |
| 5 | `Caso_Migracion_WhatsApp_Matutino_20260219/` | Consolidar código WhatsApp duplicado (~147 líneas) | 🟡 Media | 🔴 Pendiente | Código duplicado |
| 6 | `Caso_Testing_Phase2_Verificacion_20260219/` | Tests Phase2VerificationSection (~28%) | 🟡 Media | 🔴 Pendiente | Deuda técnica anti-fraude |
| 7 | `Caso_PWA_Produccion_20260219/` | Experiencia PWA en producción (SW, cache, updates) | 🟠 Alta | 🔴 Pendiente | Usuarios con versión obsoleta |
| 8 | `Caso_UX_UI_Modulo_Nocturno_20260219/` | Inconsistencia visual glass morphism + botones raw + dead code | 🟠 Alta | 🔴 Pendiente | UX inconsistente entre pantallas |

## Documentación Completada

| Métrica | Cantidad |
|---------|----------|
| **Casos documentados** | 8 |
| **Documentos creados** | 26 (8 READMEs + 18 docs técnicos) |
| **Documentos pendientes** | 4 (planes de implementación, se crean al iniciar desarrollo) |
| **Hallazgos clave corregidos** | 2 (Imágenes: renombrar NO generar; WhatsApp: consolidar NO migrar) |
| **Errores factuales corregidos (auditoría)** | 21 errores en Casos 2-7 + 5 imprecisiones en Caso 8 |

## Orden de Ejecución Recomendado

```
BLOQUE A — Bloquean producción (hacer primero):
  #3. Caso_Resiliencia_Offline     → Sin esto, tienda NO puede operar con internet inestable
  #7. Caso_PWA_Produccion          → Asegurar que updates llegan a dispositivos
  #1. Caso_Pruebas_Vida_Real       → Después de offline+PWA, probar en tienda real

BLOQUE B — Funcionalidad supervisor (segundo):
  #2. Caso_Dashboard_Supervisor    → Datos ya existen en Supabase, falta UI

BLOQUE C — Completar experiencia (tercero):
  #4. Caso_Imagenes_Denominaciones → 16 minutos: renombrar 6 archivos
  #5. Caso_Migracion_WhatsApp      → Consolidar ~147 líneas duplicadas con hook existente
  #6. Caso_Testing_Phase2          → Deuda técnica, 7-10h para 100% passing
  #8. Caso_UX_UI_Modulo_Nocturno   → Solo visual, 2-3h: glass morphism + botones + dead code
```

## Skills Aplicados

- `systematic-debugging`: Diagnóstico de causa raíz por cada problema
- `writing-plans`: Planes de implementación bite-sized (TDD)
- `vercel-react-best-practices`: Optimización React en dashboard y componentes
- `frontend-design`: Auditoría design system (Caso #8 UX/UI)
- `web-design-guidelines`: Adherencia guidelines UX/UI (Caso #8)

## Auditoría de Calidad (2026-02-19)

Todos los documentos fueron verificados contra código fuente real. Correcciones aplicadas:

| Caso | Errores Corregidos | Tipo de Error |
|------|--------------------|---------------|
| #2 Dashboard | 11 | Schemas Supabase incorrectos, SQL queries con campos fantasma, paths componentes |
| #3 Offline | 7 | Nombres de funciones que no existen, tabla incorrecta, afirmación falsa auto-reconexión |
| #4 Imágenes | 1 | Afirmación falsa que 3 componentes importan denomination-images (solo 1) |
| #5 WhatsApp | 1 | Afirmación falsa que clipboard.ts no se usa en CashCalculation (sí se importa) |
| #6 Testing | 2 | Conteo líneas incorrecto (783→570), conteo tests incorrecto |
| #7 PWA | 1 | devOptions.enabled no es `true` fijo, es condicional por env var |
| #8 UX/UI | 5 | 5 imprecisiones vs documento original corregidas contra código fuente |

## Referencias

- Documento origen: `→ Ver Faltantes-Nueva-Version.md` (este directorio)
- Punto de partida: `→ Ver docs/EL_PUNTO_DE_PARTIDA_by_SamuelERS.md`
- Reglas documentación: `→ Ver docs/REGLAS_DOCUMENTACION.md`
- Reglas desarrollo: `→ Ver docs/REGLAS_DESARROLLO.md`

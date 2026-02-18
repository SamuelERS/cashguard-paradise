# Caso: Flujo Correcto - Supabase Funcional con UX/UI Propia

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-17 |
| **Fecha actualización** | 2026-02-17 |
| **Estado** | ✅ Correcciones DACC Completadas |
| **Prioridad** | Alta |
| **Responsable** | IA + SamuelERS |

---

## Resumen

Existen **dos mundos paralelos** en el codebase que resuelven el mismo problema de forma incompatible:

1. **Mundo Viejo** (`paradise.ts`): UX/UI correcta con wizard modal de 6 pasos, pero datos hardcodeados (sucursales y empleados estáticos).
2. **Mundo Nuevo** (`CortePage` + `CorteOrquestador`): Supabase funciona y detecta sesiones activas, pero **ignora completamente** los modales del wizard y tiene su propia UX/UI incompatible.

**Objetivo:** Unificar ambos mundos. Usar los **datos de Supabase** a través de la **UX/UI del wizard modal existente** — sin romper nada, sin crear un tercer mundo.

---

## Contexto

La rama `feature/ot11-activar-corte-page-ui` introdujo `CortePage` y `CorteOrquestador` que conectan con Supabase correctamente, pero el resultado es una interfaz completamente diferente que no respeta:
- Los modales de confirmación del wizard
- Los 6 pasos secuenciales del `InitialWizardModal`
- El flujo guiado de protocolo → sucursal → cajero → testigo → SICAR → gastos

Los hooks de Supabase (`useSucursales`, `useEmpleadosSucursal`, `useCorteSesion`) están listos y funcionan. Solo necesitan alimentar al wizard correcto.

---

## Documentos en este caso

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `00_README.md` | Este archivo — índice y contexto del caso | 🟡 En Progreso |
| `01_Diagnostico_Dos_Mundos.md` | Análisis de ambos mundos: qué funciona, qué falla, qué conservar | ✅ Listo |
| `02_Arquitectura_Correcta.md` | Guía arquitectónica modular: flujo correcto, componentes clave, contratos | ✅ Listo |
| `03_Plan_Implementacion.md` | Task list paso a paso con archivos específicos a modificar | ✅ Listo |
| `04_Verificacion.md` | Checklist de QA para confirmar que el flujo unificado funciona | ✅ Listo |

---

## La Decisión Clave (Pre-definida)

> **Ganador: El Wizard Modal** (`InitialWizardModal` + sus 6 pasos).
>
> Los hooks de Supabase se **inyectan** en el wizard existente. El `CortePage` y `CorteOrquestador` se **desactivan o se integran** sin reemplazar la UX.

**Lo que se conserva del Mundo Nuevo:**
- `useSucursales.ts` → reemplaza el array `STORES` de paradise.ts
- `useEmpleadosSucursal.ts` → reemplaza el array `EMPLOYEES` de paradise.ts
- `useCorteSesion.ts` → persiste y reanuda sesiones en Supabase
- Detección de sesión activa en `Index.tsx`

**Lo que se descarta o adapta del Mundo Nuevo:**
- `CortePage.tsx` → su lógica de detección se fusiona con `Index.tsx`
- `CorteOrquestador.tsx` → sus fases se mapean al flujo de phases existente

---

## Resultado Esperado

Al terminar este caso:
- El usuario selecciona "Corte de Caja" en `OperationSelector`
- Si hay sesión activa en Supabase → wizard reanuda en el paso correcto (o pasa directo al conteo)
- Si no hay sesión → wizard de 6 pasos con datos REALES de Supabase
- El flujo de counting/delivery/report NO cambia — sigue siendo el mismo
- La UX/UI es 100% la misma que ya existe y está validada

---

## Referencias

- [→ `src/data/paradise.ts`](../../../../src/data/paradise.ts) — Datos hardcodeados (Mundo Viejo)
- [→ `src/lib/supabase.ts`](../../../../src/lib/supabase.ts) — Cliente Supabase (Mundo Nuevo)
- [→ `src/hooks/useSucursales.ts`](../../../../src/hooks/useSucursales.ts) — Hook sucursales
- [→ `src/hooks/useEmpleadosSucursal.ts`](../../../../src/hooks/useEmpleadosSucursal.ts) — Hook empleados
- [→ `src/hooks/useCorteSesion.ts`](../../../../src/hooks/useCorteSesion.ts) — Hook sesión
- [→ `src/components/initial-wizard/`](../../../../src/components/initial-wizard/) — Wizard modal (conservar)
- [→ `src/components/corte/`](../../../../src/components/corte/) — ActivarCorte (adaptar/desactivar)
- [→ `src/pages/Index.tsx`](../../../../src/pages/Index.tsx) — Router principal

# CASO-SANN-R1: Refinamiento Ubicación Banner Sesión Activa

## Origen del Problema

**Reportado por:** Jefe (inspección visual post-implementación CASO-SANN)
**Fecha:** 2026-02-18
**Evidencia:** Screenshot `01_evidencia_banner_paso1.png`
**Commit base:** `4bb90e4` (feat: CASO-SANN active session banner in cash-cut wizard)

## Descripción del Problema

El banner "Se detectó una sesión activa — Sucursal: Plaza Merliot" aparece
inmediatamente en el **Paso 1** (Protocolo Anti-Fraude) del wizard, **antes**
de que el usuario haya seleccionado o confirmado sucursal.

**Impacto UX:**
- Si un empleado de **otra sucursal** abre el wizard, ve "Plaza Merliot"
  sin contexto — genera confusión.
- El banner informa sobre reanudación **antes** de que el usuario decida
  qué sucursal quiere procesar.
- La sucursal se pre-selecciona silenciosamente en Paso 2 — el banner
  debería aparecer **en ese contexto**, no antes.

## Estructura Modular (1 archivo = 1 tarea)

| # | Archivo | Contenido | Estado |
|---|---------|-----------|--------|
| 00 | `00_INDEX.md` | Este documento — índice y origen | Completo |
| 01 | `01_DIAGNOSTICO_RAIZ.md` | Análisis raíz: por qué el banner está mal ubicado | Pendiente |
| 02 | `02_MAPA_WIZARD_STEPS.md` | Mapa arquitectónico de los 6 pasos del wizard | Pendiente |
| 03 | `03_OPCIONES_ARQUITECTONICAS.md` | Opciones evaluadas con pros/contras | Pendiente |
| 04 | `04_PLAN_IMPLEMENTACION.md` | Plan modular de implementación (sin código) | Pendiente |
| 05 | `05_CRITERIOS_ACEPTACION.md` | Criterios de aceptación actualizados | Pendiente |

## Activos del Caso

- **Screenshot original:** Archivo `01_evidencia_banner_paso1.png` (proporcionado inline por usuario)
- **Caso padre:** `docs/04_desarrollo/Caso-Sesion-Activa-No-Notifica/` (CASO-SANN original)
- **Commit de referencia:** `4bb90e4` en branch `feature/ot11-activar-corte-page-ui`

## Restricción

**CERO CÓDIGO en esta fase.** Solo arquitectura, análisis y planificación.
La implementación requiere aprobación explícita del jefe.

## Referencia Obligatoria

- `docs/EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` — Roles y punto de entrada
- `.agents/skills/systematic-debugging` — Análisis de raíz
- `.agents/skills/writing-plans` — Estructuración de la guía
- `.agents/skills/vercel-react-best-practices` — Estándares de diseño React

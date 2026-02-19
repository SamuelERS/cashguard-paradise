# CASO-SANN-R4: Restauracion de Progreso en Resume Session

## Estado: FASE 2 COMPLETA — Esperando aprobacion de la Autoridad

## Problema
Al hacer "Reanudar sesion", el sistema muestra StoreSelectionForm
("Configuracion Inicial") en lugar de restaurar el progreso del usuario.

## Root Cause
`handleResumeSession` no extrae `corte.testigo` → `hasInitialData = false`
→ CashCounter renderiza formulario de configuracion.

## Documentos

| # | Documento | Contenido |
|---|-----------|-----------|
| 01 | [DIAGNOSTICO_RAIZ](./01_DIAGNOSTICO_RAIZ.md) | Cadena de root cause, datos disponibles vs extraidos |
| 02 | [MAPA_ARCHIVOS](./02_MAPA_ARCHIVOS_IMPACTADOS.md) | Archivos afectados por scope, flujo de datos |
| 03 | [GUIA_ARQUITECTONICA](./03_GUIA_ARQUITECTONICA_MODULAR.md) | 3 scopes, 8 modulos, orden de ejecucion |

## Scopes Propuestos

- **Scope A (Blocker):** Fix testigo + skipWizard → 3 modulos, ~4 ordenes
- **Scope B (Progreso):** Restaurar conteo parcial → 2 modulos, ~4 ordenes
- **Scope C (Fase):** Restaurar fase exacta → 3 modulos, ~4+ ordenes (postergar)

## Recomendacion Director
Aprobar **Scope A + B** (5 modulos, ~8 ordenes).

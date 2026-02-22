# Caso: Auditoría UX/UI Módulo Nocturno — Corte de Caja

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-19 |
| **Fecha actualización** | 2026-02-19 |
| **Estado** | 🟡 Documentación Completa — Pendiente Aprobación |
| **Prioridad** | Alta |
| **Responsable** | Claude Code (Opus 4.6) + SamuelERS |
| **Protocolo** | DIRM (Directiva de Investigación y Resolución Modular) |

## Resumen

Inspección exhaustiva del módulo nocturno (corte de caja) para detectar inconsistencias visuales, bugs estéticos y malas implementaciones de UX/UI. El recorrido completo abarca: OperationSelector → Wizard (5 pasos) → Phase 1 (conteo) → Phase 2A (entrega) + Phase 2B (verificación ciega) → Phase 3 (reporte final).

**Alcance:** Solo correcciones de presentación, consistencia visual y adherencia al design system. NO incluye cambios funcionales/lógicos.

**Metodología TDD:** Todo cambio de código seguirá el ciclo Red-Green-Refactor (ver Módulo 06).

## Contexto

El módulo nocturno es el flujo principal que los empleados recorren diariamente. Se identificó una fractura en el design system: dos definiciones de glass morphism compiten entre sí (`index.css` variable CSS vs clase `.glass-morphism-panel`), creando inconsistencia visual notable entre pantallas.

## Skills Aplicados

| Skill | Uso en este caso |
|-------|-----------------|
| `systematic-debugging` | Root cause analysis del glass morphism fracture, investigación exhaustiva |
| `writing-plans` | Documentación modular DIRM, desconstrucción por prioridad |
| `vercel-react-best-practices` | Patrones responsive (clamp()), composición componentes, CSS-in-JS |
| `test-driven-development` | Ciclo Red-Green-Refactor obligatorio para cada módulo |
| `reducing-entropy` | Dead code removal (opacity:1, dead imports) |

## Documentos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `Caso-Ux-UI-Feb-19.md` | Documento origen con plan inicial + directiva DIRM | ✅ Origen |
| `01_Inventario_Completo_Hallazgos.md` | Inventario exhaustivo: 11 hallazgos, 7 módulos, líneas exactas | ✅ Verificado |
| `02_Modulo_Glass_Morphism_P0.md` | P0: Unificar sistema glass morphism (problema raíz) | ✅ |
| `03_Modulo_Botones_Step5_P1.md` | P1: Estandarizar botones + eliminar dead import | ✅ |
| `04_Modulo_OperationSelector_P2.md` | P2: Limpiar inline styles + viewportScale pattern | ✅ |
| `05_Modulo_Cosmeticos_P3.md` | P3: Residuos cosméticos (opacity, panel sesión) | ✅ |
| `06_Plan_Testing_TDD.md` | Plan TDD: 12 tests vitest + build CLI + 6 verificaciones manuales | ✅ |

## Hallazgos Consolidados

| Prioridad | BUG | IMP | COS | Total |
|-----------|-----|-----|-----|-------|
| P0 | 1 | — | — | 1 |
| P1 | 1 | 2 | — | 3 |
| P2 | — | 3 | — | 3 |
| P3 | — | 1 | 3 | 4 |
| **Total** | **2** | **6** | **3** | **11** |

## Plan de Ejecución (Orden de Módulos)

Para cada módulo se sigue el ciclo TDD definido en `06_Plan_Testing_TDD.md`:

1. **Módulo 06 — Tests TDD (primero):** Escribir tests → Verificar RED (fallan)
2. **Módulo 02 — Glass Morphism (P0):** Problema raíz transversal → 5 archivos → GREEN
3. **Módulo 03 — Botones + Dead Import (P1):** 2 archivos quirúrgicos → GREEN
4. **Módulo 04 — OperationSelector (P2):** 1 archivo con evaluación visual → GREEN
5. **Módulo 05 — Cosméticos (P3):** 2 archivos, cambios mínimos → GREEN
6. **Verificación final:** Todos los tests GREEN + `npm run build` limpio

## Fuera de Alcance

- Cambios funcionales/lógicos (anti-fraude, cálculos, WhatsApp)
- Módulo matutino (MorningVerification)
- Módulo deliveries
- Imágenes de denominaciones (problema conocido desde v1.3.7T, requiere assets externos)
- Refactor de Phase2VerificationSection (783 líneas — tarea separada)

## Verificación Post-Implementación

1. `npm test src/__tests__/ux-audit/` — todos los tests GREEN
2. `npm run build` — debe completar sin errores TypeScript
3. Inspección visual manual recorriendo todo el flujo nocturno
4. Comparación antes/después en viewport móvil (375px) y desktop (1440px)
5. Verificar que `SHOW_REMAINING_AMOUNTS = false` sigue ocultando los 5 elementos anti-fraude

## Referencias

- → `docs/EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` (punto de partida obligatorio)
- → `docs/REGLAS_DOCUMENTACION.md` (estándares de formato)
- → `src/index.css` líneas 262, 494-526 (definiciones glass morphism)
- → `CLAUDE.md` sección "Design System & Architecture"

## Cumplimiento DIRM

| Punto DIRM | Requisito | Estado |
|------------|-----------|--------|
| 1 | Referencia EL_PUNTO_DE_PARTIDA | ✅ Línea 80 |
| 2 | Prohibido código — solo Guía Arquitectónica | ✅ 7 documentos, 0 código |
| 3 | 1 archivo = 1 tarea validable | ✅ Módulos 02-06 independientes |
| 4 | Centralización origen en carpeta final | ✅ `Caso-Ux-UI-Feb-19.md` presente |
| 5 | Uso de skills documentado | ✅ Tabla skills arriba + headers por módulo |
| 6 | Aprobación explícita antes de desarrollo | 🟡 **PENDIENTE** |

## Resultado

[Pendiente aprobación usuario para iniciar fase de desarrollo con TDD]

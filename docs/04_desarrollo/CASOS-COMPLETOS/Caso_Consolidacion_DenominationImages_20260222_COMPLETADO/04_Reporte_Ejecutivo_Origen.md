# 04 — Reporte Ejecutivo de Origen (DACC Audit 2026-02-22)

> Este documento captura el análisis y directivas emitidas durante la sesión DACC del
> 2026-02-22. Sirve como "activo de origen" del caso de consolidación.

---

## Contexto del Audit

La sesión anterior (2026-02-21/22) realizó la corrección de nomenclatura de imágenes
(Caso_Imagenes_Denominaciones_20260219). Al revisar el trabajo, la DACC identificó que
la corrección fue incompleta: solo se actualizó `denomination-images.tsx` pero no los
componentes que duplican las mismas rutas.

---

## Hallazgos de la Auditoría DACC

### HC-001 — CLAUDE.md No Actualizado
- **Severidad:** MEDIA
- **Evidencia:** Los 3 commits modificaron código sin agregar entrada al historial
- **Directiva D-01:** Actualizar CLAUDE.md con entrada de la sesión

### HC-002 — onError Ausente en denomination-images.tsx
- **Severidad:** MEDIA
- **Evidencia:** `getDenominationImageElement()` no tiene handler para imágenes rotas.
  Los componentes que reemplazaría (DeliveryFieldView, GuidedFieldView) sí tienen
  `onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}`
- **Directiva D-03:** Agregar test TDD para onError antes de implementar

### HC-003 — Tests Docker No Ejecutados
- **Severidad:** BAJA
- **Evidencia:** No hay evidencia de `./Scripts/docker-test-commands.sh test` en la sesión
- **Directiva D-01:** Ejecutar Docker tests como prerequisito de cualquier futura entrega

### HC-004 — Deuda de Consolidación No Documentada
- **Severidad:** ALTA (por ser deuda activa en componentes críticos)
- **Evidencia:** `DeliveryFieldView.tsx` y `GuidedFieldView.tsx` tienen funciones `getIcon()`
  con las mismas 11 rutas que `denomination-images.tsx`. La corrección de nomenclatura
  solo fue aplicada en `denomination-images.tsx` (la utilidad central), pero los componentes
  siguen usando sus propias copias hardcodeadas que **también necesitaban actualización**.

  Verificación post-auditoría: al examinar los 3 commits, las rutas en `DeliveryFieldView`
  y `GuidedFieldView` **coinciden** con las de `denomination-images.tsx` (las correcciones
  previas fueron aplicadas manualmente en ambos lados o las rutas ya eran correctas antes).
  Sin embargo, la duplicación sigue siendo deuda técnica activa.
- **Directiva D-04:** Crear Caso de Consolidación con DIRM Protocol

---

## Directivas Emitidas

```
D-01 [PRE-IMPLEMENTACIÓN]: Antes de cualquier nuevo trabajo, ejecutar
     ./Scripts/docker-test-commands.sh test y confirmar 0 regressions.

D-02 [PRE-COMMIT]: Actualizar CLAUDE.md con entrada del caso antes de
     hacer git commit de cualquier implementación nueva.

D-03 [TDD OBLIGATORIO]: Para la adición del onError handler, escribir
     el test que falle PRIMERO. Prohibido implementar sin test previo.
     Ver: src/utils/__tests__/denomination-images.test.tsx Suite 4.

D-04 [ARQUITECTURA]: Crear Caso de Consolidación via DIRM Protocol.
     Documentar la duplicación, proponer arquitectura, solicitar
     aprobación antes de implementar.
```

---

## Veredictos de los Commits

| Commit | Descripción | Veredicto |
|--------|-------------|-----------|
| `e21b7ad` | fix: correct denomination image filenames (penny→dime) | ⚠️ APROBADO CON OBSERVACIONES |
| `8d966ba` | fix: update denomination image paths (quarter→bill50) | ⚠️ APROBADO CON OBSERVACIONES |
| `4d2c7e7` | fix: use dos-caras (two-face) denomination images + test fixtures | ⚠️ APROBADO CON OBSERVACIONES |

**Observaciones comunes a los 3 commits:**
- Los commits resuelven el problema de nomenclatura correctamente ✅
- No hubo tests escritos antes de la corrección (no hay test de onError) ⚠️
- CLAUDE.md no fue actualizado ⚠️
- Docker tests no fueron ejecutados ⚠️

**Nota:** El hecho de que los 3 commits sean "aprobados con observaciones" (no rechazados)
se debe a que el impacto funcional es correcto — las imágenes ahora cargan en producción.
Las observaciones son de proceso y deuda técnica, no de correctitud.

---

## Análisis de Impacto de la Deuda Técnica

### ¿Por qué importa consolidar ahora?

1. **Cambio de imagen en el futuro:** Si se reemplaza una imagen (ej: nueva foto del penny),
   hay que actualizar 3 archivos en lugar de 1. Alta probabilidad de olvidar uno.

2. **Inconsistencia potencial:** Cualquier commit que solo actualice `denomination-images.tsx`
   dejará `DeliveryFieldView` y `GuidedFieldView` con rutas obsoletas — exactamente el
   bug que se acaba de corregir.

3. **Líneas de código:** 66 + 113 = 179 líneas de lógica duplicada que pueden eliminarse.

4. **Testabilidad:** La función central `getDenominationImageElement()` tiene tests.
   Los `getIcon()` de los componentes no tienen tests directos de sus rutas.

### Urgencia

**Media-Alta.** No bloquea producción hoy, pero representa una trampa activa para la
próxima vez que se necesite actualizar imágenes. Dado que las imágenes de denominaciones
son parte de la identidad visual de la app, probablemente se actualicen periódicamente.

---

## Próximos Pasos Aprobados

Ver `docs/plans/2026-02-22-consolidacion-denomination-images.md` para el plan TDD completo
con:
- Fase 0: onError + test
- Fase 1: Migrar DeliveryFieldView
- Fase 2: Migrar GuidedFieldView
- Fase 3: Docker tests + CLAUDE.md + commit

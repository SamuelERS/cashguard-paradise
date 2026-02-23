# 04 — Orden de Ejecución para Agente

**Fecha:** 2026-02-23
**Caso:** Caso_Logica_Envios_Delivery — Documentación del estado real y gap de UI
**Metodología:** TDD RED→GREEN (tests estáticos primero, implementación después)
**Restricción:** No tocar Phase 1 ni Phase 2. Solo documentar y completar gaps de UI/UX en Phase 3.

---

## Descubrimiento crítico previo a ejecución

Durante la investigación forense se detectó que la implementación base ya existe y supera lo que la documentación describe como "Opción C":

| Componente | Estado real | Ruta |
|------------|-------------|------|
| `calculateSicarAdjusted()` | ✅ IMPLEMENTADO + 18 tests | `src/utils/sicarAdjustment.ts` |
| `formatDeliveriesForWhatsApp()` | ✅ IMPLEMENTADO | `src/utils/sicarAdjustment.ts` |
| `formatSicarAdjustment()` | ✅ IMPLEMENTADO | `src/utils/sicarAdjustment.ts` |
| `DeliveryManager` v3.0.0 | ✅ IMPLEMENTADO + enrutado | `src/components/deliveries/DeliveryManager.tsx` |
| `DeliveryDashboard` + `DeliveryDashboardWrapper` | ✅ IMPLEMENTADO | `src/components/deliveries/` |
| `DeliveryAlertBadge` | ✅ IMPLEMENTADO | integrado en `OperationSelector.tsx` |
| `useDeliveries` + `useDeliveryAlerts` | ✅ IMPLEMENTADO | `src/hooks/` |
| Sección "Deliveries COD" en Phase 3 | ✅ IMPLEMENTADO en `CashResultsDisplay.tsx:177` | `src/components/cash-calculation/CashResultsDisplay.tsx` |
| SICAR adjustment en cálculos | ✅ INTEGRADO en `CashCalculation.tsx:103-104` | `src/components/CashCalculation.tsx` |

**Conclusión:** La Opción C ("Solo Alerta 2h") está completamente implementada y la Opción B (módulo básico + dashboard) está también implementada. El trabajo pendiente es **documentar la brecha entre docs y código** y verificar si hay gaps de UI menores.

---

## Orden de ejecución recomendado

### PASO 0 — Corrección documental inmediata (5 min, sin TDD)

**Objetivo:** Corregir el `00_INDEX.md` del caso SANN para evitar confusión en agentes futuros.

**Archivo:** `docs/04_desarrollo/Caso-Sesion-Activa-No-Notifica/00_INDEX.md`

**Cambio en línea 37:**
- ANTES: `FASE 2 — Esperando aprobacion`
- DESPUÉS: `COMPLETADO — Archivado en CASOS-COMPLETOS (commit dfcca5b)`

**Verificación:** `grep -n "Esperando\|COMPLETADO" docs/04_desarrollo/Caso-Sesion-Activa-No-Notifica/00_INDEX.md`

---

### PASO 1 — Auditoría de UI: Verificar qué muestra Phase 3 con deliveries pendientes

**Objetivo:** Confirmar visualmente que la alerta de deliveries en Phase 3 es suficientemente visible.

**Qué verificar en `src/components/cash-calculation/CashResultsDisplay.tsx`:**
- Línea 177: La sección "📦 Deliveries Pendientes (COD)" aparece siempre (no solo cuando hay pendientes)
- El `DeliveryManager` embebido en Phase 3 permite agregar/gestionar deliveries directamente
- La diferencia en el resumen ya refleja el ajuste SICAR automáticamente via `calculateSicarAdjusted()`

**Pregunta de negocio:** ¿El cajero entiende que la sección de deliveries afecta el cálculo SICAR? Si no hay señal visual que conecte las dos secciones, falta comunicación UX.

**Acción si hay gap:** Agregar texto explicativo o badge que conecte "Deliveries registrados → SICAR ajustado automáticamente".

---

### PASO 2 — TDD RED: Tests de integración SICAR + deliveries en CashCalculation

**Objetivo:** Confirmar con tests que el flujo completo funciona correctamente.

**Archivo de test a crear:**
```
src/utils/__tests__/sicarAdjustment-integration.test.ts
```

**Cobertura mínima requerida:**
1. `calculateSicarAdjusted(2500, [])` → SICAR sin cambios
2. `calculateSicarAdjusted(2500, [{ amount: 100, status: 'pending_cod' }])` → SICAR ajustado $2,400
3. `formatDeliveriesForWhatsApp(result)` con 0 pendientes → string vacío
4. `formatDeliveriesForWhatsApp(result)` con 3 pendientes → incluye todos los nombres
5. Delivery con daysOld ≥ 7 → incluye emoji ⚠️
6. Delivery con daysOld ≥ 15 → incluye emoji 🚨
7. Delivery con daysOld ≥ 30 → incluye emoji 🔴

**Comando verificación:**
```bash
npx vitest run src/utils/__tests__/sicarAdjustment
```

**Criterio RED:** Los tests existen y pasan. Si alguno falla, indica gap de implementación.

**Nota:** Estos tests ya existen parcialmente en `sicarAdjustment.test.ts`. Verificar cobertura antes de crear nuevos.

---

### PASO 3 — Actualizar documentación del caso Delivery

**Objetivo:** Actualizar `docs/04_desarrollo/Caso_Logica_Envios_Delivery/README.md` para reflejar estado real del código.

**Cambios necesarios:**
1. Actualizar "Última actualización" de `24 Oct 2025` a `2026-02-23`
2. Agregar sección "Estado Real del Código (verificado 2026-02-23)" indicando qué ya está implementado
3. Cambiar "Decisión pendiente" a "Opciones C y B implementadas — Opción D pendiente decisión"

**Por qué esto importa:** Un agente futuro que lea el README actual cree que nada está implementado. La brecha doc/código es de 4 meses.

---

### PASO 4 — Verificación final

**Comandos a ejecutar en orden:**
```bash
# 1. TypeScript
npx tsc --noEmit

# 2. Tests (solo delivery-related)
npx vitest run src/utils/__tests__/sicarAdjustment

# 3. Build completo
npm run build
```

**Criterios de éxito:**
- `npx tsc --noEmit` → 0 errores
- Tests de sicarAdjustment → todos passing
- Build → exitoso sin warnings nuevos

---

## Archivos a modificar por paso

| Paso | Archivo | Tipo de cambio | Riesgo |
|------|---------|----------------|--------|
| 0 | `docs/04_desarrollo/Caso-Sesion-Activa-No-Notifica/00_INDEX.md` | Solo documentación | CERO |
| 1 | `src/components/cash-calculation/CashResultsDisplay.tsx` | UI minor (texto explicativo) | BAJO |
| 2 | `src/utils/__tests__/sicarAdjustment-integration.test.ts` | Solo tests nuevos | CERO |
| 3 | `docs/04_desarrollo/Caso_Logica_Envios_Delivery/README.md` | Solo documentación | CERO |

---

## Lo que NO hacer en esta ejecución

- NO modificar `DeliveryManager.tsx` — funciona correctamente
- NO modificar `sicarAdjustment.ts` — implementación completa con tests
- NO tocar Phase 1 ni Phase 2 — fuera de scope
- NO implementar Opción D (integración API SICAR) — requiere decisión stakeholder
- NO hacer push ni merge a main — trabajar en rama feature existente

---

## Notas sobre Caso B (Caso_Estrategia_UI_Datos_Reales)

El Caso B quedó CONDICIONAL con score 7.2/10. Si el agente tiene tiempo adicional después de completar el Caso D, puede abordar las Tareas B y D del `06_ORDEN_TECNICA_Traslado_Agente_Nuevo.md`:

- **Tarea B:** Diagnóstico del flujo guiado (gaps en pasos del wizard)
- **Tarea D:** Matriz de persistencia Supabase

**Restricción crítica:** Todo en local. No publicar rama, no mergear a main, no tocar producción.

El Caso B tiene una Orden Técnica explícita que debe seguirse al pie de la letra. No iniciar sin leer `docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/06_ORDEN_TECNICA_Traslado_Agente_Nuevo.md` completo.

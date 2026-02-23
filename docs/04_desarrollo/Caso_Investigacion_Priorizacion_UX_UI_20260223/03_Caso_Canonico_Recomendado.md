# 03 — Caso Canónico Recomendado

**Fecha:** 2026-02-23
**Caso seleccionado:** Caso_Logica_Envios_Delivery
**Decisión:** GO — Score 7.6/10 (supera umbral 7.5)
**Alcance recomendado:** Opción C — Quick Win (alerta + registro manual)

---

## Justificación del GO

El caso supera el umbral con 7.6/10. Los factores determinantes:

- **B=9 (Valor de negocio):** Elimina el workaround más doloroso del sistema: facturas ficticias + gastos ficticios para registrar entregas COD. Impacto directo en reconciliación financiera SICAR y reportes auditables.
- **D=8 (Dolor actual):** El equipo usa WhatsApp como base de datos. La reconciliación toma 4 horas/mes. El dolor es documentado, cotidiano y evitable.
- **R=7 (Riesgo):** Los reportes SICAR permanecen distorsionados indefinidamente. Riesgo de auditoría fiscal real. La confianza del equipo en el sistema se erosiona con cada ciclo.

---

## Por qué Opción C (Quick Win) sobre Opciones A/B/D

La documentación del caso define 4 opciones:

| Opción | Descripción | Esfuerzo | Score ajustado |
|--------|-------------|----------|----------------|
| **C** | Alerta + registro manual en corte | **E=2** | **8.2/10** |
| B | Integración completa COD+SICAR automático | E=8 | 7.6/10 |
| A | Módulo standalone sin integración SICAR | E=6 | 7.8/10 |
| D | Solo documentación de proceso | E=1 | 8.4/10 (sin valor real) |

La Opción C con E=2 eleva el score a **8.2/10** — el más alto de todos los casos evaluados — con esfuerzo de aproximadamente 2 horas. La Opción B (18-25h) resuelve el problema raíz pero exige una decisión técnica y stakeholder que lleva 4 meses sin resolverse.

**La Opción C desbloquea el valor inmediato sin bloquear la Opción B futura.**

---

## Estado actual del código (evidencia)

El módulo de deliveries ya existe y está operativo:

```
src/components/deliveries/
├── DeliveryManager.tsx          (v3.0.0 — gestión COD entries)
├── DeliveryDashboard.tsx        (UI principal)
├── DeliveryDashboardWrapper.tsx (wrapper con PIN)
├── DeliveryAlertBadge.tsx       (badge de alerta en OperationSelector)
├── DeliveryEducationModal.tsx   (modal educativo)
└── hooks/
    ├── useDeliveries.ts
    └── useDeliveryAlerts.ts
```

El componente está enrutado en `src/pages/Index.tsx:384`:
```typescript
return <DeliveryDashboardWrapper requirePin={true} onGoBack={resetMode} />;
```

Y `DeliveryAlertBadge` ya aparece en `OperationSelector.tsx` mostrando conteo de deliveries pendientes.

---

## Alcance de Opción C — Definición técnica

La Opción C agrega al flujo del corte de caja nocturno (Phase 3 / CashCalculation):

1. **Alerta contextual** en Phase 3 si hay deliveries COD pendientes sin reconciliar
2. **Registro manual** del monto COD que el empleado declara haber recibido
3. **Ajuste del total a reportar** = Total caja - Monto COD recibido
4. **Nota en reporte WhatsApp** indicando el ajuste COD manual

Esto NO requiere:
- Integración automática con SICAR
- Modificación de `DeliveryManager` existente
- Cambios en Phase 1 o Phase 2

---

## Restricción importante

La Opción C es un quick win que **no cierra el caso**. El `README.md` del caso dice "DOCUMENTACIÓN COMPLETA + FASE 9 INTEGRADA" pero la decisión Opción A/B/C/D lleva 4 meses sin resolverse desde Oct 2025.

Al implementar Opción C se debe actualizar el README del caso indicando que Opción C fue implementada y que Opción B sigue pendiente de decisión stakeholder.

---

## Criterios de éxito (Opción C)

1. Al llegar a Phase 3 con deliveries COD pendientes, el cajero ve una alerta visible
2. El cajero puede ingresar el monto COD recibido durante el turno
3. El reporte WhatsApp incluye una línea de ajuste COD
4. El total diferencia (vs SICAR) se calcula con el ajuste aplicado
5. Si no hay deliveries COD pendientes, el flujo es idéntico al actual (zero regresión)
6. TypeScript: 0 errores, vitest: sin regresiones en suite existente

---

## Archivos de referencia del caso

- `docs/04_desarrollo/Caso_Logica_Envios_Delivery/README.md` — Resumen ejecutivo y opciones A/B/C/D
- `src/components/deliveries/DeliveryManager.tsx` — Módulo base existente
- `src/pages/Index.tsx:384` — Routing del módulo delivery
- `src/components/operation-selector/OperationSelector.tsx` — DeliveryAlertBadge integrado

# 02 — Matriz de Priorización de Valor

**Fecha:** 2026-02-23
**Fórmula:** Score = (B×0.4) + (D×0.3) + (R×0.2) + ((10-E)×0.1)

---

## Definición de variables

| Variable | Descripción | Escala |
|----------|-------------|--------|
| **B** | Valor de negocio — impacto real en operación diaria | 0-10 |
| **D** | Dolor operativo actual — qué tan problemático es NO tenerlo | 0-10 |
| **R** | Riesgo por no hacer — consecuencias de dejar pendiente | 0-10 |
| **E** | Esfuerzo estimado — 0=fácil, 10=muy difícil | 0-10 |

---

## Caso A: Caso_PWA_Produccion_20260219 (Notificación Update)

### Evaluación

| Variable | Score | Justificación |
|----------|-------|---------------|
| **B (Valor negocio)** | 5 | Beneficio real pero no urgente: cajeros actuarían con versión obsoleta solo si hay deploy con fix crítico el mismo día. El ciclo de deploy es bajo frecuencia |
| **D (Dolor actual)** | 3 | No hay reporte de problema operativo activo. Usuarios no saben que existe el problema. Riesgo latente no percibido |
| **R (Riesgo)** | 4 | Si se despliega un fix de seguridad, usuarios podrían operar con versión rota hasta el día siguiente. Moderado |
| **E (Esfuerzo)** | 3 | Plan completamente documentado: 2.5-3.5 horas. Archivos claros. Sin dependencias externas |

**Score = (5×0.4) + (3×0.3) + (4×0.2) + ((10-3)×0.1)**
**Score = 2.0 + 0.9 + 0.8 + 0.7 = 4.4/10**

---

## Caso B: Caso_Estrategia_UI_Datos_Reales_20260217 (Estabilización flujo guiado)

### Evaluación

| Variable | Score | Justificación |
|----------|-------|---------------|
| **B (Valor negocio)** | 8 | Sin flujo guiado estable con datos reales, el flujo de conteo/corte puede tener inconsistencias. Es la base operativa. |
| **D (Dolor actual)** | 7 | El flujo tiene gaps documentados (pasos del wizard que pueden saltar, datos que no persisten). Afecta operación real |
| **R (Riesgo)** | 8 | Dejar sin cerrar la estabilización implica que cada despliegue puede romper algo. Es deuda de arquitectura crítica |
| **E (Esfuerzo)** | 7 | Tareas B y D del ORDEN_TECNICA sin ejecutar implican diagnóstico de flujo guiado + matriz persistencia Supabase. Estimado: 6-10 horas |

**Score = (8×0.4) + (7×0.3) + (8×0.2) + ((10-7)×0.1)**
**Score = 3.2 + 2.1 + 1.6 + 0.3 = 7.2/10**

**Nota importante:** Este caso tiene una restricción documental explícita: "Toda acción debe mantenerse en local. No publicar rama, no mergear a main, no tocar producción." Es un caso de estabilización pre-producción, no un feature nuevo.

---

## Caso C: Caso-Sesion-Activa-No-Notifica (R4 completado)

### Evaluación

| Variable | Score | Justificación |
|----------|-------|---------------|
| **B (Valor negocio)** | 0 | Ya implementado y archivado. No hay implementación pendiente |
| **D (Dolor actual)** | 1 | Solo deuda documental: el INDEX no refleja el estado real. No afecta la operación |
| **R (Riesgo)** | 2 | Confusión para agentes futuros si leen el INDEX desactualizado y creen que hay trabajo pendiente |
| **E (Esfuerzo)** | 1 | 5 minutos: actualizar una línea en 00_INDEX.md |

**Score = (0×0.4) + (1×0.3) + (2×0.2) + ((10-1)×0.1)**
**Score = 0 + 0.3 + 0.4 + 0.9 = 1.6/10**

**Veredicto:** NO-GO como caso de implementación. Solo requiere corrección documental puntual (5 min).

---

## Caso D: Caso_Logica_Envios_Delivery (Módulo C807/Melos)

### Evaluación

| Variable | Score | Justificación |
|----------|-------|---------------|
| **B (Valor negocio)** | 9 | Elimina workaround manual de facturas ficticias + gastos ficticios. Impacto directo en reconciliación financiera y reportes SICAR |
| **D (Dolor actual)** | 8 | Equipo usa WhatsApp como base de datos, reconciliación toma 4h/mes, frustración masiva documentada. El dolor es real y cotidiano |
| **R (Riesgo)** | 7 | Sin solución, reportes SICAR permanecen distorsionados. Riesgo de auditoría fiscal. Equipo pierde confianza en el sistema |
| **E (Esfuerzo)** | 8 | Implementación compleja: Opción B (18-25h). Pero existe un DeliveryManager base. La integración con corte de caja + ajuste SICAR automático es la parte costosa |

**Score = (9×0.4) + (8×0.3) + (7×0.2) + ((10-8)×0.1)**
**Score = 3.6 + 2.4 + 1.4 + 0.2 = 7.6/10**

**Nota:** Si se considera solo Quick Win Opción C (alerta en 2h, E=2), el score subiría: (9×0.4) + (8×0.3) + (7×0.2) + ((10-2)×0.1) = 3.6 + 2.4 + 1.4 + 0.8 = **8.2/10**. Sin embargo, el Quick Win no resuelve el problema raíz.

---

## Ranking Final

| Posición | Caso | Score | Decisión |
|----------|------|-------|----------|
| 🥇 1 | **D. Caso_Logica_Envios_Delivery** | **7.6/10** | GO — supera umbral 7.5 |
| 🥈 2 | **B. Caso_Estrategia_UI_Datos_Reales** | 7.2/10 | CONDICIONAL — requiere definir scope exacto antes de GO |
| 🥉 3 | **A. Caso_PWA_Produccion** | 4.4/10 | NO-GO — valor insuficiente para priorizar ahora |
| — | **C. Caso-SANN** | 1.6/10 | NO-GO — ya completado, solo deuda documental |

---

## Análisis de umbrales

**Umbral de GO:** 7.5/10 (definido en el protocolo de investigación)

- Caso D supera el umbral con 7.6/10. **GO condicional** (ver Caso Canónico).
- Caso B queda a 0.3 puntos del umbral. **CONDICIONAL**: si el scope se delimita a las tareas pendientes del ORDEN_TECNICA (Tareas B+D), el esfuerzo real podría reducirse a E=5, elevando el score a 7.5/10 exacto.
- Caso A es claramente inferior al umbral. Postergable.
- Caso C ya está resuelto. Solo corrección documental menor.

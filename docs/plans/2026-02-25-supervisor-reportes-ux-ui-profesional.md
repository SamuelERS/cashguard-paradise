# Mejoras UX/UI Profesionales para Reportes de Supervisor

## 1) Diagnóstico (basado en pantallas actuales)

Hallazgos principales:
- La pantalla muestra muchos datos útiles, pero todos tienen casi el mismo peso visual.
- El usuario no identifica en 3 segundos: estado crítico, diferencia, riesgo, acción sugerida.
- El detalle financiero está correcto, pero no está organizado por "decisiones" del supervisor.
- El desglose de efectivo es largo, lineal, y obliga a escaneo visual costoso.
- Falta una capa de "lectura ejecutiva" arriba y una capa "forense" abajo.

## 2) Objetivo del rediseño

Convertir `CorteDetalle` en un reporte de doble nivel:
- Nivel 1 (ejecutivo, 10 segundos): estado, diferencia, riesgo, contexto.
- Nivel 2 (auditoría, 60-120 segundos): desglose completo, trazabilidad, validación de consistencia.

## 3) Dirección visual (frontend-design)

Concepto: **"Ledger Control Room"**
- Estética: dashboard nocturno premium con jerarquía fuerte y contraste funcional.
- Tono: sobrio, técnico, ejecutivo (no decorativo).
- Rasgo memorable: una "banda de estado" superior con semáforo, diferencia, salud del corte y timestamp vivo.

Guías visuales:
- Tipografía: display técnico para titulares + sans legible para tabla de datos.
- Colores: base oscura, acentos de estado estrictos (verde/ámbar/rojo/azul informativo).
- Espaciado: bloques por prioridad de negocio, no por tipo técnico.
- Motion: mínimo, solo para cambios de estado/realtime (fade + highlight temporal).

## 4) Nueva arquitectura de información

### A. Header ejecutivo (sticky)
Contenido:
- Correlativo
- Estado (badge fuerte)
- Sucursal
- Fecha/hora principal
- Semáforo con razón
- Diferencia absoluta y porcentual

### B. Resumen de decisiones (cards KPI)
- Total contado
- Venta esperada (SICAR)
- Diferencia
- Monto a entregar / restante

### C. Riesgos y validaciones
- ABORTADO: motivo + hora exacta + intento en que ocurrió
- Verificación: overrides/triple mismatch si existen
- Inconsistencias detectadas (si falta sección requerida)

### D. Bloques forenses
1. Pagos electrónicos (tabla compacta + total)
2. Gastos del día (tabla con categoría, factura, hora, total)
3. Desglose de efectivo agrupado:
   - Monedas (subtotal)
   - Billetes (subtotal)
   - Total efectivo

### E. Trazabilidad (timeline)
- Creado
- En progreso
- Finalizado/Abortado
- Última actualización realtime

## 5) Cambios de UX específicos

- Reordenar secciones para priorizar decisiones del supervisor.
- Mostrar totales/subtotales siempre visibles sin bajar demasiado.
- Añadir "etiquetas de salud" (OK, Revisar, Crítico).
- En estado `ABORTADO`, bloquear ambigüedad con motivo en primer viewport.
- Añadir botón "Copiar resumen" (texto ejecutivo rápido para WhatsApp).

## 6) Plan técnico por fases (TDD primero)

### Fase 1 — Contrato de información (sin rediseño visual profundo)
Objetivo: asegurar jerarquía correcta antes de estilizar.

Archivos:
- `src/components/supervisor/CorteDetalle.tsx`
- `src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx`
- Crear: `src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx`

TDD:
1. RED: test exige bloque "Resumen ejecutivo" con estado + diferencia + total.
2. GREEN: implementación mínima.
3. RED: test exige visualización explícita de `motivo_aborto` cuando `ABORTADO`.
4. GREEN: implementación mínima.

### Fase 2 — Reorganización de desglose financiero
Archivos:
- `src/components/supervisor/CorteDetalle.tsx`
- Crear: `src/components/supervisor/__tests__/CorteDetalle.cash-groups.test.tsx`

TDD:
1. RED: test exige subtotales separados monedas/billetes.
2. GREEN: agrupar denominaciones + subtotales.
3. RED: test exige total de gastos del día visible.
4. GREEN: agregar total + metadatos de gasto.

### Fase 3 — UX visual profesional (frontend-design)
Archivos:
- `src/components/supervisor/CorteDetalle.tsx`
- Crear: `src/styles/features/supervisor-report-ledger.css`
- Opcional: `src/components/supervisor/SemaforoIndicador.tsx`

TDD funcional:
1. RED: test de estructura semántica (header ejecutivo sticky, secciones con títulos).
2. GREEN: layout final desktop/mobile.
3. RED: test de estados (ABORTADO/FINALIZADO/EN_PROGRESO) con badges correctos.
4. GREEN: estados visuales definitivos.

### Fase 4 — Realtime y trazabilidad visible
Archivos:
- `src/components/supervisor/CorteDetalle.tsx`
- `src/hooks/useSupervisorRealtime.ts`
- Crear: `src/components/supervisor/__tests__/CorteDetalle.realtime-indicator.test.tsx`

TDD:
1. RED: test exige indicador "Actualizado hace X" al recibir cambios.
2. GREEN: conectar evento realtime a indicador temporal.

## 7) Criterios de aceptación (Done)

- En 10 segundos, el supervisor identifica: estado, diferencia, riesgo y acción sugerida.
- En `ABORTADO`, motivo y contexto están en la primera pantalla visible.
- Totales y subtotales financieros se entienden sin cálculo mental.
- Mobile y desktop mantienen legibilidad profesional.
- Tests nuevos en verde + regresión de supervisor existente en verde.

## 8) Verificación por iteración (obligatoria)

En cada iteración:
1. `npx vitest run <tests del módulo>`
2. `npm run build`
3. reiniciar dev server
4. validar visualmente en `http://localhost:5173/supervisor/corte/:id`

## 9) Resultado esperado para negocio

- Menor tiempo de lectura por corte.
- Menos errores de interpretación del estado real.
- Mayor confianza del supervisor al tomar decisiones de cierre.
- Reporte apto para operación madura, no solo para desarrollo inicial.

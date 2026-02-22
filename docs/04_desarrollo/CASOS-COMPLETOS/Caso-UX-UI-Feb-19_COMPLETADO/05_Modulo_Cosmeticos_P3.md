# Módulo 05: Limpiezas Cosméticas — P3

**Fecha:** 2026-02-19
**Caso:** `Caso-UX-UI-Feb-19/`
**Hallazgos:** 6.2, 2.2

**Skills aplicados:** `reducing-entropy` (dead code removal), `vercel-react-best-practices` (CSS defaults)

---

## Tarea A: Remover `opacity: 1` Redundante (6.2)

### Problema

v1.3.6Z removió `motion.div` de Framer Motion y lo reemplazó por `<div>` con `style={{ opacity: 1 }}`. El valor `opacity: 1` es el default CSS — completamente redundante.

### Ubicación Exacta

**Archivo:** `src/components/CashCalculation.tsx`
**Línea 279:**
```tsx
<div
  className="space-y-[clamp(1rem,4vw,1.5rem)]"
  style={{ opacity: 1 }}
>
```

### Solución

Remover `style={{ opacity: 1 }}` completamente:
```tsx
<div className="space-y-[clamp(1rem,4vw,1.5rem)]">
```

### Riesgo: Cero
- `opacity: 1` es el valor default de CSS
- No hay transiciones ni animaciones que dependan de este valor
- El comentario de v1.3.6Z ya documenta que fue un reemplazo de `motion.div`

---

## Tarea B: Panel Sesión Activa Sin Glass Morphism (2.2)

### Problema

El panel de "sesión activa" en Step5 usa estilos amber inline en vez de seguir el glass morphism del resto del wizard.

### Ubicación Exacta

**Archivo:** `src/components/initial-wizard/steps/Step5SicarInput.tsx`
**Línea 38:**
```tsx
<div className="rounded-lg p-4 border border-amber-500/40"
  style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }}>
```

### Evaluación

Este es un caso **intencional vs accidental**:
- El color amber distingue visualmente el estado "sesión activa detectada" del flujo normal
- Aplicar glass morphism estándar podría **perder** esa distinción visual
- **Recomendación:** Evaluar si merece glass morphism base con tinte amber, o mantener como está

### Solución Propuesta (si se decide cambiar)

Opción 1: Mantener como está (amber es intencional para estado especial)
Opción 2: Usar glass morphism base + border amber para mantener distinción

---

## Criterios de Aceptación

- [ ] CashCalculation: `style={{ opacity: 1 }}` removido de línea 279
- [ ] Step5SicarInput: Decisión tomada sobre panel amber (mantener o migrar)
- [ ] `npm run build` sin errores
- [ ] Sin cambios visuales inesperados

## Resumen del Caso Completo

| Módulo | Prioridad | Archivos | Complejidad |
|--------|-----------|----------|-------------|
| 02 — Glass Morphism | P0 | 5 | Alta (decisión arquitectónica) |
| 03 — Botones + Dead Import | P1 | 2 | Baja (quirúrgico) |
| 04 — OperationSelector | P2 | 1 | Media (requiere testing visual) |
| 05 — Cosméticos | P3 | 2 | Baja (cambios mínimos) |

→ Regresar a `00_README.md` para estado general del caso

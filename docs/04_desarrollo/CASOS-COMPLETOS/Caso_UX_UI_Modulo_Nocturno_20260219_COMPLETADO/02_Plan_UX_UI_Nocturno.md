# Plan de Ejecución — UX/UI Módulo Nocturno

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-02-19 |
| **Estimación total** | 2-3 horas |
| **Prerequisitos** | Ninguno (independiente de Casos 1-7) |
| **Restricción** | Solo cambios visuales/presentación — cero cambios funcionales |

## Orden de Implementación

### Paso 1: Unificar Glass Morphism (7.1, 1.1, 6.1, 7.3) — P0

**Objetivo:** Single source of truth para glass morphism en todo el app.

**Archivos:**
- Modificar: `src/index.css` (`.glass-morphism-panel`)
- Modificar: `src/components/operation-selector/OperationSelector.tsx`
- Modificar: `src/components/CashResultsDisplay.tsx`
- Modificar: `src/components/morning-count/MorningVerificationView.tsx`

**Pasos:**
1. Decidir valores canónicos (propuesta: los de `.glass-morphism-panel` ya que están centralizados)
2. Evaluar si `!important` puede removerse al eliminar inline styles conflictivos
3. Migrar `OperationSelector.tsx` inline styles → usar clase `.glass-morphism-panel` o variante Tailwind
4. Migrar `CashResultsDisplay.tsx` constante `glassCard` → usar clase CSS
5. Migrar `MorningVerificationView.tsx` constante `glassCard` línea 77 → usar clase CSS
6. Verificar visualmente que todas las pantallas se ven consistentes

**Criterio de aceptación:** Zero inline `rgba(36, 36, 36, 0.4)` en componentes. Un solo sistema glass.

---

### Paso 2: Estandarizar Botones Step5 (2.1, 7.2) — P1

**Objetivo:** Eliminar último caso de `<button>` raw en el app.

**Archivos:**
- Modificar: `src/components/wizard/Step5SicarInput.tsx` (líneas 62-77)

**Pasos:**
1. Reemplazar `<button>` línea ~62 (Reanudar) → `<ConstructiveActionButton>`
2. Reemplazar `<button>` línea ~70 (Abortar) → `<DestructiveActionButton>`
3. Preservar `aria-label` y handlers `onClick` existentes
4. Verificar que estilos hover/focus son consistentes con otros modales

**Criterio de aceptación:** Zero `<button>` custom en Step5. Ambos usan sistema de 4 botones.

---

### Paso 3: Limpiar OperationSelector (1.2, 1.3) — P2

**Objetivo:** Modernizar responsive y reducir inline styles.

**Archivos:**
- Modificar: `src/components/operation-selector/OperationSelector.tsx`

**Pasos:**
1. Evaluar migración `viewportScale` pattern → `clamp()` (requiere testing visual)
2. Mover propiedades inline repetidas a clases Tailwind
3. Testing visual en 375px (móvil) y 1440px (desktop)

**Criterio de aceptación:** Sin `transform: scale()` para responsive. Inline styles reducidos >50%.

---

### Paso 4: Limpiezas cosméticas (6.2, 2.2) — P3

**Archivos:**
- Modificar: `src/components/CashCalculation.tsx` (línea 279 — remover `opacity: 1`)
- Evaluar: `src/components/wizard/Step5SicarInput.tsx` (panel sesión activa glass)

**Pasos:**
1. Remover `style={{ opacity: 1 }}` redundante de `CashCalculation.tsx`
2. Evaluar si panel sesión activa en Step5 merece `.glass-morphism-panel`

**Criterio de aceptación:** Zero `opacity: 1` explícitos innecesarios.

---

### Paso 5: Remover dead import Phase2 (5.1) — P2

**Archivos:**
- Modificar: `src/components/phases/Phase2VerificationSection.tsx` (línea 16)

**Pasos:**
1. Remover `import { Button } from '@/components/ui/button';` (línea 16)
2. Verificar build pasa sin errores

**Criterio de aceptación:** Zero imports no utilizados en Phase2VerificationSection.

---

## Verificación Final

```bash
npm run build  # Debe completar sin errores TypeScript
```

Inspección visual manual del flujo completo:
- [ ] OperationSelector → glass morphism consistente
- [ ] Wizard pasos 1-5 → botones estandarizados en Step5
- [ ] Phase 1 conteo → cards consistentes
- [ ] Phase 2 entrega + verificación → glass morphism alineado
- [ ] Phase 3 reporte → glass cards unificados
- [ ] Viewport móvil (375px) y desktop (1440px)
- [ ] `SHOW_REMAINING_AMOUNTS = false` sigue ocultando 5 elementos anti-fraude

## Dependencias con Otros Casos

| Hallazgo | Caso | Acción aquí |
|----------|------|-------------|
| 3.1 (Imágenes 404) | Caso #4 | No hacer nada — se resuelve allí |
| 5.2 (Phase2 extenso) | Caso #6 | No hacer nada — refactor allí |

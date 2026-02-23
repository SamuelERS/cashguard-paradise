# Módulo Correctivo H2: Accesibilidad OperationSelector

| Campo     | Valor                                    |
|-----------|------------------------------------------|
| Severidad | 🔴 Crítico                               |
| Estado    | 🔴 Pendiente                             |
| Tipo      | Accesibilidad / UX / Semántica HTML      |
| Archivo   | `src/components/operation-selector/OperationSelector.tsx` |

---

## Hallazgo Original

> Tarjetas interactivas implementadas con `div` + `onClick` sin semántica/teclado en OperationSelector.tsx (line 110), (line 217), (line 324), (line 430).

## Root Cause

Las 4 tarjetas de operación usan `<motion.div>` con `onClick` como elemento interactivo. Esto falla en:

| WCAG 2.1        | Regla          | Problema                                        |
|------------------|----------------|--------------------------------------------------|
| 1.3.1            | Info & Relationships | `div` no comunica rol interactivo           |
| 2.1.1            | Keyboard       | No hay handler `onKeyDown` (Tab/Enter/Space)     |
| 4.1.2            | Name, Role, Value | Sin `role="button"` ni `aria-label`          |

## Código Problemático Actual (patrón repetido x4)

```tsx
// Líneas ~110, ~217, ~324, ~430
<motion.div
  onClick={() => onSelectMode(OperationMode.CASH_COUNT)}
  className="cursor-pointer group"
  style={{...}}
>
  {/* Contenido de la tarjeta */}
</motion.div>
```

## Estrategia Correctiva

### Opción A: `<motion.button>` (Recomendada)

Reemplazar `<motion.div>` por `<motion.button>` en las 4 tarjetas.

**Ventajas:**
- Semántica nativa: `role="button"` implícito
- Keyboard gratis: Tab, Enter, Space funcionan sin código extra
- Focus ring nativo del navegador
- Mínimo cambio de código

**Consideraciones:**
- Resetear estilos default de `<button>` (border, background, padding)
- Framer Motion soporta `motion.button` nativamente
- Verificar que estilos glass morphism no se rompan

### Opción B: `<motion.div>` + ARIA manual

Agregar `role="button"`, `tabIndex={0}`, `onKeyDown`, `aria-label` a cada tarjeta.

**Desventaja:** Más código, más mantenimiento, más propenso a errores.

### Decisión: **Opción A** (sujeta a aprobación)

## Plan de Ejecución (TDD)

### RED: Test de accesibilidad

```
Commit: test(RED): OperationSelector — tests de accesibilidad teclado (debe fallar)
```

Tests a crear:
1. Las 4 tarjetas son focuseables con Tab
2. Enter/Space activa la operación correspondiente
3. Cada tarjeta tiene `role="button"` (implícito o explícito)
4. Cada tarjeta tiene `aria-label` descriptivo

### GREEN: Implementación semántica

```
Commit: feat(GREEN): OperationSelector — tarjetas como button semántico
```

Cambios:
- `<motion.div onClick>` → `<motion.button onClick>`
- Reset CSS: `appearance: none; border: none; background: transparent; text-align: left; width: 100%;`
- `aria-label` en cada tarjeta (ej: "Iniciar conteo matutino")

### REFACTOR: Limpieza

```
Commit: refactor: OperationSelector — extraer estilos reset a clase utilitaria
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `OperationSelector.tsx` | 4 tarjetas: `motion.div` → `motion.button` + `aria-label` |
| `OperationSelector.test.tsx` (nuevo o existente) | 4 tests accesibilidad teclado |
| `index.css` (opcional) | Clase utilitaria `.card-button-reset` si aplica |

## Criterio de Aceptación

- [ ] 4 tarjetas navegables con Tab
- [ ] Enter y Space activan la operación
- [ ] Screen reader anuncia rol "button" + label descriptivo
- [ ] Focus visible en las 4 tarjetas
- [ ] Estilos visuales idénticos al estado actual
- [ ] Tests de accesibilidad pasando

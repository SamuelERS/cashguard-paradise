# Módulo 03: Estandarizar Botones + Eliminar Dead Import — P1

**Fecha:** 2026-02-19
**Caso:** `Caso-UX-UI-Feb-19/`
**Hallazgos:** 2.1, 7.2, 5.1

**Skills aplicados:** `vercel-react-best-practices` (component composition), `systematic-debugging` (dead import detection)

---

## Tarea A: Botones Step5SicarInput (2.1, 7.2)

### Problema

`Step5SicarInput.tsx` es el **único lugar detectado** donde se usan `<button>` raw en vez del sistema de 4 botones estandarizado.

### Ubicación Exacta

**Archivo:** `src/components/initial-wizard/steps/Step5SicarInput.tsx`
**Líneas:** 62-77

```tsx
// Líneas 62-69: Botón "Reanudar Sesión" (debería ser ConstructiveActionButton)
<button
  onClick={onResumeSession}
  className="flex-1 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors"
  aria-label="Reanudar sesión activa existente"
>
  Reanudar Sesión
</button>

// Líneas 70-77: Botón "Abortar" (debería ser DestructiveActionButton)
<button
  onClick={onAbortSession}
  className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
  aria-label="Abortar sesión activa y empezar nueva"
>
  Abortar
</button>
```

### Solución

Reemplazar `<button>` custom por componentes estandarizados:

1. **"Reanudar Sesión"** → `ConstructiveActionButton` (verde, acción afirmativa)
2. **"Abortar"** → `DestructiveActionButton` (rojo, acción destructiva)

### Consideraciones

- Preservar `aria-label` existentes
- Preservar funcionalidad `onClick` (`onResumeSession`, `onAbortSession`)
- Los componentes estandarizados soportan `className` para ajustes de tamaño
- Agregar imports necesarios (ConstructiveActionButton, DestructiveActionButton)

### Referencia del Sistema de Botones

Todos los botones del proyecto usan `React.forwardRef` + soporte `asChild` para Radix UI:

| Componente | Color | Uso |
|------------|-------|-----|
| `ConstructiveActionButton` | Verde (#065f46) | Acciones afirmativas |
| `DestructiveActionButton` | Rojo (#7f1d1d) | Acciones destructivas |
| `NeutralActionButton` | Gris | Acciones neutras |
| `PrimaryActionButton` | Azul | Acciones principales |

---

## Tarea B: Dead Import Phase2VerificationSection (5.1)

### Problema

Import de `Button` genérico que **NO se usa** en el archivo. Confirmado: `<Button` no aparece en ningún JSX.

### Ubicación Exacta

**Archivo:** `src/components/phases/Phase2VerificationSection.tsx`
**Línea:** 16

```tsx
import { Button } from '@/components/ui/button';
```

**Líneas 17-19 (correctas — SE MANTIENEN):**
```tsx
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { NeutralActionButton } from '@/components/shared/NeutralActionButton';
```

### Solución

Eliminar línea 16. Los botones estandarizados (líneas 17-19) son los que realmente se usan.

---

## Criterios de Aceptación

- [ ] Step5SicarInput: Cero `<button>` raw — solo componentes estandarizados
- [ ] Phase2VerificationSection: Import `Button` eliminado
- [ ] Funcionalidad onClick preservada en ambos botones Step5
- [ ] aria-label preservados
- [ ] `npm run build` sin errores

## Siguiente Paso

→ Ver `04_Modulo_OperationSelector_P2.md`

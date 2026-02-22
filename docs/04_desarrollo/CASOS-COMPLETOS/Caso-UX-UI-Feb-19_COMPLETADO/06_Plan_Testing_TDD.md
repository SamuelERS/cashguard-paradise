# Módulo 06: Plan de Testing TDD — Verificación Pre/Post Implementación

**Fecha:** 2026-02-19
**Caso:** `Caso-UX-UI-Feb-19/`
**Metodología:** `test-driven-development` (Red-Green-Refactor)
**Skills aplicados:** `test-driven-development` (Red-Green-Refactor obligatorio), `systematic-debugging`, `vercel-react-best-practices`

---

## Principio Rector

> **Ley de Hierro TDD:** NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.
> Escribir test → Verlo fallar → Escribir código mínimo → Verlo pasar → Refactorizar.

Cada módulo de implementación (02-05) tiene tests definidos ANTES de escribir código.
Los tests se escriben, se ejecutan (RED — deben fallar), luego se implementa el código mínimo para hacerlos pasar (GREEN).

---

## Estructura de Tests

```
src/__tests__/ux-audit/
├── glass-morphism.test.ts        ← Módulo 02 (P0)
├── button-standardization.test.ts ← Módulo 03 (P1)
├── operation-selector.test.ts     ← Módulo 04 (P2)
└── cosmetic-cleanup.test.ts       ← Módulo 05 (P3)
```

---

## Módulo 02: Glass Morphism — Tests (P0)

**Archivos bajo test:** `index.css`, `OperationSelector.tsx`, `CashResultsDisplay.tsx`, `CashCalculation.tsx`, `GuidedDenominationSection.tsx`

### Test 2.1: Cero inline `rgba(36, 36, 36, 0.4)` en componentes migrados

```typescript
// glass-morphism.test.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

const MIGRATED_FILES = [
  'src/components/operation-selector/OperationSelector.tsx',
  'src/components/cash-calculation/CashResultsDisplay.tsx',
  'src/components/CashCalculation.tsx',
  'src/components/cash-counting/guided/GuidedDenominationSection.tsx',
];

describe('Glass Morphism Unificado (Módulo 02)', () => {
  test('2.1 — Cero inline rgba(36, 36, 36, 0.4) en archivos migrados', () => {
    const INLINE_GLASS_PATTERN = /rgba\(36,\s*36,\s*36,\s*0\.4\)/;

    MIGRATED_FILES.forEach((filePath) => {
      const content = readFileSync(resolve(filePath), 'utf-8');
      expect(content).not.toMatch(INLINE_GLASS_PATTERN);
    });
  });
```

**RED esperado:** Test falla porque los 4 archivos aún contienen `rgba(36, 36, 36, 0.4)` inline.
**GREEN:** Migrar cada archivo a usar la clase CSS unificada.

### Test 2.2: Constante `glassCard` eliminada de CashResultsDisplay

```typescript
  test('2.2 — Constante glassCard eliminada de CashResultsDisplay', () => {
    const content = readFileSync(
      resolve('src/components/cash-calculation/CashResultsDisplay.tsx'),
      'utf-8'
    );
    expect(content).not.toMatch(/const\s+glassCard\s*=/);
  });
```

**RED esperado:** CashResultsDisplay.tsx líneas 25-32 contienen `const glassCard = { ... }`.
**GREEN:** Eliminar constante, reemplazar 4 usos (líneas 93, 120, 188, 199) por clase CSS.

### Test 2.3: `.glass-morphism-panel` usa variable CSS (no valor hardcoded)

```typescript
  test('2.3 — .glass-morphism-panel usa --glass-bg-primary (no hardcoded)', () => {
    const content = readFileSync(resolve('src/index.css'), 'utf-8');

    // Extraer bloque de .glass-morphism-panel
    const panelMatch = content.match(
      /\.glass-morphism-panel\s*\{[^}]+\}/s
    );
    expect(panelMatch).not.toBeNull();

    const panelBlock = panelMatch![0];
    // Debe usar la variable CSS, no un rgba hardcoded
    expect(panelBlock).toMatch(/var\(--glass-bg-primary/);
    // No debe contener rgba hardcoded para background
    expect(panelBlock).not.toMatch(/background-color:\s*rgba\(28,\s*28,\s*32/);
  });
```

**RED esperado:** `.glass-morphism-panel` usa `rgba(28, 28, 32, 0.72)` hardcoded.
**GREEN:** Actualizar clase para usar `var(--glass-bg-primary)`.

### Test 2.4: `!important` removido o justificado

```typescript
  test('2.4 — .glass-morphism-panel sin !important en background/backdrop', () => {
    const content = readFileSync(resolve('src/index.css'), 'utf-8');

    const panelMatch = content.match(
      /\.glass-morphism-panel\s*\{[^}]+\}/s
    );
    expect(panelMatch).not.toBeNull();

    const panelBlock = panelMatch![0];
    // background-color no debe usar !important
    expect(panelBlock).not.toMatch(/background-color:[^;]*!important/);
    // backdrop-filter no debe usar !important
    expect(panelBlock).not.toMatch(/backdrop-filter:[^;]*!important/);
  });
});
```

**RED esperado:** `.glass-morphism-panel` tiene `!important` en líneas 494-495.
**GREEN:** Remover `!important` después de eliminar inline styles conflictivos.

---

## Módulo 03: Botones + Dead Import — Tests (P1)

**Archivos bajo test:** `Step5SicarInput.tsx`, `Phase2VerificationSection.tsx`

### Test 3.1: Cero `<button>` raw en Step5SicarInput

```typescript
// button-standardization.test.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Estandarización Botones (Módulo 03)', () => {
  test('3.1 — Cero <button> raw en Step5SicarInput', () => {
    const content = readFileSync(
      resolve('src/components/initial-wizard/steps/Step5SicarInput.tsx'),
      'utf-8'
    );
    // No debe haber elementos <button> directos (solo componentes estandarizados)
    expect(content).not.toMatch(/<button[\s>]/);
    expect(content).not.toMatch(/<\/button>/);
  });
```

**RED esperado:** Step5SicarInput.tsx líneas 62-77 contienen dos `<button>`.
**GREEN:** Reemplazar por ConstructiveActionButton y DestructiveActionButton.

### Test 3.2: Imports de botones estandarizados presentes

```typescript
  test('3.2 — Step5SicarInput importa ConstructiveActionButton y DestructiveActionButton', () => {
    const content = readFileSync(
      resolve('src/components/initial-wizard/steps/Step5SicarInput.tsx'),
      'utf-8'
    );
    expect(content).toMatch(/import.*ConstructiveActionButton/);
    expect(content).toMatch(/import.*DestructiveActionButton/);
  });
```

**RED esperado:** Step5SicarInput no importa estos componentes.
**GREEN:** Agregar imports al migrar los botones.

### Test 3.3: Dead import `Button` eliminado de Phase2VerificationSection

```typescript
  test('3.3 — Phase2VerificationSection sin import de Button genérico', () => {
    const content = readFileSync(
      resolve('src/components/phases/Phase2VerificationSection.tsx'),
      'utf-8'
    );
    // No debe importar Button genérico de ui/button
    expect(content).not.toMatch(
      /import\s*\{[^}]*Button[^}]*\}\s*from\s*['"]@\/components\/ui\/button['"]/
    );
  });
```

**RED esperado:** Línea 16 importa `Button` de `@/components/ui/button`.
**GREEN:** Eliminar línea 16.

### Test 3.4: aria-labels preservados

```typescript
  test('3.4 — Step5SicarInput preserva aria-labels de sesión activa', () => {
    const content = readFileSync(
      resolve('src/components/initial-wizard/steps/Step5SicarInput.tsx'),
      'utf-8'
    );
    expect(content).toMatch(/aria-label.*[Rr]eanudar/);
    expect(content).toMatch(/aria-label.*[Aa]bortar/);
  });
```

**RED esperado:** Pasa actualmente (labels ya existen). Este test es de **regresión** — asegura que la migración no los pierde.
**Nota:** Este test pasa inmediatamente (es guardián, no TDD puro). Se ejecuta como parte del ciclo GREEN para confirmar no-regresión.

### Test 3.5: Funcionalidad onClick preservada

```typescript
  test('3.5 — Step5SicarInput preserva handlers onResumeSession y onAbortSession', () => {
    const content = readFileSync(
      resolve('src/components/initial-wizard/steps/Step5SicarInput.tsx'),
      'utf-8'
    );
    // Los handlers originales deben seguir conectados a los botones migrados
    expect(content).toMatch(/onResumeSession/);
    expect(content).toMatch(/onAbortSession/);
    // Deben estar en atributos onClick (no solo como props del componente)
    expect(content).toMatch(/onClick=\{.*onResumeSession/s);
    expect(content).toMatch(/onClick=\{.*onAbortSession/s);
  });
});
```

**RED esperado:** Pasa actualmente (handlers ya existen). Este test es de **regresión** — asegura que la migración de `<button>` a componentes estandarizados NO pierde la funcionalidad onClick.
**Nota:** Test guardián. Criterio explícito de `03_Modulo_Botones_Step5_P1.md`: "Funcionalidad onClick preservada en ambos botones Step5".

---

## Módulo 04: OperationSelector — Tests (P2)

**Archivo bajo test:** `OperationSelector.tsx`

### Test 4.1: `viewportScale` eliminado

```typescript
// operation-selector.test.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

const OP_SELECTOR_PATH = 'src/components/operation-selector/OperationSelector.tsx';

describe('Limpieza OperationSelector (Módulo 04)', () => {
  test('4.1 — viewportScale pattern eliminado', () => {
    const content = readFileSync(resolve(OP_SELECTOR_PATH), 'utf-8');
    expect(content).not.toMatch(/viewportScale/);
    expect(content).not.toMatch(/window\.innerWidth\s*\/\s*430/);
  });
```

**RED esperado:** Línea 27 contiene `viewportScale = Math.min(window.innerWidth / 430, 1)`.
**GREEN:** Reemplazar cálculos `${X * viewportScale}px` por valores `clamp()` puros.

### Test 4.2: Padding usa `clamp()` puro (no JS calculations)

```typescript
  test('4.2 — Paddings usan clamp() puro sin cálculos JS interpolados', () => {
    const content = readFileSync(resolve(OP_SELECTOR_PATH), 'utf-8');
    // No debe haber template literals con multiplicación para padding
    expect(content).not.toMatch(/\$\{.*\*.*viewportScale.*\}px/);
    // No debe haber Math.min(window.innerWidth
    expect(content).not.toMatch(/Math\.min\(window\.innerWidth/);
  });
```

**RED esperado:** Múltiples líneas usan ``clamp(20px, ${32 * viewportScale}px, 32px)``.
**GREEN:** Migrar a `clamp()` con valores `vw` puros.

### Test 4.3: Reducción de inline styles (máximo 8 bloques `style={{}}`)

```typescript
  test('4.3 — Máximo 8 bloques style={{}} (reducción de 16 a ≤8)', () => {
    const content = readFileSync(resolve(OP_SELECTOR_PATH), 'utf-8');
    const styleBlocks = content.match(/style=\{\{/g) || [];
    // Objetivo: reducir de 16 bloques a máximo 8
    // Solo deben quedar styles genuinamente dinámicos
    expect(styleBlocks.length).toBeLessThanOrEqual(8);
  });
});
```

**RED esperado:** Actualmente hay 16 bloques `style={{}}`.
**GREEN:** Mover propiedades repetidas a clases CSS/Tailwind.

---

## Módulo 05: Cosméticos — Tests (P3)

**Archivos bajo test:** `CashCalculation.tsx`, `Step5SicarInput.tsx`

### Test 5.1: `opacity: 1` redundante eliminado

```typescript
// cosmetic-cleanup.test.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Limpiezas Cosméticas (Módulo 05)', () => {
  test('5.1 — CashCalculation sin style={{ opacity: 1 }} redundante', () => {
    const content = readFileSync(
      resolve('src/components/CashCalculation.tsx'),
      'utf-8'
    );
    expect(content).not.toMatch(/style=\{\{\s*opacity:\s*1\s*\}\}/);
  });
```

**RED esperado:** Línea 279 contiene `style={{ opacity: 1 }}`.
**GREEN:** Remover atributo style completamente de ese div.

### Verificación 5.2: Build limpio sin errores (CLI — no vitest)

```bash
# Ejecutar DESPUÉS de que todos los tests vitest pasen (GREEN):
npm run build

# Criterio de aceptación:
# - Exit code 0 (sin errores TypeScript)
# - Sin warnings nuevos introducidos por los cambios
# - Bundle generado correctamente en dist/
```

**Tipo:** Verificación CLI obligatoria (no test vitest). Se ejecuta como paso 6 del ciclo TDD de cada módulo.
**Justificación:** `npm run build` es una verificación de integración completa que involucra TypeScript compiler + Vite bundler — no es apropiado envolverlo en un test unitario con `expect(true).toBe(true)`. Su ejecución está documentada en la sección "Orden de Ejecución TDD" paso 6.

---

## Orden de Ejecución TDD

El ciclo Red-Green-Refactor se ejecuta en el orden de prioridad de los módulos:

| Paso | Módulo | Tests | Ciclo TDD |
|------|--------|-------|-----------|
| 1 | 02 — Glass Morphism (P0) | 2.1, 2.2, 2.3, 2.4 | RED → GREEN → REFACTOR |
| 2 | 03 — Botones (P1) | 3.1, 3.2, 3.3, 3.4, 3.5 | RED → GREEN → REFACTOR |
| 3 | 04 — OperationSelector (P2) | 4.1, 4.2, 4.3 | RED → GREEN → REFACTOR |
| 4 | 05 — Cosméticos (P3) | 5.1 + build CLI | RED → GREEN → REFACTOR |

### Por cada módulo:

1. **Escribir los tests** del módulo (copiar de este documento)
2. **Ejecutar tests** → `npm test src/__tests__/ux-audit/` → Verificar que FALLAN (RED)
3. **Implementar código mínimo** según el módulo correspondiente (02-05)
4. **Ejecutar tests** → Verificar que PASAN (GREEN)
5. **Refactorizar** si es necesario (mantener tests verdes)
6. **Ejecutar `npm run build`** → Verificar 0 errores TypeScript
7. **Marcar módulo como completado** en 00_README.md

---

## Verificación Final (Checklist TDD)

Al completar TODOS los módulos:

- [ ] Cada test se escribió ANTES de implementar código
- [ ] Cada test se vio fallar (RED) por la razón correcta
- [ ] Se escribió código mínimo para pasar cada test (GREEN)
- [ ] Todos los tests pasan: `npm test src/__tests__/ux-audit/`
- [ ] Build limpio: `npm run build` → 0 errores
- [ ] Output limpio: sin warnings inesperados
- [ ] Tests usan código real (no mocks innecesarios)
- [ ] Edge cases cubiertos (archivos con variaciones, desktop overrides)
- [ ] `SHOW_REMAINING_AMOUNTS = false` sigue ocultando 5 elementos anti-fraude

---

## Anti-Patrones a Evitar

| Anti-Patrón | Por qué es problema | Qué hacer en su lugar |
|-------------|---------------------|----------------------|
| Implementar antes de escribir test | Test pasa inmediatamente, no prueba nada | Escribir test, verlo fallar, luego implementar |
| Mockear todo el DOM | Tests frágiles que no detectan bugs reales | Leer archivos reales con `readFileSync` para validación estática |
| Tests que solo verifican "no errores" | No validan el cambio correcto | Verificar presencia/ausencia de patrones específicos |
| Ignorar test que falla | Deuda técnica acumulada | Corregir inmediatamente o documentar como `skip` con justificación |
| Refactorizar durante fase GREEN | Introduce bugs innecesarios | Solo código mínimo en GREEN, refactorizar después |

---

## Verificaciones Manuales (No Automatizables)

Los siguientes criterios de aceptación **NO pueden validarse** con `readFileSync` ni vitest. Se verifican manualmente como parte del paso final post-implementación:

| # | Verificación | Método | Cuándo |
|---|-------------|--------|--------|
| M.1 | Sin cambios visuales inesperados | Inspección visual recorriendo flujo nocturno completo | Post-GREEN cada módulo |
| M.2 | Comparación viewport móvil (375px) vs desktop (1440px) | DevTools responsive mode | Post-GREEN Módulo 02 y 04 |
| M.3 | `SHOW_REMAINING_AMOUNTS = false` sigue ocultando 5 elementos | Ejecutar app con flag en `false` y verificar UI | Post-GREEN final |
| M.4 | Glass morphism visualmente consistente entre pantallas | Navegar: OperationSelector → Wizard → Phase 1 → Phase 3 | Post-GREEN Módulo 02 |
| M.5 | Botones Step5 con look & feel estandarizado | Abrir wizard con sesión activa, verificar colores verde/rojo | Post-GREEN Módulo 03 |
| M.6 | `npm run build` sin errores TypeScript | Ejecutar `npm run build` → exit code 0 | Post-GREEN cada módulo |

**Nota:** Estos criterios están documentados en `00_README.md` sección "Verificación Post-Implementación". No son TDD (no tienen ciclo RED→GREEN), pero son **obligatorios** para considerar el caso cerrado.

---

## Siguiente Paso

→ Regresar a `00_README.md` para estado general del caso
→ Iniciar Paso 1: Escribir tests Módulo 02 → Ejecutar → Verificar RED

# DACC: Corrección AppFooter viewportScale + Contrato TDD

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminar el anti-patrón `viewportScale` de `AppFooter.tsx` y crear su test de contrato estático.

**Architecture:** Mismo patrón aplicado en OT #078-079 (OperationSelector). `viewportScale = Math.min(window.innerWidth/430, 1)` se reemplaza con valores `clamp()` puros. El test es estático (readFileSync + regex, sin render ni jsdom).

**Tech Stack:** React 18, TypeScript, Vitest, Tailwind CSS, `clamp()` CSS

---

## Diagnóstico previo: estado real vs. informe del Director

El análisis forensic contra `origin/main` y los branches disponibles arroja:

| Corrección | Reportada | Estado Real | Acción |
|------------|-----------|-------------|--------|
| #1 AppFooter viewportScale | Introducido por rama | Pre-existente en origin/main. La rama NO lo introdujo pero DEBE corregirlo antes del merge. | **Ejecutar** |
| #2 supervisorTodayOrdering.ts eliminado | CortesDelDia línea 8 importa el archivo | `supervisorTodayOrdering.ts` **nunca existió** en origin/main ni en esta rama. `grep -r supervisorTodayOrdering src/` → 0 resultados. CortesDelDia línea 8 importa `useCallback`, no el archivo mencionado. | No aplica — sin acción |
| #3 688 líneas de tests eliminadas | 9 archivos borrados | 6 de los 9 **nunca existieron** en origin/main. Los 3 que existen (`CorteListaItem.status-label`, `useCorteSesion`, `useSupervisorQueries.daily-reconciliation`) están **intactos** en la rama. `AppFooter.contract.test.tsx` no existe y se crea como parte de esta corrección. | Crear `AppFooter.contract.test.tsx` |
| #4 CorteDetalle.tsx 483 líneas eliminadas | Funciones eliminadas | CorteDetalle.tsx tiene **948 líneas** en origin/main y en esta rama. Idéntico. | No aplica — sin acción |
| #5 5 docs/plans eliminados | Archivos destruidos | Los 5 archivos (fechas 2026-02-26) **nunca existieron** en origin/main. `git ls-tree origin/main docs/plans/` confirmado. | No aplica — sin acción |
| #6 useCorteSesion.ts eliminado | Hook desaparecido | `useCorteSesion.ts` existe con **902 líneas** tanto en origin/main como en esta rama. | No aplica — sin acción |

**Conclusión:** La única corrección con evidencia objetiva y ejecutable es la **#1** (viewportScale en AppFooter) y la creación del test de contrato asociado (**#3** parcial).

---

## Conversión de valores viewportScale → clamp puro

Fórmula: `${X * viewportScale}px` donde viewportScale = min(width/430, 1).
Equivalencia CSS: `clamp(MIN, X/430*100vw, MAX)` = `clamp(MIN, X * 0.2326vw, MAX)`.

| Expresión JS original | Valor clamp puro |
|----------------------|-----------------|
| `clamp(12px, ${16 * viewportScale}px, 20px)` | `clamp(12px, 3.7vw, 20px)` |
| `clamp(8px, ${12 * viewportScale}px, 16px)` | `clamp(8px, 2.8vw, 16px)` |
| `clamp(16px, ${24 * viewportScale}px, 32px)` | `clamp(16px, 5.6vw, 32px)` |
| `clamp(10px, ${14 * viewportScale}px, 18px)` | `clamp(10px, 3.3vw, 18px)` |
| `clamp(14px, ${20 * viewportScale}px, 24px)` | `clamp(14px, 4.7vw, 24px)` |
| `clamp(16px, ${20 * viewportScale}px, 24px)` | `clamp(16px, 4.7vw, 24px)` |
| `clamp(8px, ${12 * viewportScale}px, 16px)` | `clamp(8px, 2.8vw, 16px)` (repetición) |

---

## Task 1: TDD RED — escribir test de contrato AppFooter

**Files:**
- Create: `src/components/__tests__/AppFooter.contract.test.tsx`

**Step 1: Escribir el test estático (readFileSync + regex)**

```typescript
// src/components/__tests__/AppFooter.contract.test.tsx
// Test estático — sin render ni jsdom. Sólo inspecciona el código fuente.
// Patrón DACC v3.5.0: "tests estáticos como contrato de calidad"
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

const src = readFileSync(
  resolve(__dirname, '../AppFooter.tsx'),
  'utf8'
);

describe('AppFooter — contrato UX/UI P2', () => {
  it('no usa viewportScale (anti-patrón eliminado en v3.5.0)', () => {
    expect(src).not.toMatch(/viewportScale/);
  });

  it('no usa Math.min(window.innerWidth', () => {
    expect(src).not.toMatch(/Math\.min\(window\.innerWidth/);
  });

  it('no usa template literals con px para padding dinámico', () => {
    // Prohibido: `${X * viewportScale}px`
    expect(src).not.toMatch(/\$\{.*viewportScale.*\}px/);
  });

  it('usa export named (no default export)', () => {
    expect(src).toMatch(/export function AppFooter/);
    expect(src).not.toMatch(/export default/);
  });
});
```

**Step 2: Ejecutar el test — debe FALLAR (RED)**

```bash
npx vitest run src/components/__tests__/AppFooter.contract.test.tsx --reporter=verbose
```

Resultado esperado: FAIL en los 3 primeros tests (viewportScale detectado).

---

## Task 2: GREEN — eliminar viewportScale de AppFooter.tsx

**Files:**
- Modify: `src/components/AppFooter.tsx`

**Step 1: Eliminar la línea de declaración de viewportScale (línea 10)**

Eliminar completamente:
```typescript
const viewportScale = typeof window !== 'undefined' ? Math.min(window.innerWidth / 430, 1) : 1;
```

**Step 2: Reemplazar los 7 usos en las 3 variantes**

_Variante `minimal` (líneas ~21 y ~27):_

```typescript
// ANTES:
style={{ padding: `clamp(12px, ${16 * viewportScale}px, 20px)` }}
// DESPUÉS:
style={{ padding: 'clamp(12px, 3.7vw, 20px)' }}

// ANTES:
padding: `clamp(8px, ${12 * viewportScale}px, 16px) clamp(16px, ${24 * viewportScale}px, 32px)`,
// DESPUÉS:
padding: 'clamp(8px, 2.8vw, 16px) clamp(16px, 5.6vw, 32px)',
```

_Variante `floating` (línea ~101):_

```typescript
// ANTES:
padding: `clamp(10px, ${14 * viewportScale}px, 18px) clamp(14px, ${20 * viewportScale}px, 24px)`,
// DESPUÉS:
padding: 'clamp(10px, 3.3vw, 18px) clamp(14px, 4.7vw, 24px)',
```

_Variante `elegant` (líneas ~194-195):_

```typescript
// ANTES:
padding: `clamp(16px, ${20 * viewportScale}px, 24px)`,
gap: `clamp(8px, ${12 * viewportScale}px, 16px)`,
// DESPUÉS:
padding: 'clamp(16px, 4.7vw, 24px)',
gap: 'clamp(8px, 2.8vw, 16px)',
```

**Step 3: Actualizar comment de versión**

```typescript
// 🤖 [IA] - v1.0.1 - Footer corporativo — viewportScale eliminado (patrón DACC v3.5.0 P2)
```

**Step 4: Ejecutar el test — debe PASAR (GREEN)**

```bash
npx vitest run src/components/__tests__/AppFooter.contract.test.tsx --reporter=verbose
```

Resultado esperado: 4/4 PASS.

---

## Task 3: Validación final Director

**Step 1: TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

**Step 2: Grep viewportScale**

```bash
grep -r "viewportScale" src/
```

Resultado esperado: 0 resultados.

**Step 3: Grep supervisorTodayOrdering**

```bash
grep -r "supervisorTodayOrdering" src/
```

Resultado esperado: 0 resultados (confirma que #2 no existe y no es issue).

**Step 4: Grep useCorteSesion**

```bash
grep -r "useCorteSesion" src/
```

Resultado esperado: archivo existe con importadores legítimos (no fue eliminado).

**Step 5: Build**

```bash
npm run build
```

Resultado esperado: build exitoso.

---

## Task 4: Commit

**Step 1: Staging**

```bash
git add src/components/AppFooter.tsx src/components/__tests__/AppFooter.contract.test.tsx
```

**Step 2: Commit message**

```
fix(ux-audit): eliminar viewportScale de AppFooter + contrato TDD

CORRECCI\u00d3N #1 (CRÍTICA): Anti-patrón viewportScale eliminado de AppFooter.tsx.
El cálculo Math.min(window.innerWidth/430, 1) fue reemplazado por valores
clamp() puros siguiendo el patrón DACC v3.5.0 P2 (OT #078-079).

CORRECCI\u00d3N #3 (parcial): Creado AppFooter.contract.test.tsx — test estático
readFileSync que verifica ausencia de viewportScale como contrato de calidad.

Diagnóstico de correcciones #2/#4/#5/#6:
- #2 supervisorTodayOrdering: ZERO hallazgos — archivo nunca existió en
  origin/main ni en esta rama. CortesDelDia.tsx no lo importa.
- #4 CorteDetalle.tsx: 948 líneas intactas, idéntico a origin/main.
- #5 docs/plans: 5 archivos fechados 2026-02-26 nunca existieron en origin/main.
- #6 useCorteSesion.ts: 902 líneas presentes, idéntico a origin/main.

Validaciones:
- npx tsc --noEmit → 0 errores
- grep -r "viewportScale" src/ → 0 resultados
- grep -r "supervisorTodayOrdering" src/ → 0 resultados
- npm run build → exitoso
```

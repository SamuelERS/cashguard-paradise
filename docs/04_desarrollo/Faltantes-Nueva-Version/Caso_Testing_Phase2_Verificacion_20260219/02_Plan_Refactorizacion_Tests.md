> ⚠️ Corregido 2026-02-19: Tests totales son 100 (86 activos + 14 skipped), no 86. Objetivo final corregido a 100/100. Referencias a "72 activos" corregidas a 86.

# Plan de Refactorizacion: Tests Phase2VerificationSection

**Caso:** Testing Phase2 Verificacion
**Fecha:** 19 de febrero 2026
**Objetivo:** Llevar tests de ~33% passing a 100% passing (100/100 incluyendo 14 skipped reactivados)
**Esfuerzo total:** 7-10 horas en 3 fases
**Prerequisito:** Leer `01_Diagnostico_Tests_Actuales.md` antes de empezar

---

## Fase 1: Quick Wins (2-3 horas)

**Objetivo:** ~28 passing -> ~45 passing (62%)
**Root Causes atacados:** RC1 (basico), RC2, RC3

### Task 1.1: Actualizar helper getCurrentInput()

**Files:**
- Modify: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx:82-85`

**Step 1: Localizar el helper actual**

```typescript
// Linea ~82 actual:
const getCurrentInput = () => {
  const inputs = screen.getAllByRole('textbox');
  return inputs[0];
};
```

**Step 2: Reemplazar con version robusta**

```typescript
const getCurrentInput = () => {
  const inputs = screen.getAllByRole('textbox');
  // Filtrar inputs bloqueados por modal overlay de Radix UI
  const visibleInput = inputs.find(input =>
    !input.closest('[aria-hidden="true"]')
  );
  return visibleInput || inputs[0];
};
```

**Step 3: Verificar que tests de Grupo 1 siguen passing**

Run: `npx vitest run src/components/phases/__tests__/Phase2VerificationSection.test.tsx --reporter=verbose 2>&1 | head -80`

Expected: Grupo 1 (8 tests) sigue 100% passing

---

### Task 1.2: Crear helper waitForModal()

**Files:**
- Modify: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx` (agregar despues de getCurrentInput)

**Step 1: Agregar helper**

```typescript
const waitForModal = async () => {
  await waitFor(() => {
    expect(screen.queryByRole('alertdialog')).toBeInTheDocument();
  }, { timeout: 5000 });
};

const findModalElement = async (text: string | RegExp) => {
  await waitForModal();
  return screen.findByText(text, {}, { timeout: 3000 });
};

const clickModalButtonSafe = async (
  user: ReturnType<typeof userEvent.setup>,
  text: string | RegExp
) => {
  const button = await findModalElement(text);
  await user.click(button);
};
```

**Step 2: No ejecutar aun (helpers se usan en Tasks siguientes)**

---

### Task 1.3: Migrar getByText sincronos a findByText async (Grupo 2)

**Files:**
- Modify: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx`

**Que hacer:**
Buscar en tests del Grupo 2 (Primer Intento Correcto) todas las instancias de:
```typescript
screen.getByText('Volver a contar')
screen.getByText('Verificación Exitosa')
screen.getByText(/Cantidad correcta/)
```

Reemplazar por:
```typescript
await screen.findByText('Volver a contar', {}, { timeout: 3000 })
await screen.findByText('Verificación Exitosa', {}, { timeout: 3000 })
await screen.findByText(/Cantidad correcta/, {}, { timeout: 3000 })
```

**Step 1: Hacer replacements en Grupo 2**
**Step 2: Ejecutar solo Grupo 2**

Run: `npx vitest run src/components/phases/__tests__/Phase2VerificationSection.test.tsx -t "Primer Intento Correcto" --reporter=verbose`

Expected: Mejora de ~6 passing a ~10 passing

---

### Task 1.4: Agregar waitFor en transiciones de denominacion (Grupo 2 y 7)

**Files:**
- Modify: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx`

**Que hacer:**
Buscar verificaciones de transicion como:
```typescript
expect(screen.getByText(/Cinco centavos/i)).toBeInTheDocument();
```

Envolver con waitFor:
```typescript
await waitFor(() => {
  expect(screen.getByText(/Cinco centavos/i)).toBeInTheDocument();
}, { timeout: 3000 });
```

**Step 1: Hacer replacements en tests de transicion**
**Step 2: Ejecutar suite completa**

Run: `npx vitest run src/components/phases/__tests__/Phase2VerificationSection.test.tsx --reporter=verbose`

Expected: ~45 de 86 activos passing (52%)

**Step 3: Commit**

```bash
git add src/components/phases/__tests__/Phase2VerificationSection.test.tsx
git commit -m "test(phase2): fase 1 quick wins - async queries + getCurrentInput fix"
```

---

## Fase 2: Modales Async Completos (3-4 horas)

**Objetivo:** ~45 passing -> ~65 passing (~76%)
**Root Causes atacados:** RC1 (completo), RC2 (completo)

### Task 2.1: Migrar Grupo 3 (Primer Intento Incorrecto)

**Files:**
- Modify: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx`

**Patron a aplicar en cada test del Grupo 3:**

```typescript
// 1. Ingresar valor incorrecto
const input = getCurrentInput();
await user.clear(input);
await user.type(input, '40'); // incorrecto (esperado: 44)
await user.keyboard('{Enter}');

// 2. Esperar modal (CRITICO - usar helper async)
await clickModalButtonSafe(user, 'Volver a contar');

// 3. Esperar que modal se cierre
await waitFor(() => {
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
}, { timeout: 3000 });

// 4. Verificar que input esta disponible de nuevo
await waitFor(() => {
  const newInput = getCurrentInput();
  expect(newInput).toBeInTheDocument();
});
```

**Step 1: Aplicar patron a los ~12 tests activos del Grupo 3**
**Step 2: Ejecutar Grupo 3**

Run: `npx vitest run src/components/phases/__tests__/Phase2VerificationSection.test.tsx -t "Primer Intento Incorrecto" --reporter=verbose`

Expected: ~3 passing -> ~10 passing

---

### Task 2.2: Migrar Grupo 4 (Segundo Intento Patterns)

**Files:**
- Modify: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx`

**Patrones especificos:**

Para `warning_retry` (error + correcto):
```typescript
// Intento 1: incorrecto
await enterValue(user, 40);
await clickModalButtonSafe(user, 'Volver a contar');
await waitForModalClose();
// Intento 2: correcto
await enterValue(user, 44);
```

Para `warning_override` (mismo error 2 veces):
```typescript
// Intento 1: incorrecto
await enterValue(user, 40);
await clickModalButtonSafe(user, 'Volver a contar');
await waitForModalClose();
// Intento 2: mismo incorrecto
await enterValue(user, 40);
await clickModalButtonSafe(user, /Forzar valor/i);
```

**Step 1: Aplicar patrones a los ~15 tests activos del Grupo 4**
**Step 2: Ejecutar Grupo 4**

Expected: ~3 passing -> ~12 passing

---

### Task 2.3: Migrar Grupo 5 (Tercer Intento Patterns)

**Files:**
- Modify: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx`

**Patron para 3 intentos (critical_severe / critical_inconsistent):**

```typescript
// Intento 1: incorrecto
await enterValue(user, 40);
await clickModalButtonSafe(user, 'Volver a contar');
await waitForModalClose();
// Intento 2: diferente incorrecto
await enterValue(user, 42);
await clickModalButtonSafe(user, /tercer intento/i);
await waitForModalClose();
// Intento 3: otro valor
await enterValue(user, 45);
// Modal de resultado aparece
await waitForModal();
await clickModalButtonSafe(user, /Aceptar/i);
```

**Step 1: Aplicar patron a los ~13 tests activos del Grupo 5**
**Step 2: Ejecutar suite completa**

Expected: ~65 de 86 activos passing (~76%)

**Step 3: Commit**

```bash
git add src/components/phases/__tests__/Phase2VerificationSection.test.tsx
git commit -m "test(phase2): fase 2 modales async - grupos 3, 4, 5 migrados"
```

---

## Fase 3: Edge Cases y Limpieza (2-3 horas)

**Objetivo:** ~65 passing -> 100/100 (100%, incluyendo 14 skipped reactivados)
**Root Causes atacados:** RC4, tests skipped

### Task 3.1: Debug buildVerificationBehavior edge cases (Grupo 6)

**Files:**
- Modify: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx`

**Que hacer:**
1. Ejecutar solo Grupo 6 con `--reporter=verbose`
2. Para cada test que falla, agregar `console.log` del objeto `VerificationBehavior` retornado
3. Comparar `denominationsWithIssues.length` esperado vs real
4. Ajustar assertions si el componente cambio de comportamiento desde que se escribieron los tests

**Step 1: Ejecutar Grupo 6 y documentar fallos exactos**

Run: `npx vitest run src/components/phases/__tests__/Phase2VerificationSection.test.tsx -t "buildVerificationBehavior" --reporter=verbose`

**Step 2: Fix individual por cada test que falla**
**Step 3: Ejecutar de nuevo hasta 100% en Grupo 6**

---

### Task 3.2: Reactivar tests con it.skip

**Files:**
- Modify: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx`

**Que hacer:**
1. Buscar todos los `it.skip(` (14 instancias)
2. Reactivar UNO a la vez cambiando `it.skip(` por `it(`
3. Ejecutar suite despues de cada reactivacion
4. Si falla: aplicar los patrones async de Fases 1-2
5. Si pasa: continuar con el siguiente

**Step 1: Listar los 14 tests skipped**

Run: `grep -n "it.skip" src/components/phases/__tests__/Phase2VerificationSection.test.tsx`

**Step 2: Reactivar uno a la vez, ejecutar, fix si necesario**
**Step 3: Repetir hasta 0 tests skipped**

---

### Task 3.3: Optimizar timeouts de la suite

**Files:**
- Modify: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx`

**Que hacer:**
1. Revisar que ningun `timeout` individual supere 5000ms (suficiente para CI)
2. Revisar que el timeout del test wrapper no supere 30000ms
3. Si la suite completa tarda >60s, identificar tests lentos y optimizar

**Step 1: Ejecutar suite completa y medir duracion**

Run: `npx vitest run src/components/phases/__tests__/Phase2VerificationSection.test.tsx --reporter=verbose`

Expected: 100/100 passing (incluyendo 14 reactivados), duracion < 30s local

**Step 2: Commit final**

```bash
git add src/components/phases/__tests__/Phase2VerificationSection.test.tsx
git commit -m "test(phase2): fase 3 edge cases + reactivar skipped - 100% coverage"
```

---

## Resumen de Esfuerzo

| Fase | Tasks | Horas | Resultado |
|------|-------|-------|-----------|
| Fase 1 | 4 tasks | 2-3 h | ~45 de 86 activos passing (~52%) |
| Fase 2 | 3 tasks | 3-4 h | ~65 de 86 activos passing (~76%) |
| Fase 3 | 3 tasks | 2-3 h | 100/100 passing (14 skipped reactivados) |
| **Total** | **10 tasks** | **7-10 h** | **100/100 passing** |

## Criterios de Aceptacion

- [ ] 100/100 tests passing (0 skipped, 0 failing) — 86 activos actuales + 14 reactivados de `it.skip`
- [ ] Duracion suite < 30s local, < 60s Docker
- [ ] TypeScript: `npx tsc --noEmit` -> 0 errors
- [ ] ESLint: 0 errors en test file
- [ ] Zero `any` types en test file
- [ ] CI/CD pipeline verde

---

*Documento creado: 19 de febrero 2026*
*Proyecto: CashGuard Paradise*

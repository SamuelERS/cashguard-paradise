# Plan Suite Tests Completa: Phase2VerificationSection

**Fecha:** 09 de Octubre 2025
**Objetivo:** 87 tests con 100% coverage (lines + branches)
**Duración estimada:** 3 horas implementación
**Archivo test:** `Phase2VerificationSection.test.tsx`

---

## 📊 Inventario Completo Tests (87 tests)

### Grupo 1: Inicialización & Props (8 tests) - 15 min

```typescript
describe('Grupo 1: Inicialización & Props', () => {
  it('1.1 - Renderiza con props mínimas sin errores', () => {
    const { container } = renderPhase2Verification();
    expect(container).toBeInTheDocument();
  });

  it('1.2 - Muestra título "VERIFICACIÓN EN CAJA"', () => {
    const { getByText } = renderPhase2Verification();
    expect(getByText(/VERIFICACIÓN EN CAJA/i)).toBeInTheDocument();
  });

  it('1.3 - Contador pasos muestra "1/7" inicial', () => {
    const { getByText } = renderPhase2Verification();
    expect(getByText(/1\/7/i)).toBeInTheDocument();
  });

  it('1.4 - Badge "Queda en Caja" visible', () => {
    const { getByText } = renderPhase2Verification();
    expect(getByText(/Queda en Caja/i)).toBeInTheDocument();
  });

  it('1.5 - Input primera denominación tiene focus', () => {
    const { getByRole } = renderPhase2Verification();
    const input = getByRole('spinbutton');
    expect(input).toHaveFocus();
  });

  it('1.6 - Label primera denominación "Un centavo"', () => {
    const { getByText } = renderPhase2Verification();
    expect(getByText(/Un centavo/i)).toBeInTheDocument();
  });

  it('1.7 - Botón "Confirmar" deshabilitado si input vacío', () => {
    const { getByText } = renderPhase2Verification();
    const btn = getByText('Confirmar').closest('button');
    expect(btn).toBeDisabled();
  });

  it('1.8 - Navigation buttons estado inicial correcto', () => {
    const { getByText, getByLabelText } = renderPhase2Verification();
    expect(getByText('Cancelar')).toBeEnabled();
    expect(getByText('Anterior')).toBeDisabled(); // Primer paso
  });
});
```

**Coverage esperado después:** ~10%

---

### Grupo 2: Primer Intento Correcto (12 tests) - 20 min

```typescript
describe('Grupo 2: Primer Intento Correcto (Happy Path)', () => {
  it('2.1 - Input acepta valor correcto (65)', async () => {
    const { getByRole } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '65'); // Valor correcto para penny
    expect(input).toHaveValue('65');
  });

  it('2.2 - Enter key confirma valor correcto', async () => {
    const onStepComplete = vi.fn();
    const { getByRole } = renderPhase2Verification({ onStepComplete });

    const input = getByRole('spinbutton');
    await userEvent.type(input, '65{Enter}');

    await waitFor(() => {
      expect(onStepComplete).toHaveBeenCalledWith('penny');
    });
  });

  it('2.3 - Auto-advance a siguiente denominación', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '65{Enter}');

    await waitFor(() => {
      // Siguiente denominación "nickel" visible
      expect(getByText(/Cinco centavos/i)).toBeInTheDocument();
    });
  });

  it('2.4 - attemptHistory Map NO registra primer intento correcto', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    const { getByRole } = renderPhase2Verification({
      onVerificationBehaviorCollected
    });

    // Completar todas denominaciones correctamente
    for (const step of mockVerificationSteps) {
      const input = getByRole('spinbutton');
      await userEvent.type(input, `${step.quantity}{Enter}`);
    }

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
      const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
      expect(behavior.totalAttempts).toBe(0); // Sin errores = sin intentos registrados
    });
  });

  it('2.5 - onStepComplete ejecutado con denominación correcta', async () => {
    const onStepComplete = vi.fn();
    const { getByRole } = renderPhase2Verification({ onStepComplete });

    const input = getByRole('spinbutton');
    await userEvent.type(input, '65{Enter}');

    await waitFor(() => {
      expect(onStepComplete).toHaveBeenCalledWith('penny');
      expect(onStepComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('2.6 - Input siguiente denominación recibe focus automáticamente', async () => {
    const { getByRole } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '65{Enter}');

    await waitFor(() => {
      expect(input).toHaveFocus(); // Mismo input, nueva denominación
    });
  });

  it('2.7 - Contador pasos avanza "1/7" → "2/7"', async () => {
    const { getByRole, getByText } = renderPhase2Verification();

    const input = getByRole('spinbutton');
    await userEvent.type(input, '65{Enter}');

    await waitFor(() => {
      expect(getByText(/2\/7/i)).toBeInTheDocument();
    });
  });

  it('2.8 - Modal NO aparece con valor correcto', async () => {
    const { getByRole, queryByText } = renderPhase2Verification();

    const input = getByRole('spinbutton');
    await userEvent.type(input, '65{Enter}');

    await waitFor(() => {
      expect(queryByText(/Verificación necesaria/i)).not.toBeInTheDocument();
    });
  });

  it('2.9 - Denominación completada marcada visualmente', async () => {
    const { getByRole, getByText } = renderPhase2Verification();

    const input = getByRole('spinbutton');
    await userEvent.type(input, '65{Enter}');

    await waitFor(() => {
      // Progreso muestra "✅ 1/7"
      expect(getByText(/✅ 1\/7/i)).toBeInTheDocument();
    });
  });

  it('2.10 - Click botón "Confirmar" funciona', async () => {
    const onStepComplete = vi.fn();
    const { getByRole, getByText } = renderPhase2Verification({ onStepComplete });

    const input = getByRole('spinbutton');
    await userEvent.type(input, '65');

    const btn = getByText('Confirmar');
    await userEvent.click(btn);

    await waitFor(() => {
      expect(onStepComplete).toHaveBeenCalledWith('penny');
    });
  });

  it('2.11 - Valores numéricos válidos aceptados (enteros positivos)', async () => {
    const { getByRole } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '123');
    expect(input).toHaveValue('123');
  });

  it('2.12 - Todos pasos correctos → onSectionComplete ejecuta', async () => {
    const onSectionComplete = vi.fn();
    const { getByRole } = renderPhase2Verification({ onSectionComplete });

    // Completar todas 7 denominaciones correctamente
    for (const step of mockVerificationSteps) {
      const input = getByRole('spinbutton');
      await userEvent.type(input, `${step.quantity}{Enter}`);
    }

    await waitFor(() => {
      expect(onSectionComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});
```

**Coverage esperado después:** ~30%

---

### Grupo 3: Primer Intento Incorrecto → Modal (15 tests) - 30 min

```typescript
describe('Grupo 3: Primer Intento Incorrecto → Modal', () => {
  it('3.1 - Input valor incorrecto (66 ≠ 65)', async () => {
    const { getByRole } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '66');
    expect(input).toHaveValue('66');
  });

  it('3.2 - Modal "incorrect" aparece', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      expect(getByText(/Verificación necesaria/i)).toBeInTheDocument();
    });
  });

  it('3.3 - Modal muestra título correcto', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      expect(getByText(/Dato Incorrecto/i)).toBeInTheDocument();
    });
  });

  it('3.4 - Modal muestra mensaje explicativo', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      expect(getByText(/Volver a contar/i)).toBeInTheDocument();
    });
  });

  it('3.5 - Botón "Volver a contar" visible y habilitado', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      const btn = getByText('Volver a contar');
      expect(btn).toBeInTheDocument();
      expect(btn).toBeEnabled();
    });
  });

  it('3.6 - Botón "Forzar" visible pero DESHABILITADO (primer intento)', async () => {
    const { getByRole, queryByText } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      // Modal "incorrect" NO tiene botón "Forzar"
      expect(queryByText(/Forzar/i)).not.toBeInTheDocument();
    });
  });

  it('3.7 - [v1.3.6h] Input blur cuando modal abre', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton') as HTMLInputElement;

    expect(input).toHaveFocus(); // Inicialmente con focus

    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      expect(getByText(/Verificación necesaria/i)).toBeInTheDocument();
      expect(input).not.toHaveFocus(); // Pierde focus cuando modal abre
    });
  });

  it('3.8 - [v1.3.6h] Enter key NO registra mismo valor con modal abierto', async () => {
    const onStepComplete = vi.fn();
    const { getByRole, getByText } = renderPhase2Verification({ onStepComplete });
    const input = getByRole('spinbutton');

    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      expect(getByText(/Verificación necesaria/i)).toBeInTheDocument();
    });

    // Intentar Enter de nuevo con modal abierto
    await userEvent.keyboard('{Enter}');

    // onStepComplete NO debe ejecutar segunda vez
    expect(onStepComplete).not.toHaveBeenCalled();
  });

  it('3.9 - Click "Volver a contar" cierra modal', async () => {
    const { getByRole, getByText, queryByText } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      expect(getByText(/Verificación necesaria/i)).toBeInTheDocument();
    });

    const btn = getByText('Volver a contar');
    await userEvent.click(btn);

    await waitFor(() => {
      expect(queryByText(/Verificación necesaria/i)).not.toBeInTheDocument();
    });
  });

  it('3.10 - Input recupera focus después de cerrar modal', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton') as HTMLInputElement;

    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      expect(getByText(/Verificación necesaria/i)).toBeInTheDocument();
    });

    const btn = getByText('Volver a contar');
    await userEvent.click(btn);

    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it('3.11 - Input se limpia después de cerrar modal', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton') as HTMLInputElement;

    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      expect(getByText(/Verificación necesaria/i)).toBeInTheDocument();
    });

    const btn = getByText('Volver a contar');
    await userEvent.click(btn);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('3.12 - attemptHistory registra primer intento incorrecto', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    const { getByRole } = renderPhase2Verification({
      onVerificationBehaviorCollected
    });

    const input = getByRole('spinbutton');
    await userEvent.type(input, '66{Enter}'); // Primer intento incorrecto

    // Completar resto correctamente
    for (let i = 1; i < mockVerificationSteps.length; i++) {
      const step = mockVerificationSteps[i];
      await userEvent.type(input, `${step.quantity}{Enter}`);
    }

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
      const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
      expect(behavior.totalAttempts).toBeGreaterThan(0);
    });
  });

  it('3.13 - Contador pasos NO avanza con error', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      expect(getByText(/Verificación necesaria/i)).toBeInTheDocument();
      expect(getByText(/1\/7/i)).toBeInTheDocument(); // Sigue en paso 1
    });
  });

  it('3.14 - Segundo intento correcto → warning_retry', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    const { getByRole, getByText } = renderPhase2Verification({
      onVerificationBehaviorCollected
    });
    const input = getByRole('spinbutton');

    // Primer intento incorrecto
    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      expect(getByText(/Verificación necesaria/i)).toBeInTheDocument();
    });

    // Click "Volver a contar"
    await userEvent.click(getByText('Volver a contar'));

    // Segundo intento correcto
    await userEvent.type(input, '65{Enter}');

    // Completar resto denominaciones
    for (let i = 1; i < mockVerificationSteps.length; i++) {
      const step = mockVerificationSteps[i];
      await userEvent.type(input, `${step.quantity}{Enter}`);
    }

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
      const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
      expect(behavior.secondAttemptSuccesses).toBe(1);
    });
  });

  it('3.15 - attemptHistory contiene 2 intentos (incorrecto + correcto)', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    const { getByRole, getByText } = renderPhase2Verification({
      onVerificationBehaviorCollected
    });
    const input = getByRole('spinbutton');

    // Primer intento incorrecto + segundo correcto (como test 3.14)
    await userEvent.type(input, '66{Enter}');
    await waitFor(() => getByText(/Verificación necesaria/i));
    await userEvent.click(getByText('Volver a contar'));
    await userEvent.type(input, '65{Enter}');

    // Completar resto
    for (let i = 1; i < mockVerificationSteps.length; i++) {
      const step = mockVerificationSteps[i];
      await userEvent.type(input, `${step.quantity}{Enter}`);
    }

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
      const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
      expect(behavior.totalAttempts).toBe(2); // 1 incorrecto + 1 correcto
    });
  });
});
```

**Coverage esperado después:** ~50%

---

### Grupo 4: Segundo Intento Patterns (20 tests) - 35 min

**Pattern [A, A] - Mismo valor incorrecto dos veces (6 tests):**
```typescript
describe('Grupo 4.1: Pattern [A, A] - Force Override', () => {
  it('4.1 - [44, 44] → Modal "force-same" aparece', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    // Primer intento: 44
    await userEvent.type(input, '44{Enter}');
    await waitFor(() => getByText(/Dato Incorrecto/i));
    await userEvent.click(getByText('Volver a contar'));

    // Segundo intento: 44 (mismo valor)
    await userEvent.type(input, '44{Enter}');

    await waitFor(() => {
      expect(getByText(/mismo valor incorrecto dos veces/i)).toBeInTheDocument();
    });
  });

  it('4.2 - Modal muestra mensaje correcto force-same', async () => {
    // Similar a 4.1 con assertions diferentes
  });

  it('4.3 - Botón "Forzar este valor" HABILITADO', async () => {
    // Similar a 4.1 + verificar botón habilitado
  });

  it('4.4 - Click "Forzar" ejecuta handleForce()', async () => {
    const onStepComplete = vi.fn();
    const { getByRole, getByText } = renderPhase2Verification({ onStepComplete });

    // ... setup [44, 44]
    const btnForce = getByText(/Forzar este valor/i);
    await userEvent.click(btnForce);

    await waitFor(() => {
      expect(onStepComplete).toHaveBeenCalled();
    });
  });

  it('4.5 - [v1.3.6M] handleForce() limpia attemptHistory', async () => {
    // Verificar que clearAttemptHistory ejecuta en handleForce
  });

  it('4.6 - onStepComplete ejecutado después de force', async () => {
    // Similar a 4.4 con assertion específica callback
  });
});
```

**Pattern [A, B] donde B correcto (7 tests):**
```typescript
describe('Grupo 4.2: Pattern [A, B] Segundo Correcto', () => {
  it('4.7 - [44, 43] → Auto-advance (valor correcto)', async () => {
    // Primer 44 → Modal → Segundo 43 → Avanza sin modal
  });

  it('4.8 - Modal NO aparece cuando segundo correcto', async () => {
    // queryByText modal debe ser null
  });

  it('4.9 - attemptHistory registra AMBOS intentos', async () => {
    // totalAttempts === 2
  });

  it('4.10 - Severity: warning_retry', async () => {
    // denominationsWithIssues[0].severity === 'warning_retry'
  });

  it('4.11 - onStepComplete ejecutado con denominación', async () => {
    // Callback con key correcto
  });

  it('4.12 - Siguiente denominación recibe focus', async () => {
    // input.toHaveFocus()
  });

  it('4.13 - Contador pasos avanza "1/7" → "2/7"', async () => {
    // getByText(/2\/7/)
  });
});
```

**Pattern [A, B] donde B incorrecto diferente (7 tests):**
```typescript
describe('Grupo 4.3: Pattern [A, B] Requiere Tercer Intento', () => {
  it('4.14 - [44, 42] → Modal "require-third" aparece', async () => {
    // Modal específico tercer intento
  });

  it('4.15 - Modal muestra mensaje correcto', async () => {
    // "Los 2 intentos son montos diferentes"
  });

  it('4.16 - Modal muestra ambos intentos (44, 42)', async () => {
    // Verificar display valores
  });

  it('4.17 - Botón "Intentar tercera vez" visible', async () => {
    // Button existe y habilitado
  });

  it('4.18 - Botón "Forzar" NO visible (tercer intento obligatorio)', async () => {
    // queryByText('Forzar') null
  });

  it('4.19 - Click "Intentar" cierra modal', async () => {
    // Modal desaparece
  });

  it('4.20 - attemptHistory registra ambos intentos', async () => {
    // totalAttempts >= 2
  });
});
```

**Coverage esperado después:** ~70%

---

### Grupo 5: Tercer Intento Patterns (18 tests) - 30 min

**Pattern [A, B, C] critical_severe (6 tests):**
```typescript
describe('Grupo 5.1: Pattern [A,B,C] - Todos Diferentes', () => {
  it('5.1 - [66, 64, 68] → Modal "third-result" aparece', async () => {
    // Setup 3 intentos diferentes + modal final
  });

  it('5.2 - Modal muestra severity "critical_severe"', async () => {
    // Título "Falta Muy Grave"
  });

  it('5.3 - Modal muestra mensaje crítico', async () => {
    // "3 intentos totalmente inconsistentes"
  });

  it('5.4 - [v1.3.6i] Promedio matemático: (66+64+68)/3 = 66', async () => {
    // Verificar acceptedValue === 66 (Math.round(66))
  });

  it('5.5 - Modal muestra valor aceptado: 66', async () => {
    // Display valor en UI
  });

  it('5.6 - attemptHistory registra 3 intentos', async () => {
    // totalAttempts === 3
  });
});
```

**Pattern [A, B, C] donde C correcto (5 tests):**
```typescript
describe('Grupo 5.2: Pattern [A,B,C] Tercer Correcto', () => {
  it('5.7 - [44, 42, 43] → Auto-advance (tercer correcto)', async () => {
    // Modal NO aparece, avanza automáticamente
  });

  it('5.8 - Modal NO aparece', async () => {
    // queryByText null
  });

  it('5.9 - Severity: warning_retry (3 intentos necesarios)', async () => {
    // severity === 'warning_retry'
  });

  it('5.10 - attemptHistory registra 3 intentos', async () => {
    // totalAttempts === 3
  });

  it('5.11 - onStepComplete ejecutado', async () => {
    // Callback llamado
  });
});
```

**Pattern [A, B, A] critical_inconsistent (4 tests):**
```typescript
describe('Grupo 5.3: Pattern [A,B,A] - Vuelve al Primero', () => {
  it('5.12 - [44, 42, 44] → Modal "third-result"', async () => {
    // Modal aparece
  });

  it('5.13 - Severity: critical_inconsistent', async () => {
    // Menos grave que severe
  });

  it('5.14 - Promedio: (44+42+44)/3 = 43 redondeado', async () => {
    // acceptedValue === 43
  });

  it('5.15 - Modal muestra valor aceptado: 43', async () => {
    // Display en UI
  });
});
```

**Validación handleAcceptThird (3 tests):**
```typescript
describe('Grupo 5.4: handleAcceptThird Validation', () => {
  it('5.16 - [v1.3.6M] NO limpia attemptHistory', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    // Setup + verificar attemptHistory preservado
  });

  it('5.17 - onStepComplete ejecutado después de aceptar', async () => {
    // Callback llamado
  });

  it('5.18 - Siguiente denominación recibe focus', async () => {
    // input.toHaveFocus()
  });
});
```

**Coverage esperado después:** ~85%

---

### Grupo 6: buildVerificationBehavior() (10 tests) - 25 min

```typescript
describe('Grupo 6: buildVerificationBehavior()', () => {
  it('6.1 - Ejecuta solo cuando allStepsCompleted = true', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    const { getByRole } = renderPhase2Verification({
      onVerificationBehaviorCollected
    });

    // Completar solo 6/7 pasos
    const input = getByRole('spinbutton');
    for (let i = 0; i < 6; i++) {
      await userEvent.type(input, `${mockVerificationSteps[i].quantity}{Enter}`);
    }

    // buildVerificationBehavior NO debe ejecutar
    expect(onVerificationBehaviorCollected).not.toHaveBeenCalled();
  });

  it('6.2 - NO ejecuta si falta algún paso', async () => {
    // Similar a 6.1
  });

  it('6.3 - Construye denominationsWithIssues correctamente', async () => {
    // Verificar array structure
  });

  it('6.4 - [v1.3.6Y] firstAttemptSuccesses por diferencia', async () => {
    // 10 total - 4 errores = 6 perfectas
  });

  it('6.5 - secondAttemptSuccesses cuenta correcto', async () => {
    // Verificar contador warnings
  });

  it('6.6 - thirdAttemptRequired cuenta correcto', async () => {
    // Verificar contador tercer intento
  });

  it('6.7 - totalAttempts suma correcta', async () => {
    // Sum all attempts
  });

  it('6.8 - criticalInconsistencies filtra correcto', async () => {
    // Solo critical_inconsistent + critical_severe
  });

  it('6.9 - forceOverrides cuenta correcto', async () => {
    // warning_override count
  });

  it('6.10 - [v1.3.6T] memoizado con useCallback - NO loop infinito', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    // Renderizar + verificar NO warnings "Maximum update depth"
  });
});
```

**Coverage esperado después:** ~95%

---

### Grupo 7: Navigation & UX (12 tests) - 20 min

```typescript
describe('Grupo 7: Navigation & UX', () => {
  it('7.1 - Botón "Anterior" funciona (vuelve paso previo)', async () => {
    // Avanzar a paso 2 → click Anterior → verificar paso 1
  });

  it('7.2 - Botón "Anterior" deshabilitado en primer paso', () => {
    const { getByText } = renderPhase2Verification();
    expect(getByText('Anterior')).toBeDisabled();
  });

  it('7.3 - Input validation: solo números enteros positivos', async () => {
    const { getByRole } = renderPhase2Verification();
    const input = getByRole('spinbutton') as HTMLInputElement;

    await userEvent.type(input, 'abc');
    expect(input).toHaveValue(''); // No acepta letras
  });

  it('7.4 - Input validation: rechaza negativos', async () => {
    const { getByRole } = renderPhase2Verification();
    const input = getByRole('spinbutton') as HTMLInputElement;

    await userEvent.type(input, '-5');
    expect(input).toHaveValue('5'); // Remueve signo
  });

  it('7.5 - Input validation: rechaza decimales', async () => {
    const { getByRole } = renderPhase2Verification();
    const input = getByRole('spinbutton') as HTMLInputElement;

    await userEvent.type(input, '3.14');
    expect(input).toHaveValue('314'); // Remueve punto
  });

  it('7.6 - Input max length: 4 dígitos', async () => {
    const { getByRole } = renderPhase2Verification();
    const input = getByRole('spinbutton') as HTMLInputElement;

    await userEvent.type(input, '12345');
    expect(input).toHaveValue('1234'); // Solo acepta 4
  });

  it('7.7 - Keyboard shortcuts: Enter confirma', async () => {
    // Ya cubierto en tests anteriores
  });

  it('7.8 - Auto-advance timing correcto (useTimingConfig)', async () => {
    // Verificar delay ~1s antes de avanzar
  });

  it('7.9 - Botón "Cancelar" ejecuta onCancel callback', async () => {
    const onCancel = vi.fn();
    const { getByText } = renderPhase2Verification({ onCancel });

    await userEvent.click(getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('7.10 - Success indicator aparece con valor correcto', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '65');

    expect(getByText(/Cantidad correcta/i)).toBeInTheDocument();
  });

  it('7.11 - Error indicator con valor incorrecto', async () => {
    const { getByRole, getByText } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    await userEvent.type(input, '66');

    expect(getByText(/exactamente 65/i)).toBeInTheDocument();
  });

  it('7.12 - Placeholder correcto primera denominación', () => {
    const { getByPlaceholderText } = renderPhase2Verification();
    expect(getByPlaceholderText(/un centavo/i)).toBeInTheDocument();
  });
});
```

**Coverage esperado después:** ~98%

---

### Grupo 8: Tests de Regresión Bugs Históricos (4 tests) - 15 min

```typescript
describe('Grupo 8: Regresión Bugs Históricos', () => {
  it('[v1.3.6M] NO limpia attemptHistory en handleAcceptThird', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    const { getByRole, getByText } = renderPhase2Verification({
      onVerificationBehaviorCollected
    });
    const input = getByRole('spinbutton');

    // Simular [66, 64, 68] para tercer intento
    await userEvent.type(input, '66{Enter}');
    await waitFor(() => getByText(/Dato Incorrecto/i));
    await userEvent.click(getByText('Volver a contar'));

    await userEvent.type(input, '64{Enter}');
    await waitFor(() => getByText(/Tercer Intento Obligatorio/i));
    await userEvent.click(getByText('Intentar tercera vez'));

    await userEvent.type(input, '68{Enter}');
    await waitFor(() => getByText(/Falta Muy Grave/i));
    await userEvent.click(getByText('Aceptar resultado'));

    // Completar resto denominaciones
    for (let i = 1; i < mockVerificationSteps.length; i++) {
      const step = mockVerificationSteps[i];
      await userEvent.type(input, `${step.quantity}{Enter}`);
    }

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
      const behavior = onVerificationBehaviorCollected.mock.calls[0][0];

      // Verificar attemptHistory NO fue limpiado
      expect(behavior.totalAttempts).toBe(3); // 3 intentos penny
      expect(behavior.denominationsWithIssues).toHaveLength(1);
      expect(behavior.denominationsWithIssues[0].attempts).toEqual([66, 64, 68]);
    });
  });

  it('[v1.3.6T] buildVerificationBehavior NO causa loop infinito', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getByRole } = renderPhase2Verification();
    const input = getByRole('spinbutton');

    // Completar todas denominaciones
    mockVerificationSteps.forEach(async (step) => {
      await userEvent.type(input, `${step.quantity}{Enter}`);
    });

    // Esperar 2 segundos
    await waitFor(() => {}, { timeout: 2000 });

    // Verificar console.warn NO llamado con "Maximum update depth"
    const warningCalls = consoleSpy.mock.calls.filter(call =>
      call[0]?.includes('Maximum update depth')
    );
    expect(warningCalls).toHaveLength(0);

    consoleSpy.mockRestore();
  });

  it('[v1.3.6Y] firstAttemptSuccesses calculado por diferencia', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    const { getByRole, getByText } = renderPhase2Verification({
      onVerificationBehaviorCollected
    });
    const input = getByRole('spinbutton');

    // 10 denominaciones totales
    // 4 con errores (primer intento incorrecto, segundo correcto)
    for (let i = 0; i < 4; i++) {
      await userEvent.type(input, '999{Enter}'); // Incorrecto
      await waitFor(() => getByText(/Dato Incorrecto/i));
      await userEvent.click(getByText('Volver a contar'));
      await userEvent.type(input, `${mockVerificationSteps[i].quantity}{Enter}`); // Correcto
    }

    // 6 restantes correctas en primer intento
    for (let i = 4; i < mockVerificationSteps.length; i++) {
      await userEvent.type(input, `${mockVerificationSteps[i].quantity}{Enter}`);
    }

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
      const behavior = onVerificationBehaviorCollected.mock.calls[0][0];

      // Total denominaciones: 10 (mockVerificationSteps.length)
      // Con errores: 4
      // Perfectas (calculado por diferencia): 10 - 4 = 6
      expect(behavior.firstAttemptSuccesses).toBe(6);
    });
  });

  it('[v1.3.6h] Enter key NO leak cuando modal abierto', async () => {
    const onStepComplete = vi.fn();
    const { getByRole, getByText } = renderPhase2Verification({ onStepComplete });
    const input = getByRole('spinbutton');

    // Primer intento incorrecto → modal abre
    await userEvent.type(input, '66{Enter}');

    await waitFor(() => {
      expect(getByText(/Dato Incorrecto/i)).toBeInTheDocument();
    });

    // Intentar Enter múltiples veces con modal abierto
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Enter}');

    // onStepComplete NO debe ejecutar (input sin focus + guard condition)
    expect(onStepComplete).not.toHaveBeenCalled();

    // Modal sigue abierto
    expect(getByText(/Dato Incorrecto/i)).toBeInTheDocument();
  });
});
```

**Coverage esperado después:** **100%** ✅

---

## 🔧 Helpers & Mocks Necesarios

### Helper: renderPhase2Verification()
```typescript
const renderPhase2Verification = (overrideProps = {}) => {
  const defaultProps = {
    deliveryCalculation: mockDeliveryCalculation,
    onStepComplete: vi.fn(),
    onStepUncomplete: vi.fn(),
    onSectionComplete: vi.fn(),
    onVerificationBehaviorCollected: vi.fn(),
    completedSteps: {},
    onCancel: vi.fn(),
    onPrevious: vi.fn(),
    canGoPrevious: false,
    ...overrideProps
  };

  return render(
    <TimingProvider>
      <Phase2VerificationSection {...defaultProps} />
    </TimingProvider>
  );
};
```

### Mock: mockVerificationSteps (7 denominaciones)
```typescript
const mockVerificationSteps = [
  { key: 'penny', quantity: 65, label: 'Un centavo (1¢)' },
  { key: 'nickel', quantity: 44, label: 'Cinco centavos (5¢)' },
  { key: 'dime', quantity: 43, label: 'Diez centavos (10¢)' },
  { key: 'quarter', quantity: 3, label: 'Veinticinco centavos (25¢)' },
  { key: 'bill1', quantity: 2, label: 'Billete de un dólar ($1)' },
  { key: 'bill5', quantity: 3, label: 'Billete de cinco dólares ($5)' },
  { key: 'bill10', quantity: 2, label: 'Billete de diez dólares ($10)' }
];
```

### Mock: mockDeliveryCalculation
```typescript
const mockDeliveryCalculation: DeliveryCalculation = {
  verificationSteps: mockVerificationSteps,
  denominationsToKeep: {
    penny: 65,
    nickel: 44,
    dime: 43,
    quarter: 3,
    dollarCoin: 0,
    bill1: 2,
    bill5: 3,
    bill10: 2,
    bill20: 0,
    bill50: 0,
    bill100: 0
  },
  // ... resto campos
};
```

### Mock: mockTimingConfig
```typescript
vi.mock('@/hooks/useTimingConfig', () => ({
  useTimingConfig: () => ({
    createTimeoutWithCleanup: (callback, _type, _name, delay = 0) => {
      const timeout = setTimeout(callback, delay);
      return () => clearTimeout(timeout);
    }
  })
}));
```

---

## 📊 Resumen Grupos

| Grupo | Tests | Duración | Coverage | Prioridad |
|-------|-------|----------|----------|-----------|
| 1. Inicialización | 8 | 15 min | ~10% | Baja |
| 2. Primer Correcto | 12 | 20 min | ~30% | Media |
| 3. Primer Incorrecto | 15 | 30 min | ~50% | Alta |
| 4. Segundo Patterns | 20 | 35 min | ~70% | Alta |
| 5. Tercer Patterns | 18 | 30 min | ~85% | Alta |
| 6. buildVerificationBehavior | 10 | 25 min | ~95% | Crítica |
| 7. Navigation UX | 12 | 20 min | ~98% | Media |
| 8. Regresión Bugs | 4 | 15 min | 100% | Crítica |
| **TOTAL** | **87** | **3h 20min** | **100%** | |

---

## 🎯 Estrategia Coverage 100%

### Branches Críticas a Cubrir

**handleConfirmStep (líneas 392-515):**
- [ ] `inputNum === currentStep.quantity` (correcto)
- [ ] `inputNum !== currentStep.quantity` (incorrecto)
- [ ] `attemptCount === 0` (primer intento)
- [ ] `attemptCount === 1` (segundo intento)
- [ ] `attemptCount >= 2` (tercer intento)
- [ ] `inputNum === firstAttemptValue` ([A, A] pattern)
- [ ] `inputNum !== firstAttemptValue` ([A, B] pattern)
- [ ] `allAttempts.length === 3` (tercer intento válido)

**buildVerificationBehavior (líneas 144-325):**
- [ ] `attempts.length === 1 && isCorrect` (success)
- [ ] `attempts.length === 1 && !isCorrect` (warning - v1.3.6Q fix)
- [ ] `attempts.length === 2 && attempts[1].isCorrect` (warning_retry)
- [ ] `attempts.length === 2 && [A, A]` (warning_override)
- [ ] `attempts.length === 2 && [A, B]` (warning_retry)
- [ ] `attempts.length >= 3 && [A,B,A]` (critical_inconsistent)
- [ ] `attempts.length >= 3 && [A,B,C]` (critical_severe)

**useEffect auto-advance (líneas 328-345):**
- [ ] `nextIncompleteIndex !== -1 && nextIncompleteIndex !== currentStepIndex`
- [ ] `nextIncompleteIndex === -1` (todos completos)

**useEffect section complete (líneas 348-389):**
- [ ] `allStepsCompleted && verificationSteps.length > 0`
- [ ] `!allStepsCompleted` (no ejecutar)

**handleKeyPress (líneas 517-536):**
- [ ] `modalState.isOpen` (guard condition v1.3.6h)
- [ ] `e.key === 'Enter' && inputValue !== ''`

---

**Última actualización:** 09 de Octubre 2025
**Próximo paso:** Implementar tests → `Phase2VerificationSection.test.tsx`

🙏 **Que Dios guíe la implementación de estos 87 tests con precisión y excelencia.**

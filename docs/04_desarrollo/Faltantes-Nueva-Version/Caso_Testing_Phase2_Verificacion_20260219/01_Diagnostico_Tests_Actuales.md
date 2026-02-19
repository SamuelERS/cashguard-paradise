# Diagnostico de Tests Phase2VerificationSection

**Caso:** Testing Phase2 Verificacion
**Fecha:** 19 de febrero 2026
**Componente:** `src/components/phases/Phase2VerificationSection.tsx` (570 lineas)
**Test file:** `src/components/phases/__tests__/Phase2VerificationSection.test.tsx` (1,802 lineas)
**Prioridad:** MEDIA - Cobertura baja en componente critico anti-fraude

---

## 1. Estado Actual

| Metrica | Valor |
|---------|-------|
| Tests totales (incluyendo `it` y `it.skip`) | 86 |
| Tests activos (ejecutables) | 72 |
| Tests omitidos (`it.skip`) | 14 |
| Tests passing (estimado) | ~28 de 72 activos (~39%) |
| Grupos funcionales | 8 |
| Duracion estimada de la suite | Variable (timeouts frecuentes) |

**Nota sobre metricas:** Los numeros exactos de passing/failing pueden variar entre ejecuciones debido a la naturaleza asincrona de los tests. La ultima ejecucion documentada fue durante la sesion v1.3.8 Fase 1 con resultados de ~28-29 passing de ~87 totales.

---

## 2. Tests por Grupo Funcional

| # | Grupo | Tests Totales | Activos | Passing (est.) | % | Descripcion |
|---|-------|---------------|---------|----------------|---|-------------|
| 1 | Inicializacion y Props | 8 | 8 | 8 | 100% | Renderizado inicial, props por defecto, denominaciones |
| 2 | Primer Intento Correcto | 12 | ~10 | ~6 | ~50% | Ingresar valor correcto, modal success, avance |
| 3 | Primer Intento Incorrecto | 15 | ~12 | ~3 | ~20% | Ingresar valor incorrecto, modal retry |
| 4 | Segundo Intento Patterns | 20 | ~15 | ~3 | ~15% | warning_retry, warning_override, require-third |
| 5 | Tercer Intento Patterns | 18 | ~13 | ~2 | ~11% | critical_severe, critical_inconsistent, promedio |
| 6 | buildVerificationBehavior | 10 | ~8 | ~4 | ~40% | Construccion del objeto de comportamiento |
| 7 | Navigation y UX | 12 | ~8 | ~4 | ~50% | Progress bar, badges, estados visuales |
| 8 | Regresion Bugs Historicos | 4 | ~4 | ~3 | ~75% | Bugs especificos de versiones anteriores |

### Observaciones por Grupo

**Grupo 1 (100%):** Los tests de inicializacion pasan todos porque no involucran interaccion asincrona ni modales. Son tests de renderizado puro.

**Grupos 2-5 (11-50%):** Estos grupos son los mas afectados porque involucran la secuencia completa de interaccion: ingresar valor, presionar Enter, esperar modal, interactuar con modal, verificar transicion. Cada uno de estos pasos puede fallar por timing.

**Grupo 6 (40%):** Tests de `buildVerificationBehavior()` son mas unitarios -- verifican la funcion directamente. Los que fallan son edge cases complejos con multiples denominaciones.

**Grupo 8 (75%):** Tests de regresion para bugs especificos historicos (loop infinito, enter key leak). La mayoria pasan porque verifican condiciones puntuales.

---

## 3. Root Causes Identificados

Se han identificado 4 causas raiz que explican el 100% de los tests fallando:

### RC1: Radix UI AlertDialog Asincrono (afecta ~45 tests)

**Problema:** El componente usa `AlertDialog` de Radix UI para modales de verificacion. Estos modales se renderizan de forma asincrona (~100-300ms) despues de que se actualiza el estado.

**Sintoma:** Tests usan `screen.getByText('Volver a contar')` (sincrono) pero el texto aun no existe en el DOM cuando se ejecuta la query.

**Error tipico:**
```
Unable to find an element with the text: Volver a contar
```

**Solucion:**
```typescript
// ANTES (falla):
const button = screen.getByText('Volver a contar');

// DESPUES (funciona):
const button = await screen.findByText('Volver a contar', {}, { timeout: 3000 });
```

**Tests afectados:** Todos los que interactuan con modales (Grupos 2, 3, 4, 5 principalmente).

---

### RC2: getCurrentInput() Bloqueado por Modal Overlay (afecta ~15 tests)

**Problema:** El helper `getCurrentInput()` busca el primer `textbox` en el DOM con `screen.getAllByRole('textbox')[0]`. Cuando un modal de Radix UI esta abierto, el overlay puede hacer que el input principal quede marcado como `aria-hidden="true"`, y el helper retorna un elemento bloqueado.

**Sintoma:** Tests que intentan escribir en el input despues de cerrar un modal fallan porque el helper devuelve el input equivocado o un input bloqueado.

**Error tipico:**
```
Unable to find an accessible element with the role "textbox"
```

**Solucion:**
```typescript
// ANTES (fragil):
const getCurrentInput = () => screen.getAllByRole('textbox')[0];

// DESPUES (robusto):
const getCurrentInput = () => {
  const inputs = screen.getAllByRole('textbox');
  return inputs.find(input =>
    !input.closest('[aria-hidden="true"]')
  ) || inputs[0];
};
```

**Tests afectados:** Todos los que escriben en el input despues de interactuar con un modal.

---

### RC3: Transiciones Asumidas Sincronas (afecta ~10 tests)

**Problema:** Algunos tests asumen que la transicion entre denominaciones (penny -> nickel -> dime) es instantanea. En realidad hay un delay minimo (100ms para focus, 150ms para confirmacion) controlado por `useTimingConfig`.

**Sintoma:** Tests verifican que el placeholder cambio a la siguiente denominacion inmediatamente despues de confirmar, pero el componente aun esta en transicion.

**Error tipico:**
```
Expected to find element with text /Cinco centavos/i but found /Un centavo/i
```

**Solucion:**
```typescript
// ANTES (race condition):
expect(screen.getByText(/Cinco centavos/i)).toBeInTheDocument();

// DESPUES (espera transicion):
await waitFor(() => {
  expect(screen.getByText(/Cinco centavos/i)).toBeInTheDocument();
});
```

**Nota:** El test file actual usa `vi.useFakeTimers()` con `act(advanceTimersByTime())`, lo cual mitiga parcialmente este problema pero no lo elimina cuando hay multiples timers encadenados.

---

### RC4: Edge Cases de buildVerificationBehavior (afecta ~6 tests)

**Problema:** La funcion `buildVerificationBehavior()` construye el array `denominationsWithIssues` iterando sobre el Map `attemptHistory`. Algunos tests esperan que denominaciones sin errores no aparezcan en el array, pero hay edge cases donde el comportamiento no es intuitivo.

**Sintoma:** Tests que verifican la estructura exacta del objeto `VerificationBehavior` fallan porque el array tiene mas o menos elementos de los esperados.

**Error tipico:**
```
Expected denominationsWithIssues to have length 2, received 3
```

**Solucion:** Requiere debugging paso a paso de la funcion con los datos exactos del test para entender que denominaciones se estan incluyendo y por que.

---

## 4. Perfil del Componente

### Complejidad

| Metrica | Valor | Evaluacion |
|---------|-------|------------|
| Lineas totales | 570 | Grande para un componente React |
| Mezcla UI + logica | Si | Candidato a refactorizacion |
| Estados internos | ~15 | Alta complejidad de estado |
| useEffects | 3+ | Fuente historica de bugs (loops) |
| Callbacks | ~10 | Muchos handlers interrelacionados |
| Modales internos | 4 tipos | incorrect, force-same, require-third, third-result |

### Historial de Bugs Criticos

Este componente ha sido fuente de multiples bugs criticos documentados en CLAUDE.md:

| Version | Bug | Severidad |
|---------|-----|-----------|
| v1.3.6a | Loop infinito por `buildVerificationBehavior` sin `useCallback` | S0 |
| v1.3.6b | Loop infinito #2 por `deliveryCalculation` en deps | S0 |
| v1.3.6e | Loop infinito #3 por callback prop en deps (702 errores) | S0 |
| v1.3.6f | Loop infinito #3 definitivo (3,357 errores) | S0 |
| v1.3.6h | Enter key leak en modal (triple defensa) | S1 |
| v1.3.6T | `clearAttemptHistory` borraba datos de reporte | S1 |
| v1.3.6AI | `clearAttemptHistory` en handleForce (warning_override no reportado) | S1 |

El alto numero de bugs historicos refuerza la necesidad de cobertura de tests robusta.

---

## 5. Roadmap de Mejora: 3 Fases

### Fase 1: Quick Wins (2-3 horas) -- Objetivo: ~62% passing

**Que hacer:**
- Reemplazar todos los `getByText` sincronos por `findByText` async en tests de modales
- Agregar `waitFor()` en verificaciones de transicion entre denominaciones
- Actualizar helper `getCurrentInput()` con filtro `aria-hidden`

**Tests que mejorarian:**
- ~10 tests de modales (RC1 basicos)
- ~10 tests de transicion (RC3)
- ~5 tests de input post-modal (RC2)

**Resultado estimado:** ~28 -> ~45 de 72 activos (62%)

---

### Fase 2: Modales Async Completos (3-4 horas) -- Objetivo: ~90% passing

**Que hacer:**
- Implementar helper `clickModalButtonSafe()` que espera modal + hace click (ya existe parcialmente)
- Refactorizar tests de Grupos 3, 4, 5 para usar secuencias async completas
- Agregar `waitForElementToBeRemoved()` para verificar cierre de modales
- Implementar helper `completeAllStepsCorrectly()` para secuencias de 7 pasos

**Tests que mejorarian:**
- ~15 tests de segundo intento (Grupo 4)
- ~6 tests de tercer intento (Grupo 5)
- ~3 tests de cierre de modal

**Resultado estimado:** ~45 -> ~65 de 72 activos (90%)

---

### Fase 3: Edge Cases y Limpieza (2-3 horas) -- Objetivo: 100% passing

**Que hacer:**
- Debug paso a paso de `buildVerificationBehavior` edge cases (RC4)
- Fix de tests de regresion restantes
- Reactivar los 14 tests con `it.skip` uno por uno
- Optimizar timeouts de la suite para duracion total < 30s

**Tests que mejorarian:**
- ~6 tests de buildVerificationBehavior (Grupo 6)
- ~1 test de regresion (Grupo 8)
- Hasta 14 tests reactivados de `it.skip`

**Resultado estimado:** ~65 -> 86 de 86 totales (100%)

---

## 6. Esfuerzo Total Estimado

| Fase | Tiempo | Resultado |
|------|--------|-----------|
| Fase 1: Quick Wins | 2-3 h | ~62% passing |
| Fase 2: Modales Async | 3-4 h | ~90% passing |
| Fase 3: Edge Cases | 2-3 h | 100% passing |
| **Total** | **7-10 h** | **86/86 tests passing** |

---

## 7. Consideraciones para Refactorizacion del Componente

Aunque este diagnostico se enfoca en los tests, vale la pena notar que el componente en si (570 lineas, mezcla UI + logica, 15+ estados, multiples useEffects) es un candidato fuerte para refactorizacion siguiendo la Doctrina D.5 (Arquitectura Wizard V3):

| Separacion | Actual | Objetivo (D.5) |
|------------|--------|-----------------|
| UI (presentacion) | Mezclada en 570 lineas | Dumb component controlado por props |
| Logica (cerebro) | Mezclada en 570 lineas | Hook `useBlindVerification` (ya existe parcialmente) |
| Datos (configuracion) | Inline en componente | Archivo de configuracion en `/data` |

Sin embargo, esta refactorizacion es un esfuerzo separado y mas grande (~20-30 horas) que no debe mezclarse con la mejora de tests. Primero se arreglan los tests (7-10h), luego se refactoriza el componente (20-30h) con los tests como red de seguridad.

---

## 8. Estrategia de Testing Actual

El test file usa las siguientes estrategias, validadas en otros componentes del proyecto:

| Estrategia | Detalle |
|------------|---------|
| **Fake Timers** | `vi.useFakeTimers()` con `toFake` selectivo (no fake requestAnimationFrame) |
| **fireEvent** (no userEvent) | fireEvent es sincrono, evita conflictos con fake timers |
| **act + advanceTimersByTime** | Para avanzar timers controladamente |
| **Mock useTimingConfig** | Reemplaza delays reales por delays controlados |
| **Wrapper con useState** | Componente wrapper que provee estado de `deliveryCalculation` |

Esta estrategia fue migrada del patron exitoso de `GuidedInstructionsModal.integration.test.tsx` que logro reducir duracion de 21.55s a 829ms.

---

*Documento creado: 19 de febrero 2026*
*Proyecto: CashGuard Paradise*

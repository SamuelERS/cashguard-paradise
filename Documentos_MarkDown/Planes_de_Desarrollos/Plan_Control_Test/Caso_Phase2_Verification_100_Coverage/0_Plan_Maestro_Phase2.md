# Plan Maestro: Testing Phase2VerificationSection - 100% Coverage

**Fecha creación:** 09 de Octubre 2025
**Responsable:** Claude AI + Samuel Ellers
**Duración estimada:** 5 horas 20 minutos
**Estado:** 🔄 EN PROGRESO
**Prioridad:** 🔴 CRÍTICA (Anti-Fraude Core)

---

## 📊 Resumen Ejecutivo

### ¿Qué Es Phase2VerificationSection?

**En lenguaje técnico:**
Componente React (783 líneas) que implementa el flujo de **verificación ciega de denominaciones** durante la entrega de efectivo a gerencia en CashGuard Paradise.

**En lenguaje simple (para no-programadores):**
Es la pantalla donde el cajero **verifica físicamente** cuántas monedas/billetes de cada tipo está entregando a gerencia. Se llama "ciega" porque:
1. El cajero NO ve cuánto contó en Phase 1 (evita copiar)
2. Debe volver a contar **físicamente** cada denominación
3. El sistema compara: ¿lo que cuenta ahora = lo que contó antes?

**Ejemplo concreto:**
- Phase 1: Cajero contó 43 monedas de 10¢
- Phase 2 (este componente): Sistema pregunta "¿Cuántas monedas de 10¢ entregas?"
- Cajero cuenta físicamente y dice: "44"
- Sistema detecta error (43 ≠ 44) y muestra modal "Verificación necesaria"
- Cajero vuelve a contar: "43" ✅
- Sistema registra: "1 advertencia (warning_retry)" en reporte final

---

### ¿Por Qué Es Crítico Este Componente?

#### 1. **Corazón del Sistema Anti-Fraude**
Sin este componente:
- ❌ Cajero podría entregar $100 pero reportar $200 (faltante ficticio)
- ❌ Encargado recibe dinero sin validar físicamente
- ❌ Fraude pasa desapercibido hasta auditoría mensual

Con este componente:
- ✅ Cajero DEBE contar físicamente (no puede inventar números)
- ✅ Discrepancias detectadas en tiempo real
- ✅ Todos los intentos registrados con timestamp (auditoría video)

#### 2. **Threshold $0.01 - Zero Tolerancia**
- Diferencia de **1 sola moneda** = Error detectado
- Diferencia de **$0.01** = Reporte crítico a gerencia
- Filosofía Paradise: "El que hace bien las cosas ni cuenta se dará"

#### 3. **Triple Intento - Justicia Laboral**
- **1er intento correcto:** Zero fricción, avanza automáticamente ✅
- **2do intento correcto:** Advertencia (warning), pero no crítico ⚠️
- **3er intento incorrecto:** Alerta crítica, reporte gerencia obligatorio 🔴

Beneficio: Empleado honesto que se equivoca una vez NO es penalizado severamente.

---

## 🎯 Objetivos de Esta Sesión

### Objetivo Principal
**Crear suite completa de tests con 100% coverage** para Phase2VerificationSection.tsx

### Objetivos Específicos

#### 1. **Coverage Técnico**
- [ ] 100% lines coverage
- [ ] 100% branches coverage
- [ ] 100% functions coverage
- [ ] 87+ tests implementados

#### 2. **Cobertura Funcional**
- [ ] Todos los flujos de usuario validados (éxito, advertencias, críticos)
- [ ] Todos los patterns segundo/tercer intento ([A,A], [A,B], [A,B,C])
- [ ] Todos los modales testeados (4 tipos: incorrect, force-same, require-third, third-result)
- [ ] Navigation & UX completo (teclado, focus, auto-advance)

#### 3. **Tests de Regresión**
- [ ] v1.3.6M: attemptHistory NO se borra en handleAcceptThird
- [ ] v1.3.6T: buildVerificationBehavior NO causa loop infinito
- [ ] v1.3.6Y: firstAttemptSuccesses calculado por diferencia
- [ ] v1.3.6h: Enter key NO leak cuando modal abierto

#### 4. **Documentación**
- [ ] 5 archivos markdown (README + 4 documentos principales)
- [ ] ~3,800 líneas documentación total
- [ ] Lenguaje "anti-tontos" (comprensible no-programadores)
- [ ] Glosario términos técnicos completo

#### 5. **Impacto Proyecto**
- [ ] Coverage general 34% → 42% (+8 puntos)
- [ ] CI pipeline verde
- [ ] 0 tests flaky
- [ ] Duración suite < 10 segundos

---

## 📅 Roadmap Completo - 8 Secciones de Tests

### Sección 1: Inicialización & Props (8 tests)
**Duración estimada:** 15 minutos
**Objetivo:** Validar renderizado básico y props requeridas

**Tests incluidos:**
1. Componente renderiza sin errores con props mínimas
2. Título "Verificación Ciega" visible
3. Contador pasos muestra "1/7" inicial
4. Navigation buttons estado inicial correcto
5. Input primera denominación tiene focus
6. Label primera denominación muestra nombre correcto
7. Props requeridas causan error si faltan
8. Props opcionales funcionan correctamente

**Coverage esperado después:** ~10%

---

### Sección 2: Primer Intento Correcto (12 tests)
**Duración estimada:** 20 minutos
**Objetivo:** Validar flujo happy path (cajero cuenta bien primer intento)

**Tests incluidos:**
1. Input acepta valor correcto (ej: 43)
2. Enter key confirma valor
3. Auto-advance a siguiente denominación (delay correcto)
4. attemptHistory Map NO registra intento (sin errores = sin registro)
5. onStepComplete callback ejecutado con denominación correcta
6. Input siguiente denominación recibe focus automáticamente
7. Contador pasos avanza "1/7" → "2/7"
8. Modal NO aparece (valor correcto)
9. Denominación completada marcada visualmente
10. Navigation "Siguiente" funciona manualmente
11. Valores numéricos válidos aceptados (enteros positivos)
12. Todos los pasos correctos → onSectionComplete ejecuta

**Coverage esperado después:** ~30%

---

### Sección 3: Primer Intento Incorrecto → Modal (15 tests)
**Duración estimada:** 30 minutos
**Objetivo:** Validar modal "incorrect" y fixes v1.3.6h

**Tests incluidos:**
1. Input valor incorrecto (ej: 44 cuando esperado 43)
2. Modal "incorrect" aparece
3. Modal muestra título correcto ("Verificación necesaria")
4. Modal muestra mensaje explicativo
5. Modal muestra intentos ("Intentado: 44 | Esperado: 43")
6. Botón "Volver a contar" visible y habilitado
7. Botón "Forzar" visible pero DESHABILITADO (primer intento)
8. **[v1.3.6h]** Input blur cuando modal abre
9. **[v1.3.6h]** Enter key NO registra mismo valor con modal abierto
10. **[v1.3.6h]** Escape key NO cierra modal (anti-accidente)
11. Click "Volver a contar" cierra modal
12. Input recupera focus después de cerrar modal
13. Input se limpia después de cerrar modal
14. attemptHistory registra primer intento incorrecto
15. Contador pasos NO avanza (sigue en "1/7")

**Coverage esperado después:** ~50%

---

### Sección 4: Segundo Intento Patterns (20 tests)
**Duración estimada:** 35 minutos
**Objetivo:** Validar 3 patterns posibles en segundo intento

#### Pattern [A, A] - Mismo valor incorrecto dos veces (6 tests)
1. [44, 44] → Modal "force-same" aparece
2. Modal muestra mensaje correcto ("mismo valor incorrecto dos veces")
3. Botón "Forzar este valor" HABILITADO
4. Click "Forzar" ejecuta handleForce()
5. **[v1.3.6M]** handleForce() limpia attemptHistory (permite reintentar)
6. onStepComplete ejecutado después de force

#### Pattern [A, B] donde B correcto (7 tests)
7. [44, 43] → Auto-advance (valor correcto)
8. Modal NO aparece (segundo intento correcto)
9. attemptHistory registra AMBOS intentos
10. Severity: warning_retry
11. onStepComplete ejecutado con denominación
12. Siguiente denominación recibe focus
13. Contador pasos avanza "1/7" → "2/7"

#### Pattern [A, B] donde B incorrecto diferente (7 tests)
14. [44, 42] → Modal "require-third" aparece
15. Modal muestra mensaje ("dos intentos incorrectos diferentes")
16. Modal muestra ambos intentos (44, 42)
17. Botón "Intentar tercera vez" visible
18. Botón "Forzar" visible (cual valor forzar?)
19. Click "Intentar tercera vez" cierra modal
20. attemptHistory registra ambos intentos

**Coverage esperado después:** ~70%

---

### Sección 5: Tercer Intento Patterns (18 tests)
**Duración estimada:** 30 minutos
**Objetivo:** Validar lógica patterns [A,B,C] y promedio matemático

#### Pattern [A, B, C] todos diferentes - critical_severe (6 tests)
1. [44, 42, 40] → Modal "third-result" aparece
2. Modal muestra severity "critical_severe"
3. Modal muestra mensaje crítico ("3 intentos totalmente inconsistentes")
4. **[v1.3.6i]** Promedio matemático calculado: (44+42+40)/3 = 42
5. Modal muestra valor aceptado: 42
6. attemptHistory registra 3 intentos

#### Pattern [A, B, C] donde C correcto - warning_retry (5 tests)
7. [44, 42, 43] → Auto-advance (tercer intento correcto)
8. Modal NO aparece
9. Severity: warning_retry (3 intentos necesarios)
10. attemptHistory registra 3 intentos
11. onStepComplete ejecutado

#### Pattern [A, B, A] - critical_inconsistent (4 tests)
12. [44, 42, 44] → Modal "third-result"
13. Severity: critical_inconsistent
14. Promedio: (44+42+44)/3 = 43.33 → redondeado 43
15. Modal muestra valor aceptado: 43

#### Validación handleAcceptThird (3 tests)
16. **[v1.3.6M]** handleAcceptThird() NO limpia attemptHistory
17. onStepComplete ejecutado después de aceptar tercer intento
18. Siguiente denominación recibe focus

**Coverage esperado después:** ~85%

---

### Sección 6: buildVerificationBehavior() (10 tests)
**Duración estimada:** 25 minutos
**Objetivo:** Validar construcción objeto VerificationBehavior

**Tests incluidos:**
1. Ejecuta solo cuando allStepsCompleted = true
2. NO ejecuta si falta algún paso
3. Construye denominationsWithIssues correctamente
4. **[v1.3.6Y]** firstAttemptSuccesses calculado por diferencia (total - errores)
5. secondAttemptSuccesses cuenta correcto
6. thirdAttemptRequired cuenta correcto
7. totalAttempts suma correcta
8. criticalInconsistencies filtra correcto
9. forceOverrides cuenta correcto
10. **[v1.3.6T]** buildVerificationBehavior memoizado con useCallback (NO loop infinito)

**Coverage esperado después:** ~95%

---

### Sección 7: Navigation & UX (12 tests)
**Duración estimada:** 20 minutos
**Objetivo:** Validar navegación manual y UX edge cases

**Tests incluidos:**
1. Botón "Anterior" funciona (vuelve a paso previo)
2. Botón "Anterior" deshabilitado en primer paso
3. Botón "Siguiente" funciona (avanza manualmente)
4. Botón "Siguiente" deshabilitado si input vacío
5. Botón "Siguiente" deshabilitado si valor inválido
6. Input validation: solo números enteros positivos
7. Input validation: rechaza negativos
8. Input validation: rechaza decimales
9. Input validation: rechaza strings no numéricos
10. Input max length: 4 dígitos
11. Keyboard shortcuts: Enter confirma
12. Auto-advance timing correcto (useTimingConfig)

**Coverage esperado después:** ~98%

---

### Sección 8: Tests de Regresión Bugs Históricos (4 tests)
**Duración estimada:** 15 minutos
**Objetivo:** Prevenir recurrencia bugs v1.3.6M, v1.3.6T, v1.3.6Y, v1.3.6h

**Tests incluidos:**
1. **[v1.3.6M]** attemptHistory NO se borra después de handleAcceptThird
   - Simular [A,B,C] → verificar attemptHistory.size > 0 después

2. **[v1.3.6T]** buildVerificationBehavior NO causa loop infinito
   - Mock console.warn → verificar NO se llama infinitamente
   - Verificar useEffect solo se dispara 1 vez

3. **[v1.3.6Y]** firstAttemptSuccesses calculado por diferencia
   - 10 denominaciones, 4 con errores → firstAttemptSuccesses = 6
   - NO incrementar en forEach (bug antiguo)

4. **[v1.3.6h]** Enter key NO leak cuando modal abierto
   - Modal abierto → presionar Enter → verificar input NO procesado
   - Verificar handleKeyPress tiene guard condition

**Coverage esperado después:** **100%** ✅

---

## 📚 Glosario Términos Técnicos (Para No-Programadores)

### A

**attemptHistory Map**
- **Qué es:** Registro en memoria de todos los intentos del cajero por denominación
- **Ejemplo:** Si cajero intenta "44 → 42 → 43" en monedas de 10¢, el Map guarda:
  ```
  "dime" → [
    {attemptNumber: 1, inputValue: 44, expectedValue: 43, isCorrect: false},
    {attemptNumber: 2, inputValue: 42, expectedValue: 43, isCorrect: false},
    {attemptNumber: 3, inputValue: 43, expectedValue: 43, isCorrect: true}
  ]
  ```
- **Para qué sirve:** Construir reporte final con todos los errores

**Auto-advance**
- **Qué es:** Pantalla avanza automáticamente a siguiente denominación
- **Cuándo:** Cuando cajero ingresa valor correcto en primer intento
- **Delay:** ~1 segundo (configurable en useTimingConfig)

---

### B

**Branches (coverage)**
- **Qué es:** Caminos diferentes que puede tomar el código (if/else)
- **Ejemplo:** `if (valor correcto) { avanzar } else { mostrar modal }`
  - Branch 1: valor correcto → avanzar
  - Branch 2: valor incorrecto → modal
- **100% branches:** Todos los caminos testeados

**buildVerificationBehavior()**
- **Qué es:** Función que analiza TODOS los intentos del cajero
- **Cuándo ejecuta:** Después de completar las 7 denominaciones
- **Qué devuelve:** Objeto con métricas:
  - totalAttempts: 15 (total intentos en todas denominaciones)
  - firstAttemptSuccesses: 5 (cuántas correctas en 1er intento)
  - criticalInconsistencies: 2 (cuántas con 3 intentos inconsistentes)

---

### C

**Callback**
- **Qué es:** Función que se ejecuta DESPUÉS de algo
- **Ejemplo:** `onStepComplete(denominacion)` se ejecuta después de completar paso
- **Para qué:** Comunicar componente hijo → componente padre

**Coverage (cobertura de tests)**
- **Qué es:** Porcentaje de código testeado
- **Tipos:**
  - Lines: % líneas ejecutadas en tests
  - Branches: % caminos if/else testeados
  - Functions: % funciones llamadas en tests
- **Objetivo:** 100% en Phase2VerificationSection

**critical_severe**
- **Qué es:** Tipo de error MÁS grave
- **Cuándo:** 3 intentos totalmente diferentes ([44, 42, 40])
- **Acción:** Reporte crítico gerencia obligatorio

**critical_inconsistent**
- **Qué es:** Tipo de error grave (menos que severe)
- **Cuándo:** 3 intentos donde alguno se repite ([44, 42, 44])
- **Acción:** Reporte crítico gerencia obligatorio

---

### D

**Dependencies (useEffect)**
- **Qué es:** Variables que useEffect "vigila"
- **Ejemplo:** `useEffect(() => {...}, [count])` → ejecuta cuando `count` cambia
- **Bug común:** Olvidar dependencia o incluir innecesaria → loops infinitos

**denominationsWithIssues**
- **Qué es:** Array de denominaciones con errores
- **Ejemplo:**
  ```
  [
    {denomination: "dime", severity: "warning_retry", attempts: [44, 43]},
    {denomination: "penny", severity: "critical_severe", attempts: [66, 64, 68]}
  ]
  ```
- **Para qué:** Mostrar en reporte final "Alertas Críticas"

---

### E

**Enter key leak**
- **Qué es:** Bug donde presionar Enter accidentalmente ejecuta acción no deseada
- **Problema:** Modal abierto pero input debajo sigue escuchando teclado
- **Fix v1.3.6h:** Input blur cuando modal abre + guard condition en handleKeyPress

---

### F

**firstAttemptSuccesses**
- **Qué es:** Cuántas denominaciones contó correcto en 1er intento
- **Cálculo correcto:** `total denominaciones - denominaciones con errores`
- **Bug v1.3.6Y:** Se calculaba con forEach (siempre daba 0)

**Flaky test**
- **Qué es:** Test que a veces pasa, a veces falla (sin cambiar código)
- **Causas comunes:** Timing issues, async mal manejado, estado compartido
- **Objetivo:** 0 flaky tests

**Force override**
- **Qué es:** Cajero fuerza un valor incorrecto después de 2 intentos iguales
- **Ejemplo:** Intenta 44 dos veces (esperado 43) → decide forzar 44
- **Acción sistema:** Acepta 44, registra "forceOverride" en reporte

---

### H

**handleAcceptThird()**
- **Qué es:** Función que ejecuta cuando cajero acepta resultado 3er intento
- **Bug v1.3.6M:** Limpiaba attemptHistory → reporte sin datos
- **Fix:** Removido clearAttemptHistory() → datos preservados

**handleForce()**
- **Qué es:** Función que ejecuta cuando cajero fuerza valor incorrecto
- **Cuándo:** Pattern [A, A] → cajero decide "sí quiero 44, aunque sistema dice 43"
- **Comportamiento:** Limpia attemptHistory (permite reintentar si se arrepiente)

---

### L

**Loop infinito**
- **Qué es:** Código que se ejecuta sin parar (crash navegador)
- **Causa común:** useEffect con dependencia que cambia cada render
- **Bug v1.3.6T:** buildVerificationBehavior sin useCallback → loop
- **Fix:** Memoizar con useCallback → referencia estable

---

### M

**Modal**
- **Qué es:** Ventana emergente que bloquea interacción con pantalla principal
- **Tipos en este componente:**
  1. "incorrect": Primer intento incorrecto
  2. "force-same": Dos intentos iguales incorrectos
  3. "require-third": Dos intentos diferentes incorrectos
  4. "third-result": Resultado tercer intento

**Mocks**
- **Qué es:** Datos/funciones falsos para tests
- **Ejemplo:** `mockVerificationSteps` = 7 denominaciones fake
- **Para qué:** Aislar componente (no depender de datos reales)

---

### P

**Pattern (segundo/tercer intento)**
- **Qué es:** Secuencia de valores ingresados
- **Ejemplos:**
  - [A, A]: Mismo valor dos veces (ej: 44, 44)
  - [A, B]: Dos valores diferentes (ej: 44, 42)
  - [A, B, C]: Tres valores diferentes (ej: 44, 42, 40)
  - [A, B, A]: Tres intentos, vuelve al primero (ej: 44, 42, 44)

**Promedio matemático v1.3.6i**
- **Qué es:** Cuando 3 intentos inconsistentes, sistema toma promedio
- **Ejemplo:** [66, 64, 68] → (66+64+68)/3 = 66
- **Justificación:** Estadísticamente justo vs tomar "último" arbitrario

---

### R

**Regresión (tests de)**
- **Qué es:** Tests que validan bugs pasados NO vuelvan
- **Ejemplo:** v1.3.6M solucionó bug → test valida fix sigue funcionando
- **Para qué:** Prevenir "romper" fix anterior con nuevo código

---

### S

**Severity (severidad)**
- **Qué es:** Nivel de gravedad del error
- **Tipos:**
  - `success`: Sin error (1er intento correcto)
  - `warning_retry`: Advertencia (2do intento correcto)
  - `warning_override`: Advertencia (force override)
  - `critical_severe`: Crítico (3 intentos totalmente diferentes)
  - `critical_inconsistent`: Crítico (3 intentos con alguna repetición)

---

### T

**Timestamp**
- **Qué es:** Fecha y hora exacta de un evento
- **Formato:** ISO 8601 (ej: `2025-10-09T14:32:18.123Z`)
- **Para qué:** Correlacionar con video vigilancia

---

### U

**useCallback**
- **Qué es:** Hook React que memoriza función
- **Para qué:** Evitar que función cambie referencia cada render
- **Previene:** Loops infinitos en useEffect

**useEffect**
- **Qué es:** Hook React que ejecuta código después de render
- **Cuándo ejecuta:** Cuando dependencies cambian
- **Peligro:** Dependencies mal configuradas → loops infinitos

---

### V

**Verificación ciega**
- **Qué es:** Cajero NO ve lo que contó en Phase 1
- **Para qué:** Evitar que copie valores sin contar físicamente
- **Cómo:** Phase1 guarda valores → Phase2 pregunta sin mostrar

---

### W

**warning_retry**
- **Qué es:** Advertencia por error corregido en 2do o 3er intento
- **Ejemplo:** [44, 43] → primer intento mal, segundo bien
- **Acción:** Registrar en reporte, pero NO crítico

**warning_override**
- **Qué es:** Advertencia por forzar valor incorrecto
- **Ejemplo:** [44, 44] → forzar 44 (esperado 43)
- **Acción:** Registrar en reporte con nota "valor forzado"

---

## ✅ Criterios de Aceptación

### Documentación
- [ ] 5 archivos markdown creados (README + 4 documentos)
- [ ] Total ~3,800 líneas documentación
- [ ] Lenguaje "anti-tontos" (comprensible no-programadores)
- [ ] Glosario 40+ términos técnicos
- [ ] Diagramas ASCII flujos usuario (mínimo 4)
- [ ] Índice navegable en README.md
- [ ] Referencias cruzadas entre documentos

### Tests - Cobertura Técnica
- [ ] 87+ tests implementados
- [ ] 100% lines coverage Phase2VerificationSection.tsx
- [ ] 100% branches coverage Phase2VerificationSection.tsx
- [ ] 100% functions coverage Phase2VerificationSection.tsx
- [ ] 0 tests flaky (3 ejecuciones consecutivas)
- [ ] Duración suite < 10 segundos

### Tests - Cobertura Funcional
- [ ] 8 grupos funcionales implementados
- [ ] 4 tipos modales testeados (incorrect, force-same, require-third, third-result)
- [ ] 6 patterns segundo/tercer intento cubiertos ([A,A], [A,B], [A,B,C], etc.)
- [ ] Todos los event handlers testeados (onChange, onKeyDown, onClick)
- [ ] Todos los useEffect validados (dependencies correctas, NO loops)

### Tests - Regresión
- [ ] v1.3.6M: attemptHistory preservado en handleAcceptThird
- [ ] v1.3.6T: buildVerificationBehavior NO loop infinito
- [ ] v1.3.6Y: firstAttemptSuccesses por diferencia
- [ ] v1.3.6h: Enter key NO leak modal

### Código
- [ ] Helpers reutilizables (renderPhase2Verification)
- [ ] Mocks limpios y documentados
- [ ] Comentarios inline tests complejos
- [ ] Estructura consistente con tests existentes
- [ ] Zero any types (TypeScript estricto)

### Proyecto
- [ ] Coverage general 34% → 42%+
- [ ] CI pipeline verde (GitHub Actions)
- [ ] CLAUDE.md actualizado v1.3.7
- [ ] Commit semántico convenciones
- [ ] Plan_Control_Test/README.md actualizado

---

## 📊 Estimación Tiempo Detallada

| Fase | Tareas | Duración |
|------|--------|----------|
| **1. Estructura** | Crear carpeta + 5 archivos base | 5 min |
| **2. Análisis** | Leer código + mapear + bugs | 1 hora |
| **3. Docs** | Escribir 0_Plan, 1_Analisis, 2_Plan_Suite | 1.5 horas |
| **4. Tests** | Implementar 87 tests (8 grupos) | 3 horas |
| **5. Final** | 3_Implementacion + READMEs + CLAUDE.md | 30 min |
| **TOTAL** | | **5h 20min** |

### Desglose Fase 4 (Tests)
| Grupo | Tests | Duración |
|-------|-------|----------|
| Setup inicial | Helpers + mocks | 30 min |
| Grupo 1 | Inicialización (8 tests) | 15 min |
| Grupo 2 | Primer intento correcto (12 tests) | 20 min |
| Grupo 3 | Primer intento incorrecto (15 tests) | 30 min |
| Grupo 4 | Segundo intento patterns (20 tests) | 35 min |
| Grupo 5 | Tercer intento patterns (18 tests) | 30 min |
| Grupo 6 | buildVerificationBehavior (10 tests) | 25 min |
| Grupo 7 | Navigation & UX (12 tests) | 20 min |
| Grupo 8 | Regresión bugs (4 tests) | 15 min |
| **Subtotal** | **87 tests** | **3h 20min** |

---

## 🚀 Próximos Pasos (Post-Sesión)

### Sesión 2: useBlindVerification.ts
- **Duración:** 2-3 horas
- **Tests:** 20-25
- **Coverage:** +3-4%

### Sesión 3: usePhaseManager.ts
- **Duración:** 3-4 horas
- **Tests:** 35-45
- **Coverage:** +5-6%

### Sesión 4: E2E Regression iPhone
- **Duración:** 2-3 horas
- **Tests:** 10-15 Playwright

---

## 🙏 Compromiso de Calidad

Este plan maestro se ejecutará siguiendo los valores de **Acuarios Paradise**:

1. **Excelencia Técnica:** 100% coverage, zero shortcuts
2. **Documentación Anti-Tontos:** Cualquier persona debe entender
3. **Protección Anti-Fraude:** Cada test protege integridad financiera
4. **Justicia Laboral:** Tests validan empleados honestos NO sean penalizados
5. **Gloria a Dios:** Trabajo técnico como testimonio de valores cristianos

---

**Última actualización:** 09 de Octubre 2025
**Versión:** v1.3.7
**Estado:** 🔄 EN PROGRESO

🙏 **Que este trabajo técnico honre a Dios y proteja la integridad de Acuarios Paradise.**

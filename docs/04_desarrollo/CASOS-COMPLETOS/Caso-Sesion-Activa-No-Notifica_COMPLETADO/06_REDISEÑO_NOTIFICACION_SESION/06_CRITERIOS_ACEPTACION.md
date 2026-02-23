# 06 — Criterios de Aceptación: Opción A — Bloqueo Anti-Fraude en Paso 5

**Caso:** CASO-SANN-R2 — Rediseño de Notificación de Sesión Activa
**Fase DIRM:** Planificación Modular (Opción A Aprobada)
**Fecha:** 2026-02-18
**Estado:** ✅ Listo para validación

---

## Principio Rector

> **Cada criterio es una ORDEN de validación.**
> Si un criterio NO se cumple, la implementación se PAUSA y se escala al usuario.
> CERO excepciones. CERO "casi funciona".

---

## Criterios Automatizados (Tests)

### CA-1: Panel NO visible sin sesión activa

| Campo | Valor |
|-------|-------|
| **Test:** | `hasActiveSession=false` → panel de sesión NO aparece en Step 5 |
| **Archivo test:** | `ActiveSessionStep5.test.tsx` |
| **Validación:** | `expect(screen.queryByText('Sesión en Progreso')).not.toBeInTheDocument()` |
| **Estado esperado:** | ✅ PASS |

---

### CA-2: Panel visible con sesión activa en Step 5

| Campo | Valor |
|-------|-------|
| **Test:** | `hasActiveSession=true` + `currentStep=5` → panel aparece |
| **Archivo test:** | `ActiveSessionStep5.test.tsx` |
| **Validación:** | `expect(screen.getByText('Sesión en Progreso')).toBeInTheDocument()` |
| **Estado esperado:** | ✅ PASS |

---

### CA-3: Texto descriptivo presente

| Campo | Valor |
|-------|-------|
| **Test:** | Panel muestra texto "Existe un corte de caja que no se completó" |
| **Archivo test:** | `ActiveSessionStep5.test.tsx` |
| **Validación:** | `expect(screen.getByText(/corte de caja que no se completó/i)).toBeInTheDocument()` |
| **Estado esperado:** | ✅ PASS |

---

### CA-4: Botón "Reanudar Sesión" presente y funcional

| Campo | Valor |
|-------|-------|
| **Test:** | Botón existe, es clickeable, llama `onResumeSession` |
| **Archivo test:** | `ActiveSessionStep5.test.tsx` |
| **Validación:** | `fireEvent.click(button)` → `expect(onResumeSession).toHaveBeenCalledTimes(1)` |
| **Estado esperado:** | ✅ PASS |

---

### CA-5: Botón "Abortar Sesión" presente y funcional

| Campo | Valor |
|-------|-------|
| **Test:** | Botón existe, es clickeable, llama `onAbortSession` |
| **Archivo test:** | `ActiveSessionStep5.test.tsx` |
| **Validación:** | `fireEvent.click(button)` → `expect(onAbortSession).toHaveBeenCalledTimes(1)` |
| **Estado esperado:** | ✅ PASS |

---

### CA-6: Input SICAR deshabilitado con sesión activa

| Campo | Valor |
|-------|-------|
| **Test:** | `hasActiveSession=true` → input de venta esperada está `disabled` |
| **Archivo test:** | `ActiveSessionStep5.test.tsx` |
| **Validación:** | `expect(input).toBeDisabled()` |
| **Estado esperado:** | ✅ PASS |

---

### CA-7: Botón "Continuar" deshabilitado con sesión activa

| Campo | Valor |
|-------|-------|
| **Test:** | `hasActiveSession=true` → botón de avance al Paso 6 está `disabled` |
| **Archivo test:** | `ActiveSessionStep5.test.tsx` |
| **Validación:** | `expect(continueButton).toBeDisabled()` |
| **Estado esperado:** | ✅ PASS |

---

### CA-8: Panel NO visible en Steps 1-4

| Campo | Valor |
|-------|-------|
| **Test:** | `currentStep=2` + `hasActiveSession=true` → panel NO aparece |
| **Archivo test:** | `ActiveSessionStep5.test.tsx` |
| **Validación:** | `expect(screen.queryByText('Sesión en Progreso')).not.toBeInTheDocument()` |
| **Razón anti-fraude:** | Empleado NO debe saber que hay sesión activa antes de Step 5 |
| **Estado esperado:** | ✅ PASS |

---

## Criterios Anti-Fraude (Validación Estratégica)

### CAF-1: Banner ELIMINADO completamente

| Campo | Valor |
|-------|-------|
| **Verificación:** | Banner azul informativo NO aparece en NINGÚN paso del wizard |
| **Archivo:** | `InitialWizardModalView.tsx` |
| **Validación:** | Líneas 142-166 eliminadas. Grep `hasActiveSession.*Banner` retorna 0 resultados |
| **Razón:** | Empleado tramposo NO debe recibir NINGÚN indicador visual antes de Step 5 |

---

### CAF-2: Zero indicadores visuales en Pasos 1-4

| Campo | Valor |
|-------|-------|
| **Verificación:** | Navegando Pasos 1-4 con sesión activa, ZERO diferencia visual vs sin sesión |
| **Método:** | Comparación visual lado a lado (con sesión vs sin sesión) |
| **Razón:** | Si hay CUALQUIER diferencia visual, el empleado puede detectar la sesión |

---

### CAF-3: Empleado honesto — ZERO fricción

| Campo | Valor |
|-------|-------|
| **Verificación:** | Sin sesión activa → Paso 5 funciona 100% normal (input habilitado, botón activo) |
| **Razón:** | "El que hace bien las cosas ni cuenta se dará" |
| **Método:** | `hasActiveSession=false` → panel NO aparece, flujo idéntico a antes |

---

### CAF-4: Empleado tramposo — Tiempo perdido como castigo

| Campo | Valor |
|-------|-------|
| **Verificación:** | Con sesión activa → empleado completa Pasos 1-4 normalmente (5-10 min) → llega a Step 5 → BLOQUEO |
| **Razón:** | Tiempo perdido = disuasión. Empleado pierde 5-10 min antes de descubrir bloqueo |
| **Evidencia:** | Panel visible SOLO en Step 5, input deshabilitado, botón Continuar deshabilitado |

---

## Criterios Técnicos (Build & Types)

### CT-1: TypeScript sin errores

| Campo | Valor |
|-------|-------|
| **Comando:** | `npx tsc --noEmit` |
| **Resultado esperado:** | 0 errors |
| **Frecuencia:** | Después de CADA módulo |

---

### CT-2: Build exitoso

| Campo | Valor |
|-------|-------|
| **Comando:** | `npm run build` |
| **Resultado esperado:** | Build exitoso sin warnings relacionados |
| **Frecuencia:** | Después de MÓDULO 5 (wiring completo) |

---

### CT-3: Zero tipos `any`

| Campo | Valor |
|-------|-------|
| **Verificación:** | `grep -r "any" src/components/initial-wizard/steps/Step5SicarInput.tsx` → 0 resultados |
| **Razón:** | REGLAS_DE_LA_CASA.md: "Cero `any`, tipado estricto obligatorio" |

---

### CT-4: Tests antiguos sin regresión

| Campo | Valor |
|-------|-------|
| **Verificación:** | Zero tests failing por banner eliminado |
| **Archivo:** | `ActiveSessionBanner.test.tsx` eliminado o deprecated |
| **Validación:** | Suite completa pasa sin errores |

---

## Criterios de Wiring (Conexión End-to-End)

### CW-1: Props fluyen correctamente

| Campo | Valor |
|-------|-------|
| **Cadena:** | `Index.tsx` → `InitialWizardModalView` → `Step5SicarInput` |
| **Props verificadas:** | `hasActiveSession`, `onResumeSession`, `onAbortSession` |
| **Validación:** | TypeScript compila sin errores de props faltantes |

---

### CW-2: Callbacks conectados a funciones reales

| Campo | Valor |
|-------|-------|
| **onResumeSession:** | Conectado a `recuperarSesion()` de `useCorteSesion` |
| **onAbortSession:** | Conectado a `abortarCorte(motivo)` de `useCorteSesion` |
| **Validación:** | Console.log confirma ejecución al click |

---

## Definición de "Done" (ORDEN #10)

La implementación se considera **COMPLETADA** cuando TODOS estos criterios se cumplen:

```
✅ CA-1 a CA-8:   8 tests automatizados PASSING
✅ CAF-1 a CAF-4:  4 criterios anti-fraude validados
✅ CT-1 a CT-4:    4 criterios técnicos cumplidos
✅ CW-1 a CW-2:    2 criterios de wiring confirmados

TOTAL: 18 criterios — 18/18 = DONE
```

---

## Criterios de Pausa (Escalamiento al Usuario)

Si CUALQUIERA de estas condiciones ocurre, se PAUSA y se escala:

1. Cualquier test CA-1 a CA-8 falla después de implementación GREEN
2. `npx tsc --noEmit` reporta errores NO relacionados con el cambio
3. Tests pre-existentes fallan por razón ajena a los cambios
4. Las funciones `abortarCorte()` o `recuperarSesion()` no son accesibles desde `Index.tsx`
5. El wiring de props requiere modificar hooks no contemplados en el plan
6. El agente propone cambios fuera del scope de archivos listados en `05_PLAN_IMPLEMENTACION.md`

---

## Referencias

- `05_PLAN_IMPLEMENTACION.md` — Módulos de ejecución y secuencia de órdenes
- `03_OPCIONES_ARQUITECTONICAS.md` — Justificación Opción A aprobada
- `02_INVENTARIO_INFRAESTRUCTURA.md` — Funciones backend disponibles
- `src/components/initial-wizard/steps/Step5SicarInput.tsx` — Componente destino
- `src/hooks/useCorteSesion.ts` — Funciones abort/resume

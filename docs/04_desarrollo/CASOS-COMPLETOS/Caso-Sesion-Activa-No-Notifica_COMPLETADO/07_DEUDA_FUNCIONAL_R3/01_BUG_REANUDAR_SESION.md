# R3-B1: "Reanudar Sesion" No Ejecuta Accion Real

> Severidad: CRITICA
> Estado: DECISION TOMADA
> Decision Authority: OPCION A — Saltar wizard completo, ir directo a CashCounter
> Detectado por: Usuario (testing manual)
> Quote: "cuando le das reanudar la sesion literalmente no pasa nada"

## 1. Sintoma Observable

El usuario presiona "Reanudar Sesion" en el panel de Step 5 y el panel desaparece,
pero el wizard continua como si fuera un corte NUEVO. No se restauran datos previos
(fase en la que estaba, conteo parcial, gastos registrados, etc.).

## 2. Root Cause

### Codigo actual — `Index.tsx` lineas 176-178:

```typescript
const handleResumeSession = useCallback(() => {
  setHasActiveCashCutSession(false);
}, []);
```

El handler SOLO oculta el panel (pone `hasActiveCashCutSession = false`).
No llama a ninguna funcion de recuperacion de datos.

### Infraestructura disponible pero NO utilizada — `useCorteSesion.ts` lineas 502-552:

```typescript
const recuperarSesion = useCallback(async (): Promise<Corte | null> => {
  // Busca corte activo (INICIADO o EN_PROGRESO) por sucursal_id
  // Trae intento ACTIVO asociado
  // Setea corteActual e intentoActual en estado local
  // Retorna objeto Corte COMPLETO con:
  //   - datos_conteo (conteo parcial guardado)
  //   - fase_actual (en que fase estaba)
  //   - venta_esperada, cajero, testigo
  //   - created_at, updated_at
  return corte;
}, [sucursal_id]);
```

Esta funcion existe, esta probada, y retorna toda la informacion necesaria.
Pero `handleResumeSession` en Index.tsx nunca la invoca.

### Segunda instancia de hook — `Index.tsx` lineas 50-53:

```typescript
const {
  abortarCorte: abortarCorteActivo,
} = useCorteSesion(activeCashCutSucursalId || '');
```

Solo se desestructura `abortarCorte`. No se desestructura `recuperarSesion`.

## 3. Flujo Actual vs Flujo Esperado

### Flujo actual (BUG):
```
1. Usuario presiona "Reanudar Sesion"
2. handleResumeSession() ejecuta
3. setHasActiveCashCutSession(false) -> panel desaparece
4. Input de venta esperada se habilita (vacio)
5. Usuario debe llenar TODO desde cero
6. Al completar wizard -> iniciarCorte() SE EJECUTA (crea NUEVA sesion)
7. Sesion anterior queda HUERFANA en Supabase (INICIADO/EN_PROGRESO)
```

### Flujo esperado (SOLUCION):
```
1. Usuario presiona "Reanudar Sesion"
2. handleResumeSession() ejecuta
3. recuperarSesion() trae datos de Supabase
4. Datos se pre-llenan en wizard O se salta directo a CashCounter
5. Al completar -> NO se llama iniciarCorte() (sesion ya existe)
6. guardarProgreso() continua sincronizando sobre sesion existente
```

## 4. Archivos Afectados

| Archivo | Cambio necesario |
|---------|-----------------|
| `src/pages/Index.tsx` | Desestructurar `recuperarSesion` del segundo hook, llamarlo en handler |
| `src/hooks/useCorteSesion.ts` | Ninguno — infraestructura ya lista |
| `src/components/initial-wizard/steps/Step5SicarInput.tsx` | Posible: estado loading mientras recupera |

## 5. Preguntas Arquitectonicas Abiertas

### P1: Que hacer con los datos recuperados?

**Opcion A — Saltar wizard, ir directo a CashCounter:**
- recuperarSesion() trae fase_actual y datos_conteo
- Si fase >= 1 (conteo iniciado), saltar directo a CashCounter con datos pre-cargados
- Pro: UX rapida, continua donde dejo
- Contra: Complejidad alta (CashCounter necesita recibir estado parcial)

**Opcion B — Pre-llenar wizard y dejar que usuario confirme:**
- recuperarSesion() trae venta_esperada, cajero, testigo
- Pre-llenar campos del wizard (Steps 2-5)
- Usuario confirma/modifica y completa
- Pro: Mas simple, reutiliza flujo existente
- Contra: Usuario repite pasos ya completados

**Opcion C — Hibrido: depende de fase_actual:**
- Si fase_actual = 0 (solo wizard hecho, conteo no iniciado) -> Opcion B
- Si fase_actual >= 1 (conteo en progreso) -> Opcion A
- Pro: Mejor UX segun contexto
- Contra: Mas logica condicional

### P2: Que pasa con la sesion anterior si el usuario NO reanuda?

Actualmente `handleModeSelection` llama `detectActiveCashCutSession()` y guarda
`activeCashCutSucursalId`. Luego en `handleWizardComplete` linea 135-160:
- Si `activeCashCutSucursalId` existe -> NO llama `iniciarCorte()` (correcto)
- Pero los datos de esa sesion no se recuperan -> sesion queda huerfana

### P3: Como interactua con el guardarProgreso existente?

`handleWizardComplete` linea 136 usa `activeCashCutSucursalId ?? data.selectedStore`
para el sync. Si hay sesion activa, syncSucursalId = activeCashCutSucursalId.
Esto significa que `guardarProgreso` YA escribe sobre la sesion correcta.
El problema es que NO se leen los datos previos al iniciar.

## 6. Complejidad Estimada

- **Opcion B (recomendada para primera iteracion):** Media
  - Desestructurar `recuperarSesion` (1 linea)
  - Llamar en handler, esperar resultado (5-10 lineas)
  - Pre-llenar wizardData con datos de Corte (5-10 lineas)
  - Tests TDD: ~4-6 tests

- **Opcion A/C (futuro):** Alta
  - CashCounter necesita aceptar estado parcial como prop
  - usePhaseManager necesita poder iniciar en fase arbitraria
  - Tests TDD: ~10-15 tests

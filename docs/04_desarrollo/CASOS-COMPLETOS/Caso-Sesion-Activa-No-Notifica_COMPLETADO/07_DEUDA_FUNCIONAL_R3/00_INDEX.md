# CASO-SANN-R3: Deuda Funcional Post-Implementacion

> Subcaso de: `Caso-Sesion-Activa-No-Notifica`
> Fase anterior: R2 (Rediseno panel anti-fraude Step 5) - COMPLETADA commit `b5b390f`
> Fecha apertura: 2026-02-18
> Estado global: DECISIONES TOMADAS — LISTO PARA ORDENES TDD

## Tabla de Estado

| ID | Bug | Severidad | Decision | Estado | Documento |
|----|-----|-----------|----------|--------|-----------|
| R3-B4 | Sucursal preseleccionada sin accion usuario | MEDIA | Opcion A: Eliminar preseleccion | LISTO PARA TDD | [04_BUG_PRESELECCION_SUCURSAL.md](./04_BUG_PRESELECCION_SUCURSAL.md) |
| R3-B3 | Barra "Conectado" no visible en wizard | BAJA | Opcion B: Icono minimo en panel | LISTO PARA TDD | [03_BUG_BARRA_CONECTADO_WIZARD.md](./03_BUG_BARRA_CONECTADO_WIZARD.md) |
| R3-B5 | "Abortar Sesion" sin confirmacion ni feedback | ALTA | Solucion unica: Modal + toast + fix state | LISTO PARA TDD | [05_BUG_ABORTAR_SIN_FEEDBACK.md](./05_BUG_ABORTAR_SIN_FEEDBACK.md) |
| R3-B2 | Sin identificador de sesion visible | MEDIA | Solucion unica: Expandir select + propagar | LISTO PARA TDD | [02_BUG_IDENTIFICADOR_SESION.md](./02_BUG_IDENTIFICADOR_SESION.md) |
| R3-B1 | "Reanudar Sesion" no ejecuta accion real | CRITICA | Opcion A: Saltar wizard a CashCounter | LISTO PARA TDD | [01_BUG_REANUDAR_SESION.md](./01_BUG_REANUDAR_SESION.md) |

## Contexto

El usuario completo testing funcional del panel anti-fraude (R2) y detecto 5 problemas
de deuda funcional. El panel se renderiza correctamente en Step 5 y bloquea el input,
pero los botones y la experiencia tienen gaps que deben resolverse individualmente.

## Origen de Deteccion

- Testing manual por el usuario (Authority) con 5 screenshots
- Quote: "en funcionabilidad todavia tenemos deuda tecnica"
- Quote: "son varios problemas que requieren analisis por separado"

## Protocolo

Cada bug sigue el ciclo DIRM:
1. INVESTIGACION (este lote) - Analisis forense, root cause, archivos afectados
2. GUIA ARQUITECTONICA - Propuesta de solucion con opciones
3. APROBACION por Authority
4. TDD RED - Tests que fallan documentando el comportamiento esperado
5. GREEN - Implementacion minima
6. REFACTOR si aplica

## Archivos Clave del Ecosistema

| Archivo | Lineas | Rol |
|---------|--------|-----|
| `src/pages/Index.tsx` | 309 | Orquestador principal, handlers resume/abort |
| `src/hooks/useCorteSesion.ts` | 585 | Hook sesion Supabase (recuperar, abortar, iniciar) |
| `src/components/initial-wizard/steps/Step5SicarInput.tsx` | 159 | Panel sesion activa UI |
| `src/hooks/initial-wizard/useInitialWizardController.ts` | 203 | Controller wizard, preseleccion sucursal |
| `src/components/initial-wizard/InitialWizardModalView.tsx` | 228 | View orchestrator, routing steps |
| `src/types/initialWizard.ts` | 136 | Tipos props wizard |
| `src/components/corte/CorteStatusBanner.tsx` | 176 | Barra estado sync (verde/amarillo/rojo) |
| `src/components/CashCounter.tsx` | 191 | Renderiza CorteStatusBanner (desmonolitizado v1.4.1) |

## Dependencias entre Bugs

```
R3-B1 (Reanudar) ──> requiere decidir QUE datos restaurar
R3-B2 (Identificador) ──> independiente, UI pura
R3-B3 (Barra Conectado) ──> independiente, ubicacion render
R3-B4 (Preseleccion) ──> independiente, UX wizard
R3-B5 (Abortar feedback) ──> independiente, UX confirmacion
```

R3-B1 es el mas complejo (requiere definir flujo de recuperacion completo).
R3-B2 a R3-B5 son independientes entre si y pueden resolverse en cualquier orden.

# Analisis Comparativo: UI Tradicional vs UI Nueva

**Fecha:** 2026-02-17  
**Caso:** `Caso_Estrategia_UI_Datos_Reales_20260217/`

## 1. Pregunta de negocio
Definir que interfaz debe gobernar el flujo de corte hoy:
1. UI tradicional (la conocida por operacion).
2. UI nueva (modulo corte/auditoria).
3. Estrategia por fases.

## 2. Hallazgos tecnicos verificados

### Hallazgo A: La UI tradicional es la ruta activa hoy
Evidencia de codigo:
- `src/App.tsx` enruta `"/"` a `Index`.
- `src/pages/Index.tsx` monta:
  - `OperationSelector`
  - `InitialWizardModal` (corte nocturno)
  - `MorningCountWizard` (conteo matutino)
  - `CashCounter` (flujo de conteo y reporte)

Conclusion:
- La experiencia operativa principal hoy es la tradicional.

### Hallazgo B: La UI nueva de corte existe, pero no esta conectada al flujo principal
Evidencia de codigo:
- `src/components/corte/CortePage.tsx` y `src/components/corte/CorteOrquestador.tsx` existen.
- No hay import/uso de `CortePage` desde `src/pages/Index.tsx` ni `src/App.tsx`.

Conclusion:
- La UI nueva no gobierna actualmente la operacion real del home principal.

### Hallazgo C: El desajuste de datos locales vs Supabase tiene causa estructural clara
Evidencia de codigo:
- `src/lib/supabase.ts` define `isSupabaseConfigured` segun `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- En este worktree solo existe `.env.example`; no hay `.env`/`.env.local` con esas variables.
- `src/hooks/useSucursales.ts` usa `SUCURSALES_MOCK` cuando `isSupabaseConfigured === false`.
- `src/hooks/useEmpleadosSucursal.ts` cae a `getEmployeesByStore` legacy cuando `isSupabaseConfigured === false`.

Conclusion:
- Si no hay variables de entorno reales, la UI no puede mostrar datos reales de Supabase.
- El problema reportado es consistente con modo fallback local.

### Hallazgo D: Diferencia de contrato entre UI tradicional y UI nueva
- UI tradicional (wizard nocturno) usa seleccion por IDs y protocolo de pasos obligatorio.
- UI nueva (`CorteInicio`) usa entradas de texto para cajero/testigo, modelo de 4 pasos y otro contrato (`IniciarCorteParams`).

Conclusion:
- Migrar de golpe a UI nueva cambia UX, datos, validaciones y riesgo operacional.

## 3. Opciones evaluadas

### Opcion 1: Cambiar ya a UI nueva
Pros:
- Unifica con arquitectura corte/auditoria nueva.

Contras:
- Alto riesgo de regresion funcional y UX.
- No hay paridad completa validada con el flujo tradicional.
- Requiere reabrir varios contratos al mismo tiempo.

### Opcion 2: Mantener UI tradicional y conectar datos reales primero
Pros:
- Menor riesgo operativo.
- Preserva recorrido obligatorio que ya conoce operacion.
- Permite limpiar fuente de datos antes de tocar apariencia/flujo.

Contras:
- Conviven temporalmente dos UIs en repositorio.

### Opcion 3: Hibrida por fases (recomendada)
1. Canon operativo = UI tradicional con datos reales.
2. UI nueva como track de modernizacion controlada con feature flag.
3. Migracion solo cuando exista paridad funcional y evidencia de pruebas.

## 4. Recomendacion arquitectonica
Recomiendo **Opcion 3 (hibrida por fases)** con ejecucion inmediata de la parte 1:
- Primero estabilizar datos reales en la UI tradicional (fuente unica Supabase en runtime real).
- Despues modernizar UI de forma incremental, con pruebas de paridad y salida Go/NoGo por modulo.

## 5. Riesgos si se cambia de UI sin fases
- Perdida de trazabilidad del flujo obligatorio en operacion.
- Inconsistencias entre IDs, nombres y contratos de corte.
- Aumento de deuda tecnica por mezclar migracion visual y de datos en un solo bloque.

## 6. Decision propuesta
**Decision:** mantener UI tradicional como oficial en produccion local inmediata, con datos reales de Supabase habilitados y verificados.  
**Modernizacion:** en modulo separado y con activacion gradual.

## 7. Siguiente paso
Ejecutar `02_Plan_Arquitectonico_Modular_TDD.md`.

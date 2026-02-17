# 01 Diagnostico Tecnico

## 1. Hallazgo principal
Existen 2 fuentes de datos para sucursales/empleados:

1. Fuente Supabase (correcta, actualizada).
2. Fuente estatica local (`src/data/paradise.ts`) usada por componentes legacy.

Esto abre brecha funcional: cambios recientes en Supabase no se reflejan en vistas que siguen consumiendo catalogos estaticos.

## 2. Hallazgo de UX en CorteInicio
En `CorteInicio`, cuando cajero viene precargado por localStorage y hay varios empleados, el `datalist` inicia filtrado por ese valor.

Resultado percibido por usuario: parece que solo hay 1 empleado disponible.

## 3. Causa raiz
- Causa estructural: duplicidad de origen de datos (Supabase vs estatico).
- Causa puntual de pantalla: prefill no normalizado antes de mostrar sugerencias.

## 4. Evidencia de codigo
- Supabase:
  - `src/hooks/useEmpleadosSucursal.ts`
  - `src/lib/supabase.ts`
- Estatico:
  - `src/data/paradise.ts`
  - `src/hooks/useCashCounterOrchestrator.ts`
- Fix puntual aplicado:
  - `src/components/corte/CorteInicio.tsx`
  - `src/components/corte/__tests__/CorteInicio.test.tsx`

## 5. Riesgo residual
Mientras exista la doble fuente, cualquier alta/baja/cambio de empleado en Supabase puede no reflejarse en flows legacy.

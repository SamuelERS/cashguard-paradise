# Ruta de Estabilizacion del Modelo Propio

**Fecha:** 2026-02-17  
**Caso:** `Caso_Estrategia_UI_Datos_Reales_20260217/`

## Objetivo
Estabilizar primero la UI operativa actual (modelo propio/tradicional) con datos reales de Supabase, antes de cualquier modernizacion visual adicional.

## Diagnostico consolidado
1. Hubo dos causas de inestabilidad observadas:
   - Sesiones locales sin servidor `dev` realmente activo (intermitencia en `localhost:5173`).
   - Camino de UI que podia terminar en fallback vacio (`return null`) bajo combinaciones de estado.
2. El flujo ya no debe quedar en pantalla vacia:
   - Se agrego recuperacion para `CASH_COUNT` cuando no hay subflujo visible.
   - El fallback final ahora retorna `OperationSelector` en lugar de `null`.

## Evidencia de estabilizacion (hoy)
Comandos ejecutados:

```bash
npm run test:unit -- --run src/__tests__/unit/pages/index.stability.test.tsx
npm run build
npm run test:e2e:smoke
```

Resultado:
- Unit tests: `15 files, 276 tests, PASS`
- Build: `PASS`
- Smoke e2e: `2/2 PASS` (`App loads and shows operation selector`, `Morning count starts without PIN`)

## Ruta clara (sin mezclar objetivos)
1. **Fase S1 - Estabilidad operativa (actual)**
   - Mantener UI tradicional como canon.
   - Cerrar cualquier fallback silencioso a datos legacy.
   - Gate: unit + smoke + build en verde.
2. **Fase S2 - Integridad de datos Supabase**
   - Confirmar mapeo completo de captura y persistencia (monedas, billetes, venta SICAR, gastos, metadatos de corte).
   - Gate: matriz captura vs persistencia validada por caso.
3. **Fase S3 - Robustez de flujo**
   - Agregar pruebas de regresion sobre estados incompletos (sin pantalla negra, sin bloqueos de avance).
   - Gate: pruebas de flujo critico en verde.
4. **Fase S4 - Modernizacion controlada**
   - Activar UI nueva solo con feature flag y paridad funcional demostrada.
   - Gate: Go/NoGo con evidencia, rollback inmediato disponible.

## Regla de avance
No se abre trabajo visual de modernizacion mientras no cierre PASS la fase de estabilidad/integridad del modelo propio.

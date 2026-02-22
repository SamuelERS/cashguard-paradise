# Peticion de Implementacion - No Perdida de Datos (TDD)

**Fecha:** 2026-02-17  
**Dirigido a:** Proximo agente de ejecucion  
**Politica:** tests primero, cambios quirurgicos, cero perdida de datos.

## Objetivo obligatorio
Garantizar que todo dato capturado por el empleado durante el corte quede persistido en Supabase de forma consistente y recuperable:
- SICAR
- Monedas y billetes
- Pagos electronicos
- Gastos
- Entrega a gerencia
- Verificacion ciega
- Resumen/reporte final

## Alcance tecnico (implementacion)
1. Conectar el flujo UI activo (`/`, `Index -> InitialWizardModal -> CashCounter`) con la capa `useCorteSesion`.
2. Implementar guardado incremental por fase en `cortes`:
   - `datos_conteo`
   - `datos_entrega`
   - `datos_verificacion`
   - `datos_reporte`
3. Mantener `corte_intentos.snapshot_datos` como snapshot completo y no solo parcial.
4. Finalizar corte solo cuando los bloques obligatorios esten persistidos y validados.

## TDD obligatorio (antes de codigo productivo)
1. Escribir tests RED de integracion para demostrar que hoy falta persistencia completa.
2. Casos minimos a cubrir:
   - Flujo corte completo guarda SICAR + conteo + electronicos + gastos.
   - Fase 2 guarda entrega + verificacion.
   - Fase 3 guarda reporte completo + hash.
   - Reinicio/aborto conserva snapshot util para auditoria.
   - Recuperacion de sesion restaura datos persistidos y no pierde avance.
3. Pasar a GREEN con cambios minimos y refactor posterior.

## Propuesta de contrato de persistencia (recomendada)
> Si ya existe un contrato oficial en DB, respetarlo; esta propuesta es baseline para no perder detalle.

### `cortes.datos_conteo`
```json
{
  "conteo_parcial": { "penny": 0, "nickel": 0, "dime": 0, "quarter": 0, "dollarCoin": 0, "bill1": 0, "bill5": 0, "bill10": 0, "bill20": 0, "bill50": 0, "bill100": 0 },
  "pagos_electronicos": { "credomatic": 0, "promerica": 0, "bankTransfer": 0, "paypal": 0 },
  "gastos_dia": [],
  "totales": { "total_cash": 0, "total_electronic": 0, "total_general": 0, "total_expenses": 0, "total_with_expenses": 0 }
}
```

### `cortes.datos_entrega`
```json
{
  "amount_to_deliver": 0,
  "amount_remaining": 0,
  "denominations_to_deliver": {},
  "denominations_to_keep": {},
  "delivery_steps": [],
  "verification_steps": []
}
```

### `cortes.datos_verificacion`
```json
{
  "verification_behavior": {
    "totalAttempts": 0,
    "firstAttemptSuccesses": 0,
    "secondAttemptSuccesses": 0,
    "thirdAttemptRequired": 0,
    "forcedOverrides": 0,
    "criticalInconsistencies": 0,
    "severeInconsistencies": 0,
    "attempts": [],
    "severityFlags": [],
    "forcedOverridesDenoms": [],
    "criticalInconsistenciesDenoms": [],
    "severeInconsistenciesDenoms": [],
    "denominationsWithIssues": []
  }
}
```

### `cortes.datos_reporte`
```json
{
  "calculation_data": {},
  "expected_sales_original": 0,
  "expected_sales_adjusted": 0,
  "difference": 0,
  "report_text": "",
  "generated_at": "",
  "pending_deliveries_snapshot": []
}
```

## Criterios de aceptacion
1. Cada paso critico del empleado deja evidencia persistida en Supabase.
2. Reinicio de intento conserva snapshot completo del estado previo.
3. Finalizar no borra ni sobrescribe datos historicos relevantes.
4. Pruebas automatizadas + build verde.
5. Evidencia en docs del caso y verificacion manual en local.

## Riesgo si no se ejecuta
Se mantiene exposicion a cortes sin trazabilidad completa, comprometiendo auditoria y control operativo.

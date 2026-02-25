# QA Checklist: discrepancia sesión activa nocturna vs supervisor

Fecha: 2026-02-24
Ambiente: local (`http://localhost:5173`)

## Objetivo
Validar que el flujo nocturno y el dashboard de supervisor usan la misma fuente de verdad para estados activos/terminales, y que errores de conexión Supabase se muestran de forma accionable.

## Precondición
Antes de ejecutar esta checklist, correr el runbook [supabase-reset-y-validacion-cortes.md](/Users/samuelers/Paradise%20System%20Labs/cashguard-paradise/docs/qa/supabase-reset-y-validacion-cortes.md) para trabajar con dataset limpio y reciente.

## Guion manual
1. Iniciar un corte nocturno y dejarlo en estado `EN_PROGRESO` (sin finalizar).
2. Abrir Dashboard Supervisor y confirmar que el corte aparece como `EN_PROGRESO`.
3. Regresar a Selector de Operación y abrir `Corte Nocturno`.
4. Avanzar hasta el paso de inicio (ingreso de total vendido):
   - Debe bloquear inicio de nuevo corte si existe sesión activa de la misma sucursal.
   - Debe pedir reanudar sesión activa.
5. Simular desconexión (`DevTools -> Network -> Offline`) e intentar continuar:
   - Debe mostrar error específico de conectividad Supabase.
   - No debe crear nuevo corte.

## Registro de ejecución
- Paso 1: [ ] Pass [ ] Fail
- Paso 2: [ ] Pass [ ] Fail
- Paso 3: [ ] Pass [ ] Fail
- Paso 4: [ ] Pass [ ] Fail
- Paso 5: [ ] Pass [ ] Fail

## Evidencia
- Screenshot 1:
- Screenshot 2:
- Screenshot 3:

## Notas / hallazgos
- Pendiente de ejecución manual.

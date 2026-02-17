# Protocolo de Traslado a CASOS-COMPLETOS

**Fecha:** 2026-02-17  
**Caso:** `Caso_Plan_Modular_Unificacion_Catalogos_20260217/`

## Objetivo
Estandarizar cómo mover casos terminados para mantener orden modular y trazabilidad.

## Carpeta oficial de cierre operativo
- `docs/04_desarrollo/CASOS-COMPLETOS/`

## Cuándo mover un caso
Un caso se mueve cuando cumple todo:
1. `00_README.md` con estado 🟢 Completado y verificado.
2. Evidencia de tests y build incluida en el caso.
3. No quedan tareas pendientes en su checklist.

## Procedimiento
1. Verificar checklist de cierre.
2. Renombrar carpeta origen a prefijo `COMPLETO_` si aplica.
3. Mover carpeta a `docs/04_desarrollo/CASOS-COMPLETOS/`.
4. Actualizar índice del caso origen o índice del área.
5. Registrar fecha de traslado en el `00_README.md` del caso.

## Nota de gobernanza documental
`CASOS-COMPLETOS` funciona como **zona de cierre operativo** del equipo de desarrollo.  
El archivo histórico anual en `docs/_archivo/YYYY/` puede ejecutarse por lote en un ciclo posterior, sin mezclarlo con trabajo técnico activo.

## Checklist de traslado
- [ ] Estado 🟢 en `00_README.md`
- [ ] Tests relevantes en verde
- [ ] Build en verde
- [ ] Evidencia de validación presente
- [ ] Ruta final bajo `CASOS-COMPLETOS`

# Caso: Sesion Activa No Notifica al Usuario

## Identificador
`CASO-SANN` (Sesion Activa No Notifica)

## Fecha de Apertura
2026-02-17

## Estado
EN INVESTIGACION - Fase de Planificacion Arquitectonica (DIRM)

## Problema Reportado (Palabras del Usuario)
> "actualmente te sincroniza te dice que sincroniza pero cuando lo reinicias a la fuerza
> y quiere volver a aplicar y llena los datos otra vez no te avisa que ya no reconoce
> que hay una sesion activa por lo cual surge la duda realmente guardo la sesion o no"

## Hallazgo Clave (FASE 1 Investigacion)
**La sesion SI se guarda correctamente en Supabase.** El problema es exclusivamente
de comunicacion UX: el wizard NO muestra al usuario que detecto una sesion activa.

## Indice de Documentos Modulares

| # | Archivo | Tarea Especifica | Estado |
|---|---------|-----------------|--------|
| 01 | `01_DIAGNOSTICO_RAIZ.md` | Diagnostico completo del problema y data flow | Completo |
| 02 | `02_MAPA_ARCHIVOS_AFECTADOS.md` | Archivos involucrados con lineas exactas | Completo |
| 03 | `03_GUIA_SOLUCION_UX.md` | Guia arquitectonica de la solucion UX | Completo |
| 04 | `04_CRITERIOS_ACEPTACION.md` | Criterios medibles para validar la solucion | Completo |

## Regla de Oro DIRM
> Un archivo representa una sola tarea especifica que debe ser validada
> antes de pasar al siguiente modulo. No se permite codigo funcional,
> solo la hoja de ruta tecnica y estructural.

## Archivos Origen (Screenshots del Usuario)
El usuario proporciono screenshot mostrando:
- App funcionando con banner "Conectado -- Datos sincronizados"
- Wizard de "Instrucciones de Conteo" visible
- Evidencia de que la sincronizacion visual funciona DESPUES del wizard

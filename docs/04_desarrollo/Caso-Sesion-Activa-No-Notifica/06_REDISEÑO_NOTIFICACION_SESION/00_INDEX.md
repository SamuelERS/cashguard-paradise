# Caso: CASO-SANN-R2 — Rediseno de Notificacion de Sesion Activa

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-18 |
| **Fecha actualizacion** | 2026-02-18 |
| **Estado** | ✅ Opcion A Aprobada — Listo para Implementacion |
| **Prioridad** | Alta |
| **Responsable** | DIRECTOR (Claude) + Agente Programador |
| **Caso padre** | CASO-SANN (Sesion Activa No Notifica) |
| **Fase DIRM** | Planificacion de Implementacion (Opcion A Aprobada) |
| **Opcion aprobada** | **A — Bloqueo en Paso 5 (castigo anti-fraude por tiempo perdido)** |
| **Justificacion** | Empleados reinician app para re-hacer cortes. Opcion A los obliga a rellenar Pasos 1-4 antes de descubrir bloqueo en Paso 5. Tiempo perdido = disuasion. |

---

## Resumen

El banner informativo implementado en CASO-SANN y refinado en CASO-SANN-R1 tiene un **problema de privacidad operacional**: al aparecer en los Pasos 2-6 del wizard, revela a otros empleados cercanos que se esta realizando un corte de caja y en cual sucursal. El usuario solicita redisenar COMO y DONDE se notifica la sesion activa.

## Problema Reportado (Palabras del Usuario)

> "al mostrarlo aqui directamente hace que los demas empleados sepan a que horas
> estan haciendo corte es mejor que aparezca en el apartado donde ponen la venta
> de sicar... O la otra es que al llegar a esa pantalla se abra un modal con los
> botones de abortar sesion reanudar la sesion"

## Evidencia Visual del Usuario

- **Screenshot 1 (Paso 2):** Banner azul "Se detecto una sesion activa — Sucursal: Plaza Merliot" visible en pantalla de seleccion de sucursal. PROBLEMA: Cualquier empleado cercano puede leer esta informacion.
- **Screenshot 2 (Paso 5):** Pantalla de SICAR con panel "Resumen de Informacion" mostrando Sucursal, Cajero, Testigo. El usuario sugiere que AQUI es donde deberia aparecer la notificacion de sesion activa.

## Alternativas Propuestas por el Usuario

| ID | Alternativa | Descripcion |
|----|-------------|-------------|
| **A** | Mover a Paso 5 | Notificacion aparece en el apartado de venta SICAR con controles bloqueados |
| **B** | Modal con botones | Al llegar a cierto paso, abrir modal con "Abortar Sesion" / "Reanudar Sesion" |

## Hallazgo Clave de Investigacion

El hook `useCorteSesion.ts` YA tiene implementada toda la infraestructura backend para abort/resume:
- `abortarCorte(motivo)` — Marca sesion como ABORTADO
- `recuperarSesion()` — Recupera sesion activa de Supabase
- `reiniciarIntento(motivo)` — Crea nuevo intento sin abortar sesion

**CERO de estas funciones tiene UI asociada actualmente.** El sistema solo usa reanudacion automatica via banner informativo.

## Documentos Modulares

| # | Archivo | Tarea Especifica | Estado |
|---|---------|-----------------|--------|
| 01 | `01_DIAGNOSTICO_PROBLEMA_UX.md` | Problema de privacidad + evidencia visual | ✅ |
| 02 | `02_INVENTARIO_INFRAESTRUCTURA.md` | Funciones existentes abort/resume/restart | ✅ |
| 03 | `03_OPCIONES_ARQUITECTONICAS.md` | Evaluacion de alternativas A, B, C | ✅ |
| 04 | `04_MAPA_ARCHIVOS_IMPACTADOS.md` | Archivos que se modificarian por opcion | ✅ |
| 05 | `05_PLAN_IMPLEMENTACION.md` | Modulos de ejecucion secuencial (Opcion A) | ✅ |
| 06 | `06_CRITERIOS_ACEPTACION.md` | Criterios medibles automatizados + visuales | ✅ |

## Regla de Oro DIRM

> Un archivo = una tarea. CERO codigo funcional hasta aprobacion explicita.
> La decision arquitectonica es del USUARIO, no del director ni del agente.

## Referencias

- Caso padre: `Caso-Sesion-Activa-No-Notifica/`
- CASO-SANN: Banner implementado (ORDENES #1-#4)
- CASO-SANN-R1: Banner refinado a Step 2+ (ORDEN #5-#6)
- `src/hooks/useCorteSesion.ts` — Infraestructura abort/resume
- `src/components/initial-wizard/steps/Step5SicarInput.tsx` — Destino propuesto Opcion A

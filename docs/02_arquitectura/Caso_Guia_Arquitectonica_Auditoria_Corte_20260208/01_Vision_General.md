# 01 — Visión General del Sistema

**Fecha:** 2026-02-08
**Caso:** Caso_Guia_Arquitectonica_Auditoria_Corte_20260208
**Cubre:** Qué es el sistema, qué problema resuelve, cuál es el objetivo
**No cubre:** Detalles técnicos de implementación, modelo de datos, endpoints

---

## Qué es CashGuard Paradise

CashGuard Paradise es una aplicación PWA (Progressive Web App) diseñada para controlar el proceso de corte de caja en sucursales de retail. Su función principal es:

1. Guiar al empleado en el conteo físico de efectivo (denominación por denominación)
2. Calcular automáticamente totales y diferencias contra ventas esperadas
3. Verificar la integridad del conteo mediante un sistema de verificación ciega
4. Generar un reporte formal enviado por WhatsApp al supervisor

## El problema que debe resolverse

El sistema actual opera **100% en el navegador**. No existe backend, base de datos, ni persistencia real. Esto significa que:

- Un empleado puede cerrar el navegador y repetir el corte cuantas veces quiera
- No queda registro de intentos previos
- No existe correlativo que identifique un corte como evento único
- No hay forma de auditar si un corte fue manipulado
- El modo incógnito elimina cualquier restricción local

**Consecuencia directa:** El sistema premia al que reinicia hasta cuadrar. Un faltante real puede ocultarse repitiendo el proceso.

## Objetivo de esta arquitectura

> Convertir el corte de caja de un "formulario que se puede reintentar indefinidamente" en un **evento financiero único, con identidad, trazabilidad y auditoría**.

### Criterios de éxito

1. **Identidad:** Cada corte tiene un correlativo único generado por el servidor
2. **Unicidad:** Un solo corte activo por sucursal por día
3. **Trazabilidad:** Cada intento (incluidos los abandonados) queda registrado
4. **Persistencia:** Cerrar el navegador no destruye el corte; se reanuda
5. **Anti-bypass:** Incógnito, otro navegador, otro dispositivo — mismo resultado
6. **Auditoría:** El supervisor puede ver todos los intentos, con timestamps y motivos

## Qué NO cambia

El flujo de conteo actual (Phase 1 → Phase 2 → Phase 3), la verificación ciega, el sistema anti-fraude de 3 intentos, y la generación de reportes WhatsApp **no se modifican**. La arquitectura propuesta envuelve el flujo existente con una capa de control y persistencia.

## Principios obligatorios

- Backend como fuente de verdad
- No lógica crítica solo en frontend
- No estado crítico no persistente
- Cobertura mínima de tests: 70%
- Compatibilidad CI/CD obligatoria

---

**Siguiente:** → Ver `02_Arquitectura_Actual.md`

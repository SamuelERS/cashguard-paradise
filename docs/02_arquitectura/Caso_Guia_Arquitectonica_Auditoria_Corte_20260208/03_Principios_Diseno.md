# 03 — Principios de Diseño y Control Interno

**Fecha:** 2026-02-08
**Caso:** Caso_Guia_Arquitectonica_Auditoria_Corte_20260208
**Cubre:** Principios arquitectónicos no negociables, reglas de control interno
**No cubre:** Implementación técnica, modelo de datos

---

## Principio rector

> **Sin servidor, no hay autoridad. Sin autoridad, no hay corte válido.**

Todo diseño, toda decisión técnica, toda línea de código debe responder a este principio. Si una operación financiera crítica no puede ser verificada por el servidor, no es válida.

## Principios arquitectónicos obligatorios

### P1. Backend como fuente de verdad

- La fuente de verdad de un corte de caja es el servidor, no el navegador
- El cliente es un canal de captura, no el custodio de la información
- Ningún estado crítico puede depender exclusivamente de memoria volátil del browser
- localStorage y sessionStorage son cache local, no persistencia

### P2. No permitir monolitos

- Ningún archivo debe superar las responsabilidades de una sola capa
- Separar: captura UI / lógica de negocio / persistencia / comunicación
- Los hooks existentes (usePhaseManager, useGuidedCounting) se mantienen como capa de lógica local
- Se agrega una capa nueva de sincronización con backend

### P3. No permitir archivos gigantes

- Máximo 500 líneas por archivo de código (mismo principio que documentación)
- Si un módulo crece, dividirlo en submódulos
- Los archivos actuales que exceden esto (CashCalculation.tsx, Phase2VerificationSection.tsx) se dejan como están por ahora; los módulos nuevos deben cumplir esta regla

### P4. No permitir lógica crítica solo en frontend

Las siguientes operaciones **deben** tener validación server-side:

| Operación | Hoy (solo frontend) | Objetivo (con backend) |
|-----------|---------------------|----------------------|
| Generar correlativo | No existe | Server genera UUID + secuencial |
| Validar unicidad de corte | No existe | UNIQUE constraint en DB |
| Registrar inicio de corte | No existe | INSERT con timestamp + IP |
| Registrar finalización | `setState(true)` | UPDATE con firma hash |
| Validar PIN supervisor | SHA-256 client-side | Hash comparado server-side |
| Registrar intentos | No existe | INSERT por cada attempt |
| Bloquear resultados | Boolean en React state | Server confirma envío |

### P5. No permitir estado crítico no persistente

Todo dato financiero que pase por el sistema debe poder recuperarse si:
- El usuario cierra la pestaña
- El usuario hace F5
- Se cae el internet temporalmente
- El usuario abre otra pestaña

**Mecanismo:** Guardado progresivo al backend en cada transición de fase.

## Reglas de control interno

### CI1. Un corte = un evento

Un corte no es un formulario. Es un evento financiero que:
- Tiene identidad (correlativo único)
- Tiene momento de inicio y momento de finalización
- No se puede "des-hacer" una vez iniciado
- Si se abandona, queda registro del abandono

### CI2. Reintentos son visibles

Si un empleado reinicia el proceso:
- El intento previo queda registrado como ABANDONADO
- El nuevo intento se marca como Attempt #2 (o #3, #4...)
- El usuario ve explícitamente: "Este es tu intento #N"
- El supervisor puede ver todos los intentos

### CI3. Finalización es irreversible

Un corte FINALIZADO:
- No se puede modificar
- No se puede eliminar
- No se puede crear otro corte para la misma sucursal/día (excepto con PIN supervisor)
- El reporte asociado tiene un hash verificable

### CI4. El sistema informa, no castiga

El sistema registra hechos, no emite juicios. Registrar "Attempt 2: ABANDONADO" es informar. La decisión sobre consecuencias es del supervisor humano.

## Filosofía Paradise

Estos principios deben alinearse con la filosofía operativa:

- **"El que hace bien las cosas ni cuenta se dará"** → Empleado honesto: 1 intento, 1 corte, zero fricción
- **"No mantenemos malos comportamientos"** → Reiniciar para ocultar faltante = comportamiento registrado
- **ZERO TOLERANCIA** → Trazabilidad 100% de anomalías

## Principios de testing (obligatorio)

- Cobertura mínima: **70%** en módulos nuevos
- Tests unitarios para toda lógica de negocio
- Tests de integración para flujo de sync con backend
- Tests smoke/regression para CI/CD
- Ningún módulo crítico entra sin tests
- Compatibilidad CI/CD obligatoria (GitHub Actions)

---

**Siguiente:** → Ver `04_Arquitectura_Propuesta.md`

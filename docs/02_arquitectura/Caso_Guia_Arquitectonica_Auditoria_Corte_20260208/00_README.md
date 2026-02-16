# Caso: Guía Arquitectónica — Sistema de Auditoría de Corte de Caja

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-08 |
| **Fecha actualización** | 2026-02-08 |
| **Estado** | ✅ Completado |
| **Prioridad** | Alta |
| **Responsable** | Claude (Arquitecto del Sistema) |

## Resumen

Guía arquitectónica completa para el sistema de auditoría y control de corte de caja. Define el marco técnico, principios, entidades, estados, políticas y convenciones que todo agente programador debe seguir antes y durante la implementación.

## Contexto

La inspección técnica (PROPUESTA_FORMAL_SISTEMA_AUDITORIA_CORTE.md) reveló que CashGuard Paradise es 100% client-side sin backend ni persistencia. Se identificaron 5 vulnerabilidades críticas de bypass. Esta guía establece el marco arquitectónico para resolver esas vulnerabilidades con un backend real.

## Documentos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_Vision_General.md` | Visión del sistema, problema, objetivo | ✅ |
| `02_Arquitectura_Actual.md` | Estado real del código hoy (diagnóstico) | ✅ |
| `03_Principios_Diseno.md` | Principios de diseño y control interno | ✅ |
| `04_Arquitectura_Propuesta.md` | Arquitectura objetivo (alto nivel) | ✅ |
| `05_Entidades_Estados.md` | Modelo de datos y máquina de estados | ✅ |
| `06_Sesiones_Correlativos.md` | Manejo de sesiones, correlativos, persistencia | ✅ |
| `07_Politica_Offline.md` | Política offline/online (operativa y técnica) | ✅ |
| `08_Testing_CICD.md` | Estrategia de testing y CI/CD | ✅ |
| `09_Roles_Responsabilidades.md` | Roles de agentes y responsabilidades por capa | ✅ |
| `10_Convenciones_Obligatorias.md` | Convenciones del proyecto (naming, estructura, reglas) | ✅ |
| `11_Certificado_Garantia_Calidad.md` | Certificado de garantía, consistencia y ejecutabilidad | ✅ |

## Principios obligatorios (recordatorio)

Todos los documentos de esta guía cumplen con:

- Max 500 líneas por documento
- Backend como fuente de verdad
- No monolitos, no archivos gigantes
- No lógica crítica solo en frontend
- No estado crítico no persistente
- Cobertura mínima de tests: 70%
- Compatibilidad CI/CD obligatoria

## Referencias

- Propuesta formal: `Documentos_MarkDown/Planes_de_Desarrollos/Caso_Auditoria_Cierre_Caja/PROPUESTA_FORMAL_SISTEMA_AUDITORIA_CORTE.md`
- Reglas de documentación: `docs/REGLAS_DOCUMENTACION.md`
- Reglas de la casa: `docs/REGLAS_DE_LA_CASA.md`

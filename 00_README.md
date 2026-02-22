# Caso: Omisión de Modales de Instrucción y Seguridad en Entorno Local

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-17 |
| **Fecha actualización** | 2026-02-17 |
| **Estado** | 🔍 En Investigación |
| **Prioridad** | 🔴 Alta (Violación Protocolo Seguridad) |
| **Responsable** | Gina (Arquitecto) |

## Resumen
El sistema omite los modales de instrucción (Wizard) en el entorno local, saltando directamente a la fase operativa. Esto impide la validación de reglas de negocio críticas (no calculadoras, rotulación) y viola los protocolos de seguridad definidos.

## Contexto
Se detectó que al iniciar la aplicación en desarrollo (`localhost`), el flujo de "Wizard" no aparece, a diferencia del entorno de producción donde funciona correctamente. Es necesario investigar la causa raíz para asegurar la consistencia entre entornos.

## Documentos
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_Definicion_Problema.md` | Descripción detallada, comparativa de entornos y evidencia visual. | ✅ |

## Resultado
[Pendiente de resolución]

## Referencias
- `src/components/cash-counting/InitialWizardModal.tsx`
- `src/hooks/useWizardNavigation.ts`
- `docs/REGLAS_DE_LA_CASA.md` (Protocolo de Seguridad)

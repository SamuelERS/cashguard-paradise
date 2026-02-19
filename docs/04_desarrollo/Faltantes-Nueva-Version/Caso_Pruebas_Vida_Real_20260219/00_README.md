# Caso: Pruebas en Vida Real — Validación en Tienda

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-19 |
| **Fecha actualización** | 2026-02-19 |
| **Estado** | 🔴 Pendiente |
| **Prioridad** | Crítica |
| **Responsable** | SamuelERS (coordinación) + Cajero real |

## Resumen

El sistema tiene mucho código nuevo (Supabase, sesiones, reanudación R4) probado con tests automáticos pero nunca usado en una tienda real con datos reales. Un cajero real, en un turno real, con internet intermitente. Ahí saldrán los bugs que no se ven en tests.

## Contexto

Después de cerrar SANN-R4 (sesiones Supabase completas), el siguiente paso natural es validar todo el flujo en producción real. Esto NO es un caso de código — es un caso de proceso operacional que generará nuevos casos técnicos.

## Hallazgos de Investigación

- `useCorteSesion.ts` (585 líneas) implementa: `iniciarCorte()`, `guardarProgreso()`, `finalizarCorte()`, `recuperarSesion()`
- 5 tablas Supabase operativas: `sucursales`, `cortes`, `corte_intentos`, `empleados`, `empleado_sucursales`
- Tabla audit: `corte_conteo_snapshots` (append-only)
- Campos JSONB ricos: `datos_conteo`, `datos_entrega`, `datos_verificacion`, `datos_reporte`
- Resume flow tiene 42 referencias en codebase (ampliamente integrado)
- `offlineQueue.ts` existe pero NO está integrada (ver Caso_Resiliencia_Offline)

## Dependencias

- **Requiere primero:** Caso_Resiliencia_Offline (sin offline robusto, prueba en tienda no es confiable)
- **Requiere primero:** Caso_PWA_Produccion (asegurar que PWA funciona en dispositivos reales)
- **Genera:** Nuevos casos técnicos basados en bugs encontrados

## Documentos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_Protocolo_Pruebas_Tienda.md` | Protocolo paso a paso para el cajero de prueba | ✅ Completado |
| `02_Checklist_Escenarios.md` | Lista de escenarios a probar (happy path + edge cases) | ✅ Completado |
| `03_Plantilla_Reporte_Bugs.md` | Template para anotar cada bug encontrado | 🔴 Pendiente (crear al iniciar pruebas) |

## Resultado

[Completar después de ejecutar las pruebas en tienda real]

## Referencias

- `→ Ver Caso_Resiliencia_Offline_20260219/` (dependencia)
- `→ Ver Caso_PWA_Produccion_20260219/` (dependencia)
- `src/hooks/useCorteSesion.ts` — Hook principal de sesiones

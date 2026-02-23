# Caso: Imágenes de Denominaciones (Billetes y Monedas)

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-19 |
| **Fecha actualización** | 2026-02-23 |
| **Estado** | ✅ Completado (v3.4.1 + v3.5.1 — 22 Feb 2026) |
| **Prioridad** | Media |
| **Responsable** | Claude Code (integración) |

## Resumen

Los componentes de conteo buscan imágenes de denominaciones y encuentran 404. La investigación reveló que **TODAS las imágenes existen físicamente** en el directorio — el problema es exclusivamente de **nomenclatura**: los archivos tienen nombres en español (`moneda-un-centavo.webp`) pero la utilidad central espera nombres en inglés (`penny.webp`).

## Contexto

El proyecto usa imágenes WebP para mostrar visualmente cada denominación durante el conteo guiado. Una utilidad central (`denomination-images.tsx`) mapea cada denominación a su archivo de imagen. La carpeta tiene 24+ archivos incluyendo variantes alternativas.

## Hallazgos de Investigación

### HALLAZGO CLAVE: No Faltan Imágenes

La investigación profunda reveló que los 11 archivos necesarios **ya existen en el directorio** pero con nombres diferentes a los esperados por el código.

### Estado Real (Revisado)

| Key CashCount | Ruta Esperada en Código | Archivo Real en /public/ | Estado |
|---------------|------------------------|--------------------------|--------|
| `penny` | `penny.webp` | `moneda-un-centavo.webp` | ⚠️ MISMATCH |
| `nickel` | `nickel.webp` | `moneda-cinco-centavos.webp` | ⚠️ MISMATCH |
| `dime` | `dime.webp` | `moneda-diez-centavos.webp` | ⚠️ MISMATCH |
| `quarter` | `quarter.webp` | `moneda-veinticinco-centavos.webp` | ⚠️ MISMATCH |
| `dollarCoin` | `dollar-coin.webp` | `moneda-un-dollar-nueva.webp` | ⚠️ MISMATCH |
| `bill1` | `billete-1.webp` | `billete-1.webp` | ✅ OK |
| `bill5` | `billete-5.webp` | `billete-5.webp` | ✅ OK |
| `bill10` | `billete-10.webp` | `billete-10.webp` | ✅ OK |
| `bill20` | `billete-20.webp` | `billete-20.webp` | ✅ OK |
| `bill50` | `billete-50.webp` | `billete-cincuenta-dolares-sobre-fondo-blanco(1).webp` | ⚠️ MISMATCH |
| `bill100` | `billete-100.webp` | `billete-100.webp` | ✅ OK |

### Resumen Revisado
- **5/11** nombres coinciden exactamente (bill1, bill5, bill10, bill20, bill100)
- **6/11** archivos existen pero con nombre diferente (5 monedas + bill50)
- **0/11** faltan por generar
- **Solución:** Renombrar 6 archivos O actualizar `denomination-images.tsx`

### Esfuerzo Estimado (Revisado)
- Renombrar 6 archivos: ~5 min
- Verificar integración: ~5 min
- Build + deploy: ~5 min
- **Total: ~16 minutos** (antes estimado ~25 min con generación DALL-E)

## Documentos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_Diagnostico_Imagenes.md` | Inventario completo de 24 archivos + mapeo exacto rutas | ✅ Completado |
| `02_Plan_Generacion_Integracion.md` | Plan de renombrado (Opción A) + fallback DALL-E | ✅ Completado |

## Resultado — Implementación Completada

**Caso cerrado el 22 Feb 2026.** Resuelto en dos fases:

**Fase 1 — v3.4.1 (OT12): 6 imágenes copiadas con nombres correctos**
- Commit: `485295b fix(images): OT12 — copy 6 denomination images with correct names + TDD tests`
- 6 archivos renombrados/copiados para que coincidan con las rutas esperadas por `denomination-images.tsx`
- Tests TDD verificando existencia de archivos

**Fase 2 — v3.5.1: Consolidación SSOT (Single Source of Truth)**
- OT #076–079: Eliminación de funciones `getIcon()` duplicadas en `DeliveryFieldView.tsx` y `GuidedFieldView.tsx`
- Ambos componentes migrados a usar `DENOMINATION_IMAGE_MAP` desde `denomination-images.tsx`
- ~80 líneas de código duplicado eliminadas
- 8/8 tests passing

**Validación:** 0 errores 404 en imágenes de denominaciones.

## Referencias

- `src/utils/denomination-images.tsx` — Utilidad central (single source of truth)
- `/public/monedas-recortadas-dolares/` — 24+ archivos existentes
- Componentes migrados: `GuidedFieldView.tsx`, `DeliveryFieldView.tsx`
- Ver CLAUDE.md secciones v3.4.1 y v3.5.1

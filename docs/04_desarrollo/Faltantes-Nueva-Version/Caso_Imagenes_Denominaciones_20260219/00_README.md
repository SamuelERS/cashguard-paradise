# Caso: Imágenes de Denominaciones (Billetes y Monedas)

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-19 |
| **Fecha actualización** | 2026-02-19 |
| **Estado** | 🔴 Pendiente |
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

## Resultado

[Completar cuando todas las imágenes carguen correctamente — 0 errores 404]

## Referencias

- `src/utils/denomination-images.tsx` — Utilidad central (single source of truth)
- `/public/monedas-recortadas-dolares/` — 24+ archivos existentes
- Componentes: `GuidedFieldView.tsx`, `DeliveryFieldView.tsx`, `Phase2VerificationSection.tsx`

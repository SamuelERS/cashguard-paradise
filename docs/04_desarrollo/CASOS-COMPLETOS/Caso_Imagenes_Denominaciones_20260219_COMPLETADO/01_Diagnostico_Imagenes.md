> ⚠️ Corregido 2026-02-19: Seccion 4 corregida — solo Phase2VerificationSection importa de denomination-images.tsx; GuidedFieldView y DeliveryFieldView usan rutas hardcodeadas en espanol que funcionan correctamente.

# Diagnostico de Imagenes de Denominaciones

**Caso:** Imagenes Denominaciones
**Fecha:** 19 de febrero 2026
**Severidad:** BAJA - Cosmetico, no bloquea funcionalidad core
**Impacto:** 404 en Network tab, imagenes no renderizadas en Phase2VerificationSection

---

## 1. Ubicacion de Archivos

**Directorio de imagenes:**
```
/public/monedas-recortadas-dolares/
```

**Utilidad centralizada:**
```
src/utils/denomination-images.tsx
```

Esta utilidad es el **single source of truth** para todas las rutas de imagenes. Exporta:
- `DENOMINATION_IMAGE_MAP` - Record que mapea cada key de `CashCount` a su ruta de imagen
- `getDenominationImageElement()` - Funcion que genera el elemento `<img>` con lazy loading y async decoding

---

## 2. Mapeo Esperado vs Estado Real

La utilidad `denomination-images.tsx` espera las siguientes rutas:

| Key CashCount | Ruta Esperada (en denomination-images.tsx) | Archivo Real en /public/ | Estado |
|---------------|-------------------------------------------|--------------------------|--------|
| `penny` | `/monedas-recortadas-dolares/penny.webp` | `moneda-un-centavo.webp` | **MISMATCH** - Existe pero con nombre diferente |
| `nickel` | `/monedas-recortadas-dolares/nickel.webp` | `moneda-cinco-centavos.webp` | **MISMATCH** - Existe pero con nombre diferente |
| `dime` | `/monedas-recortadas-dolares/dime.webp` | `moneda-diez-centavos.webp` | **MISMATCH** - Existe pero con nombre diferente |
| `quarter` | `/monedas-recortadas-dolares/quarter.webp` | `moneda-veinticinco-centavos.webp` | **MISMATCH** - Existe pero con nombre diferente |
| `dollarCoin` | `/monedas-recortadas-dolares/dollar-coin.webp` | `moneda-un-dollar-nueva.webp` | **MISMATCH** - Existe pero con nombre diferente |
| `bill1` | `/monedas-recortadas-dolares/billete-1.webp` | `billete-1.webp` | **OK** |
| `bill5` | `/monedas-recortadas-dolares/billete-5.webp` | `billete-5.webp` | **OK** |
| `bill10` | `/monedas-recortadas-dolares/billete-10.webp` | `billete-10.webp` | **OK** |
| `bill20` | `/monedas-recortadas-dolares/billete-20.webp` | `billete-20.webp` | **OK** |
| `bill50` | `/monedas-recortadas-dolares/billete-50.webp` | `billete-cincuenta-dolares-sobre-fondo-blanco(1).webp` | **MISMATCH** - Existe pero con nombre diferente |
| `bill100` | `/monedas-recortadas-dolares/billete-100.webp` | `billete-100.webp` | **OK** |

### Resumen de Estado

| Categoria | Cantidad | Detalle |
|-----------|----------|---------|
| **OK** (nombre coincide exactamente) | 5 | bill1, bill5, bill10, bill20, bill100 |
| **MISMATCH** (archivo existe, nombre diferente) | 6 | penny, nickel, dime, quarter, dollarCoin, bill50 |
| **No Existe** | 0 | Todos los archivos existen fisicamente |

**Conclusion:** No faltan imagenes. El problema es exclusivamente de **nomenclatura** -- los archivos existen en el directorio pero con nombres en espanol, mientras que `denomination-images.tsx` espera nombres en ingles simplificados.

---

## 3. Inventario Completo del Directorio

Archivos actualmente en `/public/monedas-recortadas-dolares/`:

**Monedas (multiples variantes):**
```
moneda-un-centavo.webp                           (penny)
moneda-centavo-front-inlay.webp                  (penny alternativa)
moneda-cinco-centavos.webp                       (nickel)
monedas-cinco-centavos.webp                      (nickel alternativa - plural)
moneda-cinco-centavos-nueva.webp                 (nickel alternativa)
moneda-cinco-centavos-dos-caras.webp             (nickel dos caras)
moneda-diez-centavos.webp                        (dime)
moneda-veinticinco-centavos.webp                 (quarter)
monedas-veinticinco-centavos.webp                (quarter alternativa - plural)
moneda-veinticinco-centavos-nueva.webp           (quarter alternativa)
moneda-25-centavos-dos-caras.webp                (quarter dos caras)
moneda-un-dollar-2-caras.png                     (dollar coin - PNG, no WebP)
moneda-un-dollar-nueva.webp                      (dollar coin)
```

**Billetes:**
```
billete-1.webp                                    (bill $1)
billete-5.webp                                    (bill $5)
billete-10.webp                                   (bill $10)
billete-20.webp                                   (bill $20)
billete-cincuenta-dolares-sobre-fondo-blanco(1).webp  (bill $50 - nombre largo)
billete-100.webp                                  (bill $100)
```

**Otros (logos de pagos electronicos):**
```
bac-logo.webp                                     (logo BAC)
banco promerica logo.png                          (logo Promerica - con espacio)
transferencia-bancaria.png                        (icono transferencia)
paypal-logo.png                                   (logo PayPal)
```

---

## 4. Componentes Afectados

Solo **un componente** importa de `denomination-images.tsx`:

| Componente | Importa de `denomination-images.tsx` | Uso | Impacto del 404 |
|------------|--------------------------------------|-----|-----------------|
| `Phase2VerificationSection.tsx` | **SI** (linea 38: `getDenominationImageElement`) | Muestra imagen de la denominacion durante verificacion ciega | Imagen no aparece, solo se ve el nombre textual |
| `GuidedFieldView.tsx` | **NO** — Usa rutas hardcodeadas en espanol (lineas 196-238) | Muestra imagen junto al campo de conteo guiado | **Funciona correctamente** — las rutas hardcodeadas apuntan a los nombres reales en espanol |
| `DeliveryFieldView.tsx` | **NO** — Usa rutas hardcodeadas en espanol (lineas 176-217) | Muestra imagen durante Phase 2 Delivery | **Funciona correctamente** — mismas rutas hardcodeadas que GuidedFieldView |

**Nota importante:** GuidedFieldView y DeliveryFieldView NO se ven afectados por el mismatch de nomenclatura en `denomination-images.tsx`. Ambos componentes tienen rutas como `/monedas-recortadas-dolares/moneda-centavo-front-inlay.webp`, `/monedas-recortadas-dolares/moneda-cinco-centavos-dos-caras.webp`, etc., que coinciden con los nombres reales de los archivos en el directorio. El problema de 404 es **exclusivo de Phase2VerificationSection**.

**Impacto funcional:** CERO. Phase2VerificationSection funciona correctamente sin las imagenes (muestra nombre textual). GuidedFieldView y DeliveryFieldView muestran imagenes correctamente.

**Impacto en DevTools:** Se ven errores 404 en la tab Network solo durante Phase 2 Verification, no durante Phase 1 (conteo guiado) ni Phase 2 Delivery.

---

## 5. Opciones de Solucion

Existen dos caminos para resolver el mismatch:

### Opcion A: Renombrar archivos existentes (RECOMENDADA)

Renombrar los 6 archivos existentes para que coincidan con lo que espera `denomination-images.tsx`.

**Ventajas:**
- No se necesita generar nuevas imagenes
- Las imagenes ya existen y se ven bien
- Cambio minimo (solo renombrar archivos)

**Desventajas:**
- Se pierden los nombres descriptivos en espanol

### Opcion B: Actualizar denomination-images.tsx

Cambiar las rutas en el mapa para apuntar a los nombres reales de los archivos.

**Ventajas:**
- No se tocan archivos fisicos
- Nombres descriptivos en espanol se preservan

**Desventajas:**
- Rutas con caracteres especiales y parentesis (ej: `billete-cincuenta-dolares-sobre-fondo-blanco(1).webp`)
- Inconsistencia entre billetes (nombres cortos) y monedas (nombres largos)

### Recomendacion

**Opcion A** es la mas limpia. Ver documento `02_Plan_Generacion_Integracion.md` para el plan detallado.

---

*Documento creado: 19 de febrero 2026*
*Proyecto: CashGuard Paradise*

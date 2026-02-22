# Plan de Integracion de Imagenes de Denominaciones

**Caso:** Imagenes Denominaciones
**Fecha:** 19 de febrero 2026
**Esfuerzo estimado:** ~25 minutos total
**Pre-requisito:** Leer 01_Diagnostico_Imagenes.md

---

## Resumen Ejecutivo

No se necesita generar nuevas imagenes. Los 11 archivos de denominaciones ya existen en `/public/monedas-recortadas-dolares/`. El problema es un mismatch de nombres: `denomination-images.tsx` espera nombres cortos en ingles (`penny.webp`, `nickel.webp`) pero los archivos tienen nombres largos en espanol (`moneda-un-centavo.webp`, `moneda-cinco-centavos.webp`).

**Solucion:** Renombrar 6 archivos existentes para que coincidan con el mapa.

---

## Plan de Ejecucion

### Paso 1: Renombrar billete-50 (~1 minuto)

El billete de $50 tiene un nombre excepcionalmente largo con parentesis:

```bash
# Desde /public/monedas-recortadas-dolares/
mv "billete-cincuenta-dolares-sobre-fondo-blanco(1).webp" "billete-50.webp"
```

**Verificacion:** `ls billete-50.webp` debe existir.

---

### Paso 2: Renombrar 5 monedas (~3 minutos)

Renombrar los archivos de monedas para que coincidan con las keys esperadas:

```bash
# Desde /public/monedas-recortadas-dolares/

# penny
cp moneda-un-centavo.webp penny.webp

# nickel
cp moneda-cinco-centavos.webp nickel.webp

# dime
cp moneda-diez-centavos.webp dime.webp

# quarter
cp moneda-veinticinco-centavos.webp quarter.webp

# dollar coin
cp moneda-un-dollar-nueva.webp dollar-coin.webp
```

**Nota:** Se usa `cp` (copiar) en lugar de `mv` (mover) para preservar los archivos originales. Las variantes alternativas (dos caras, nuevas, plurales) no se tocan.

**Verificacion:** Ejecutar `ls penny.webp nickel.webp dime.webp quarter.webp dollar-coin.webp` -- los 5 deben existir.

---

### Paso 3: Verificar que denomination-images.tsx mapea correctamente (~2 minutos)

El archivo `src/utils/denomination-images.tsx` ya tiene las rutas correctas:

```typescript
export const DENOMINATION_IMAGE_MAP: Record<keyof CashCount, string> = {
  penny: '/monedas-recortadas-dolares/penny.webp',        // Paso 2
  nickel: '/monedas-recortadas-dolares/nickel.webp',       // Paso 2
  dime: '/monedas-recortadas-dolares/dime.webp',           // Paso 2
  quarter: '/monedas-recortadas-dolares/quarter.webp',     // Paso 2
  dollarCoin: '/monedas-recortadas-dolares/dollar-coin.webp', // Paso 2
  bill1: '/monedas-recortadas-dolares/billete-1.webp',     // Ya OK
  bill5: '/monedas-recortadas-dolares/billete-5.webp',     // Ya OK
  bill10: '/monedas-recortadas-dolares/billete-10.webp',   // Ya OK
  bill20: '/monedas-recortadas-dolares/billete-20.webp',   // Ya OK
  bill50: '/monedas-recortadas-dolares/billete-50.webp',   // Paso 1
  bill100: '/monedas-recortadas-dolares/billete-100.webp'  // Ya OK
};
```

**No se necesita modificar este archivo.** Las rutas ya estan apuntando a los nombres correctos; solo faltaba que los archivos fisicos coincidieran.

---

### Paso 4: Build y verificar en browser (~5 minutos)

```bash
npm run build
```

Luego en modo desarrollo:

```bash
npm run dev
```

**Verificaciones en el browser:**

1. Abrir DevTools > Network tab
2. Filtrar por `monedas-recortadas-dolares`
3. Navegar al flujo de conteo (matutino o nocturno)
4. Verificar que las 11 imagenes cargan con status **200** (no 404)
5. Verificar visualmente que las imagenes aparecen junto a cada denominacion

**Checklist de imagenes en Network tab:**

| Archivo | Status esperado |
|---------|----------------|
| penny.webp | 200 |
| nickel.webp | 200 |
| dime.webp | 200 |
| quarter.webp | 200 |
| dollar-coin.webp | 200 |
| billete-1.webp | 200 |
| billete-5.webp | 200 |
| billete-10.webp | 200 |
| billete-20.webp | 200 |
| billete-50.webp | 200 |
| billete-100.webp | 200 |

---

### Paso 5: Deploy (~5 minutos)

Si el build es exitoso y las imagenes cargan localmente:

```bash
git add public/monedas-recortadas-dolares/penny.webp
git add public/monedas-recortadas-dolares/nickel.webp
git add public/monedas-recortadas-dolares/dime.webp
git add public/monedas-recortadas-dolares/quarter.webp
git add public/monedas-recortadas-dolares/dollar-coin.webp
git add public/monedas-recortadas-dolares/billete-50.webp
git commit -m "fix: rename denomination images to match DENOMINATION_IMAGE_MAP"
git push
```

El workflow de CI/CD desplegara automaticamente a produccion.

---

## Alternativa: Generar Imagenes con DALL-E

Si por alguna razon las imagenes existentes no son adecuadas (baja calidad, fondo no blanco, etc.), se pueden generar nuevas con DALL-E usando estos prompts:

### Prompts Sugeridos

**Para monedas:**
```
Professional product photography of a US [penny/nickel/dime/quarter/dollar] coin,
top-down view, centered, on pure white background, subtle drop shadow,
photorealistic, high resolution, no text overlays
```

**Para billetes (si se necesitan):**
```
Professional product photography of a US $[1/5/10/20/50/100] dollar bill,
flat lay centered, on pure white background, photorealistic,
high resolution, no text overlays
```

### Especificaciones Tecnicas

| Parametro | Valor |
|-----------|-------|
| Formato | WebP |
| Tamano maximo | 200x200px |
| Peso maximo | 50KB por imagen |
| Fondo | Blanco puro (#FFFFFF) |
| Estilo | Fotorrealista, vista cenital |

### Conversion a WebP

Si DALL-E genera PNG:

```bash
# Usando cwebp (instalar con: brew install webp)
for img in *.png; do
  cwebp -q 80 -resize 200 200 "$img" -o "${img%.png}.webp"
done
```

---

## Resumen de Esfuerzo

| Paso | Tiempo | Descripcion |
|------|--------|-------------|
| Paso 1 | 1 min | Renombrar billete-50 |
| Paso 2 | 3 min | Copiar y renombrar 5 monedas |
| Paso 3 | 2 min | Verificar mapeo en codigo |
| Paso 4 | 5 min | Build + verificar en browser |
| Paso 5 | 5 min | Commit + deploy |
| **Total** | **~16 min** | Mas rapido que la estimacion original de 25 min |

---

## Limpieza Opcional (Post-Verificacion)

Despues de confirmar que todo funciona, se pueden eliminar los archivos originales con nombres largos para reducir el tamano del directorio. Sin embargo, esto es **opcional** y de baja prioridad:

```bash
# SOLO despues de verificar que los nombres nuevos funcionan
rm moneda-un-centavo.webp
rm moneda-cinco-centavos.webp
rm moneda-diez-centavos.webp
rm moneda-veinticinco-centavos.webp
rm moneda-un-dollar-nueva.webp
rm "billete-cincuenta-dolares-sobre-fondo-blanco(1).webp"
# ... y las variantes alternativas que no se usen
```

---

*Documento creado: 19 de febrero 2026*
*Proyecto: CashGuard Paradise*

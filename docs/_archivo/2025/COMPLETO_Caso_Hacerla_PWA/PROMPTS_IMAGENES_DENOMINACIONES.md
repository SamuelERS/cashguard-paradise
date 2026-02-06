# 🎨 Prompts DALL-E - Imágenes Denominaciones Monetarias

**Fecha:** 11 de Octubre 2025 ~16:30 PM
**Propósito:** Generar imágenes profesionales de billetes y monedas USD para PWA CashGuard Paradise
**Total Imágenes:** 10 (6 billetes + 4 monedas)

---

## 📋 Especificaciones Técnicas

### Requisitos Generales:
- **Formato output:** PNG (luego convertiremos a WebP)
- **Fondo:** Blanco puro (#FFFFFF)
- **Estilo:** Fotorrealista profesional
- **Vista:** Frontal, centrada, con sombra sutil
- **Tamaño sugerido:** 1024×1024px (DALL-E default)
- **Orientación billetes:** Horizontal (landscape)
- **Orientación monedas:** Circular (square)

---

## 💵 BILLETES (6 Imágenes)

### 1. Billete de $1 USD

**Prompt:**
```
Professional photograph of a United States one dollar bill ($1 USD) on a pure white background. Front view, centered, perfectly flat, with subtle shadow. High quality, sharp details, crisp colors. Photorealistic style. The bill should show the portrait of George Washington clearly visible. Clean, professional product photography lighting.
```

**Nombre archivo final:** `billete-1.webp`

---

### 2. Billete de $5 USD

**Prompt:**
```
Professional photograph of a United States five dollar bill ($5 USD) on a pure white background. Front view, centered, perfectly flat, with subtle shadow. High quality, sharp details, crisp colors. Photorealistic style. The bill should show the portrait of Abraham Lincoln clearly visible. Clean, professional product photography lighting.
```

**Nombre archivo final:** `billete-5.webp`

---

### 3. Billete de $10 USD

**Prompt:**
```
Professional photograph of a United States ten dollar bill ($10 USD) on a pure white background. Front view, centered, perfectly flat, with subtle shadow. High quality, sharp details, crisp colors. Photorealistic style. The bill should show the portrait of Alexander Hamilton clearly visible. Clean, professional product photography lighting.
```

**Nombre archivo final:** `billete-10.webp`

---

### 4. Billete de $20 USD

**Prompt:**
```
Professional photograph of a United States twenty dollar bill ($20 USD) on a pure white background. Front view, centered, perfectly flat, with subtle shadow. High quality, sharp details, crisp colors. Photorealistic style. The bill should show the portrait of Andrew Jackson clearly visible. Clean, professional product photography lighting.
```

**Nombre archivo final:** `billete-20.webp`

---

### 5. Billete de $50 USD

**Prompt:**
```
Professional photograph of a United States fifty dollar bill ($50 USD) on a pure white background. Front view, centered, perfectly flat, with subtle shadow. High quality, sharp details, crisp colors. Photorealistic style. The bill should show the portrait of Ulysses S. Grant clearly visible. Clean, professional product photography lighting.
```

**Nombre archivo final:** `billete-cincuenta-dolares-sobre-fondo-blanco(1).webp`
*(Nombre extraño pero es el que el código espera)*

---

### 6. Billete de $100 USD

**Prompt:**
```
Professional photograph of a United States one hundred dollar bill ($100 USD) on a pure white background. Front view, centered, perfectly flat, with subtle shadow. High quality, sharp details, crisp colors. Photorealistic style. The bill should show the portrait of Benjamin Franklin clearly visible. Clean, professional product photography lighting.
```

**Nombre archivo final:** `billete-100.webp`

---

## 🪙 MONEDAS (4 Imágenes)

### 7. Moneda Nickel (5¢)

**Prompt:**
```
Professional photograph of a United States nickel coin (5 cents) on a pure white background. Top view showing the heads side with Thomas Jefferson profile. Perfectly centered, circular, with subtle shadow. High quality metallic finish, sharp details. Photorealistic style. Clean professional product photography lighting.
```

**Nombre archivo final:** `moneda-nickel.webp`
*(⚠️ NOTA: Código actual NO usa monedas, solo billetes. Generamos por si acaso)*

---

### 8. Moneda Dime (10¢)

**Prompt:**
```
Professional photograph of a United States dime coin (10 cents) on a pure white background. Top view showing the heads side with Franklin D. Roosevelt profile. Perfectly centered, circular, with subtle shadow. High quality metallic finish, sharp details. Photorealistic style. Clean professional product photography lighting.
```

**Nombre archivo final:** `moneda-dime.webp`

---

### 9. Moneda Quarter (25¢)

**Prompt:**
```
Professional photograph of a United States quarter coin (25 cents) on a pure white background. Top view showing the heads side with George Washington profile. Perfectly centered, circular, with subtle shadow. High quality metallic finish, sharp details. Photorealistic style. Clean professional product photography lighting.
```

**Nombre archivo final:** `moneda-quarter.webp`

---

### 10. Moneda Dollar ($1 Coin)

**Prompt:**
```
Professional photograph of a United States one dollar coin (Sacagawea dollar) on a pure white background. Top view showing the heads side with Sacagawea profile. Perfectly centered, circular, with subtle shadow. High quality golden metallic finish, sharp details. Photorealistic style. Clean professional product photography lighting.
```

**Nombre archivo final:** `moneda-dollar.webp`

---

## 🔄 Proceso de Conversión (Después de Generar)

### Paso 1: Renombrar Archivos
Renombrar las imágenes descargadas con los nombres exactos arriba.

### Paso 2: Convertir a WebP
```bash
# Si tienes ImageMagick instalado:
for file in *.png; do
  convert "$file" -quality 85 "${file%.png}.webp"
done

# O usar herramienta online:
# https://squoosh.app/ (Google)
# https://cloudconvert.com/png-to-webp
```

### Paso 3: Crear Carpeta
```bash
cd "/Users/samuelers/Paradise System Labs/cashguard-paradise/public"
mkdir -p monedas-recortadas-dolares
```

### Paso 4: Mover Archivos
Mover todos los `.webp` a `/public/monedas-recortadas-dolares/`

### Paso 5: Verificar Nombres Exactos
```
/public/monedas-recortadas-dolares/
├── billete-1.webp ✅
├── billete-5.webp ✅
├── billete-10.webp ✅
├── billete-20.webp ✅
├── billete-cincuenta-dolares-sobre-fondo-blanco(1).webp ✅
├── billete-100.webp ✅
├── moneda-nickel.webp (opcional)
├── moneda-dime.webp (opcional)
├── moneda-quarter.webp (opcional)
└── moneda-dollar.webp (opcional)
```

---

## 🚀 Deployment

### Paso 6: Build + Deploy
```bash
cd "/Users/samuelers/Paradise System Labs/cashguard-paradise"
npm run build
# Verificar que imágenes estén en /dist/monedas-recortadas-dolares/

git add public/monedas-recortadas-dolares/
git commit -m "feat: add denomination images for PWA"
git push origin main
# Deployment automático se ejecutará (GitHub Actions)
```

### Paso 7: Verificar en Producción
1. Esperar ~30 segundos (deployment time)
2. Visitar `https://cashguard.paradisesystemlabs.com`
3. Iniciar "Conteo de Caja"
4. Verificar que imágenes de billetes carguen correctamente ✅

---

## 📊 Resumen

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Billetes** | 6 | billete-1.webp a billete-100.webp |
| **Monedas** | 4 | moneda-nickel.webp a moneda-dollar.webp |
| **TOTAL** | 10 | + conversión WebP |

**Tiempo estimado:**
- Generar con DALL-E: ~15 min (1.5 min por imagen)
- Convertir a WebP: ~3 min
- Organizar archivos: ~2 min
- Build + Deploy: ~1 min
- **TOTAL: ~21 minutos** ⏱️

---

## 🎯 Próximo Paso

**TU TAREA:**
1. Abrir DALL-E (ChatGPT Plus o Bing Image Creator)
2. Copiar/pegar cada prompt (billetes 1-6 MÍNIMO)
3. Descargar las 6 imágenes PNG
4. Compartir conmigo para conversión + deployment

**¿Listo para generar las imágenes?** 🎨

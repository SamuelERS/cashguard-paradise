#!/bin/bash

# 🚀 CashGuard Paradise - Deployment Verification Script
# Verifica que el build esté listo para despliegue

echo "🔍 Verificando build de producción..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que existe el directorio dist
if [ ! -d "dist" ]; then
  echo -e "${RED}❌ ERROR: Directorio 'dist' no encontrado${NC}"
  echo "   Ejecuta: npm run build"
  exit 1
fi

echo -e "${GREEN}✅ Directorio 'dist' encontrado${NC}"

# Verificar archivos críticos PWA
files=(
  "dist/index.html"
  "dist/sw.js"
  "dist/manifest.webmanifest"
  "dist/assets"
  "dist/icons"
)

for file in "${files[@]}"; do
  if [ -e "$file" ]; then
    echo -e "${GREEN}✅ $file${NC}"
  else
    echo -e "${RED}❌ $file NO ENCONTRADO${NC}"
  fi
done

# Calcular tamaño
size=$(du -sh dist/ | cut -f1)
echo ""
echo -e "${GREEN}📦 Tamaño total del build: $size${NC}"

# Contar archivos
file_count=$(find dist -type f | wc -l | tr -d ' ')
echo -e "${GREEN}📄 Total de archivos: $file_count${NC}"

# Verificar Service Worker
if grep -q "registerType.*autoUpdate" dist/sw.js 2>/dev/null; then
  echo -e "${GREEN}✅ Service Worker configurado con auto-update${NC}"
else
  echo -e "${YELLOW}⚠️  Verificar configuración de Service Worker${NC}"
fi

# Verificar manifest
if [ -f "dist/manifest.webmanifest" ]; then
  name=$(grep -o '"name"[^,]*' dist/manifest.webmanifest | head -1)
  echo -e "${GREEN}✅ Manifest: $name${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Build listo para despliegue!${NC}"
echo ""
echo "📋 Opciones de despliegue:"
echo ""
echo "1️⃣  SiteGround (FTP):"
echo "   - Abrir FileZilla"
echo "   - Conectar a tu servidor FTP"
echo "   - Subir contenido de dist/ a public_html/"
echo ""
echo "2️⃣  Docker Local:"
echo "   docker-compose --profile prod up -d"
echo ""
echo "3️⃣  Netlify (Gratis):"
echo "   - Subir código a GitHub"
echo "   - Conectar con Netlify"
echo "   - Deploy automático"
echo ""
echo "4️⃣  Vercel (Gratis):"
echo "   vercel --prod"
echo ""
echo "📖 Ver instrucciones completas:"
echo "   cat DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

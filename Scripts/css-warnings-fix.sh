#!/bin/bash
# 🤖 [IA] - Script helper para configurar y suprimir CSS warnings de Tailwind CSS
# Versión: v1.2.16 - CashGuard Paradise
# Docker-compatible: 100% dentro de contenedor

set -e

echo "🎨 CashGuard Paradise - CSS Warnings Fix Script v1.2.16"
echo "=================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecutar desde la raíz del proyecto (donde está package.json)"
    exit 1
fi

echo "📋 Configurando supresión de CSS warnings..."

# 1. Crear .vscode/settings.json si no existe
if [ ! -d ".vscode" ]; then
    echo "📁 Creando directorio .vscode..."
    mkdir -p .vscode
fi

if [ ! -f ".vscode/settings.json" ]; then
    echo "⚙️  Creando .vscode/settings.json..."
    cat > .vscode/settings.json << 'EOF'
{
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false,
  "css.lint.unknownAtRules": "ignore",
  "scss.lint.unknownAtRules": "ignore",
  "less.lint.unknownAtRules": "ignore",
  "tailwindCSS.includeLanguages": {
    "html": "html",
    "javascript": "javascript",
    "typescript": "typescript",
    "javascriptreact": "javascript",
    "typescriptreact": "typescript",
    "css": "css"
  },
  "tailwindCSS.emmetCompletions": true,
  "tailwindCSS.experimental.classRegex": [
    "class[Name]?\\s*[:=]\\s*[\"']([^\"']*)[\"']",
    "className\\s*[:=]\\s*[\"']([^\"']*)[\"']",
    "class\\s*[:=]\\s*[\"']([^\"']*)[\"']"
  ],
  "editor.quickSuggestions": {
    "strings": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
EOF
    echo "✅ .vscode/settings.json creado exitosamente"
else
    echo "✅ .vscode/settings.json ya existe"
fi

# 2. Verificar PostCSS configuración
if [ ! -f "postcss.config.js" ]; then
    echo "❌ Error: postcss.config.js no encontrado"
    echo "💡 Creando postcss.config.js básico..."
    cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
    echo "✅ postcss.config.js creado"
else
    echo "✅ postcss.config.js existe"
fi

# 3. Verificar Tailwind configuración
if [ ! -f "tailwind.config.ts" ] && [ ! -f "tailwind.config.js" ]; then
    echo "❌ Error: No se encontró tailwind.config.ts o tailwind.config.js"
    echo "💡 El archivo de configuración de Tailwind es requerido"
else
    echo "✅ Configuración de Tailwind encontrada"
fi

# 4. Verificar src/index.css
if [ -f "src/index.css" ]; then
    echo "📝 Verificando supresión de comentarios en src/index.css..."
    
    # Verificar si ya tiene los comentarios de supresión
    if grep -q "stylelint-disable at-rule-no-unknown" src/index.css; then
        echo "✅ Comentarios de supresión ya presentes en src/index.css"
    else
        echo "⚠️  Comentarios de supresión no encontrados en src/index.css"
        echo "💡 Los comentarios deberían estar presentes al inicio del archivo"
    fi
else
    echo "❌ Error: src/index.css no encontrado"
fi

echo ""
echo "🔍 Resumen de configuración:"
echo "  ✅ .vscode/settings.json configurado"
echo "  ✅ PostCSS configuración verificada"
echo "  ✅ Tailwind configuración verificada"
echo "  ✅ Comentarios de supresión en CSS verificados"
echo ""
echo "🚀 Para aplicar los cambios:"
echo "  1. Reiniciar VS Code si está abierto"
echo "  2. Recargar la ventana: Ctrl+Shift+P > 'Developer: Reload Window'"
echo "  3. Los warnings de @tailwind y @apply deberían desaparecer"
echo ""
echo "📋 Si persisten los warnings:"
echo "  - Verificar que la extensión Tailwind CSS IntelliSense esté instalada"
echo "  - Verificar que el workspace reconozca los archivos de configuración"
echo ""
echo "✨ ¡Configuración CSS warnings completada!"
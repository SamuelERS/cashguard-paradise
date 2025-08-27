#!/bin/bash
# 🤖 [IA] - Scripts de utilidad para Docker - CashGuard Paradise v1.0.0

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_colored() {
    echo -e "${2}${1}${NC}"
}

# Función para verificar Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_colored "❌ Docker no está instalado. Por favor instala Docker primero." "$RED"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        print_colored "❌ Docker Compose no está disponible. Por favor instala Docker Compose." "$RED"
        exit 1
    fi
}

# Función principal
main() {
    check_docker
    
    case "$1" in
        "dev" | "development")
            print_colored "🚀 Iniciando CashGuard Paradise en modo DESARROLLO..." "$BLUE"
            print_colored "📝 Asegúrate de tener el archivo .env configurado" "$YELLOW"
            docker compose --profile dev up
            ;;
            
        "dev:build")
            print_colored "🔨 Reconstruyendo contenedor de desarrollo..." "$BLUE"
            docker compose --profile dev up --build
            ;;
            
        "prod" | "production")
            print_colored "🏭 Iniciando CashGuard Paradise en modo PRODUCCIÓN..." "$GREEN"
            print_colored "📝 Asegúrate de tener el archivo .env configurado" "$YELLOW"
            docker compose --profile prod up -d
            ;;
            
        "prod:build")
            print_colored "🔨 Construyendo imagen de producción..." "$GREEN"
            docker compose --profile prod build --no-cache
            docker compose --profile prod up -d
            ;;
            
        "stop")
            print_colored "⏹️  Deteniendo todos los contenedores..." "$YELLOW"
            docker compose --profile dev --profile prod down
            ;;
            
        "clean")
            print_colored "🧹 Limpiando contenedores, imágenes y volúmenes..." "$YELLOW"
            docker compose --profile dev --profile prod down -v --rmi all
            print_colored "✅ Limpieza completa" "$GREEN"
            ;;
            
        "logs")
            if [ "$2" == "prod" ]; then
                docker compose --profile prod logs -f
            else
                docker compose --profile dev logs -f
            fi
            ;;
            
        "shell")
            if [ "$2" == "prod" ]; then
                print_colored "📦 Entrando al contenedor de producción..." "$BLUE"
                docker exec -it cashguard-paradise-prod sh
            else
                print_colored "📦 Entrando al contenedor de desarrollo..." "$BLUE"
                docker exec -it cashguard-paradise-dev sh
            fi
            ;;
            
        "status")
            print_colored "📊 Estado de los contenedores:" "$BLUE"
            docker compose ps
            ;;
            
        "test:build")
            print_colored "🧪 Probando el build de producción localmente..." "$YELLOW"
            docker build -t cashguard-test .
            if [ $? -eq 0 ]; then
                print_colored "✅ Build exitoso" "$GREEN"
            else
                print_colored "❌ Error en el build" "$RED"
            fi
            ;;
            
        *)
            print_colored "CashGuard Paradise - Docker Commands v1.0.0" "$BLUE"
            echo ""
            print_colored "Uso: ./Scripts/docker-commands.sh [comando]" "$GREEN"
            echo ""
            echo "Comandos disponibles:"
            echo "  dev, development    - Iniciar en modo desarrollo (puerto 5173)"
            echo "  dev:build          - Reconstruir y ejecutar en modo desarrollo"
            echo "  prod, production   - Iniciar en modo producción (puerto 8080)"
            echo "  prod:build         - Construir y ejecutar en modo producción"
            echo "  stop               - Detener todos los contenedores"
            echo "  clean              - Limpiar contenedores, imágenes y volúmenes"
            echo "  logs [prod|dev]    - Ver logs (por defecto: dev)"
            echo "  shell [prod|dev]   - Entrar al contenedor (por defecto: dev)"
            echo "  status             - Ver estado de los contenedores"
            echo "  test:build         - Probar build de producción"
            echo ""
            print_colored "Ejemplos:" "$YELLOW"
            echo "  ./Scripts/docker-commands.sh dev           # Desarrollo"
            echo "  ./Scripts/docker-commands.sh prod:build    # Build y producción"
            echo "  ./Scripts/docker-commands.sh logs prod     # Ver logs de producción"
            ;;
    esac
}

# Ejecutar función principal
main "$@"
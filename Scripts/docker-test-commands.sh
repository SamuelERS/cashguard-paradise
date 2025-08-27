#!/bin/bash
# 🤖 [IA] - v1.1.17: Docker helper commands for testing environment
# This script provides easy-to-use commands for running tests in Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Main script logic
case "$1" in
    "build")
        print_info "Building test containers..."
        docker-compose -f docker-compose.test.yml build
        print_success "Test containers built successfully!"
        ;;
        
    "test")
        print_info "Running all tests in Docker..."
        # 🤖 [IA] - v1.1.17: Fixed - runs tests directly without unnecessary dependencies
        docker-compose -f docker-compose.test.yml run --rm cashguard-tests
        ;;
        
    "test:watch")
        print_info "Running tests in watch mode..."
        docker-compose -f docker-compose.test.yml run --rm cashguard-tests npm run test:watch
        ;;
        
    "test:coverage")
        print_info "Running tests with coverage report..."
        docker-compose -f docker-compose.test.yml run --rm cashguard-tests npm run test:coverage
        ;;
        
    "test:ui")
        print_info "Starting Vitest UI..."
        docker-compose -f docker-compose.test.yml run --rm -p 51204:51204 cashguard-tests npm run test:ui -- --host 0.0.0.0 --port 51204
        print_success "Vitest UI available at http://localhost:51204"
        ;;
        
    "test:unit")
        print_info "Running unit tests only..."
        docker-compose -f docker-compose.test.yml run --rm cashguard-tests npm run test:unit
        ;;
        
    "test:integration")
        print_info "Running integration tests only..."
        docker-compose -f docker-compose.test.yml run --rm cashguard-tests npm run test:integration
        ;;
        
    "test:e2e")
        print_info "Running E2E tests with Playwright..."
        docker-compose -f docker-compose.test.yml --profile e2e up cashguard-e2e
        ;;
        
    "shell")
        print_info "Opening shell in test container..."
        docker-compose -f docker-compose.test.yml run --rm cashguard-tests /bin/sh
        ;;
        
    "logs")
        print_info "Showing test container logs..."
        docker-compose -f docker-compose.test.yml logs -f cashguard-tests
        ;;
        
    "clean")
        print_warning "Cleaning up test containers and volumes..."
        docker-compose -f docker-compose.test.yml down -v --remove-orphans
        print_success "Test environment cleaned!"
        ;;
        
    "reset")
        print_warning "Resetting test environment (clean + build)..."
        docker-compose -f docker-compose.test.yml down -v --remove-orphans
        docker-compose -f docker-compose.test.yml build --no-cache
        print_success "Test environment reset complete!"
        ;;
        
    "status")
        print_info "Checking test container status..."
        docker-compose -f docker-compose.test.yml ps
        ;;
        
    "install")
        print_info "Installing dependencies in container..."
        docker-compose -f docker-compose.test.yml run --rm cashguard-tests npm ci
        print_success "Dependencies installed!"
        ;;
        
    *)
        echo "🧪 CashGuard Paradise - Docker Test Commands"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Available commands:"
        echo "  build           - Build test containers"
        echo "  test            - Run all tests"
        echo "  test:watch      - Run tests in watch mode"
        echo "  test:coverage   - Run tests with coverage report"
        echo "  test:ui         - Start Vitest UI interface"
        echo "  test:unit       - Run unit tests only"
        echo "  test:integration- Run integration tests only"
        echo "  test:e2e        - Run E2E tests with Playwright"
        echo "  shell           - Open shell in test container"
        echo "  logs            - Show test container logs"
        echo "  clean           - Remove test containers and volumes"
        echo "  reset           - Clean and rebuild test environment"
        echo "  status          - Show container status"
        echo "  install         - Install npm dependencies"
        echo ""
        echo "Examples:"
        echo "  $0 build        # Build containers first time"
        echo "  $0 test         # Run all tests"
        echo "  $0 test:watch   # Develop with watch mode"
        echo "  $0 clean        # Clean up when done"
        exit 1
        ;;
esac
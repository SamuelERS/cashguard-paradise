#!/bin/bash
# 🤖 [IA] - v1.2.4: CI/CD helper commands for local testing - 100% Docker-based
# This script allows developers to run the same CI/CD pipeline locally

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

# Function to check Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running! Please start Docker Desktop."
        exit 1
    fi
}

# Main script logic
case "$1" in
    "ci:local")
        print_info "Running complete CI/CD pipeline locally..."
        check_docker
        
        # Unit & Integration tests
        print_info "Step 1/5: Unit & Integration Tests"
        ./Scripts/docker-test-commands.sh test:unit
        ./Scripts/docker-test-commands.sh test:integration
        
        # E2E tests
        print_info "Step 2/5: E2E Tests"
        ./Scripts/docker-test-commands.sh test:e2e
        
        # Security audit
        print_info "Step 3/5: Security Audit"
        docker run --rm \
            -v $(pwd):/app \
            -w /app \
            node:20-alpine \
            sh -c "npm ci && npm audit --audit-level=moderate"
        
        # TypeScript check
        print_info "Step 4/5: TypeScript Check"
        docker run --rm \
            -v $(pwd):/app \
            -w /app \
            node:20-alpine \
            sh -c "npm ci && npx tsc --noEmit"
        
        # Lint check
        print_info "Step 5/5: ESLint Check"
        docker run --rm \
            -v $(pwd):/app \
            -w /app \
            node:20-alpine \
            sh -c "npm ci && npm run lint"
        
        print_success "All CI/CD checks passed! ✨"
        ;;
        
    "ci:unit")
        print_info "Running unit tests in Docker..."
        check_docker
        ./Scripts/docker-test-commands.sh test:unit
        print_success "Unit tests completed!"
        ;;
        
    "ci:integration")
        print_info "Running integration tests in Docker..."
        check_docker
        ./Scripts/docker-test-commands.sh test:integration
        print_success "Integration tests completed!"
        ;;
        
    "ci:e2e")
        print_info "Running E2E tests in Docker..."
        check_docker
        ./Scripts/docker-test-commands.sh test:e2e
        print_success "E2E tests completed!"
        ;;
        
    "ci:security")
        print_info "Running security audit in Docker..."
        check_docker
        
        # npm audit
        print_info "Checking npm dependencies..."
        docker run --rm \
            -v $(pwd):/app \
            -w /app \
            node:20-alpine \
            sh -c "npm ci && npm audit --audit-level=moderate" || print_warning "Some vulnerabilities found"
        
        # Check for common security issues
        print_info "Checking for exposed secrets..."
        docker run --rm \
            -v $(pwd):/app \
            -w /app \
            node:20-alpine \
            sh -c "grep -r 'PRIVATE_KEY\\|API_KEY\\|SECRET\\|PASSWORD' src/ || echo 'No secrets found'"
        
        print_success "Security audit completed!"
        ;;
        
    "ci:performance")
        print_info "Running performance checks..."
        check_docker
        
        # Build production bundle
        print_info "Building production bundle..."
        docker run --rm \
            -v $(pwd):/app \
            -w /app \
            node:20-alpine \
            sh -c "npm ci && npm run build"
        
        # Check bundle size
        print_info "Analyzing bundle size..."
        BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
        echo "Bundle size: $BUNDLE_SIZE"
        
        # Start production server for Lighthouse
        print_info "Starting production server..."
        docker compose --profile prod up -d
        sleep 10
        
        # Run basic performance check
        print_info "Running performance metrics..."
        curl -s -o /dev/null -w "Time to first byte: %{time_starttransfer}s\n" http://localhost:8080
        
        # Stop production server
        docker compose --profile prod down
        
        print_success "Performance check completed!"
        ;;
        
    "ci:quality")
        print_info "Running code quality checks..."
        check_docker
        
        # TypeScript check
        print_info "TypeScript type checking..."
        docker run --rm \
            -v $(pwd):/app \
            -w /app \
            node:20-alpine \
            sh -c "npm ci && npx tsc --noEmit"
        
        # ESLint
        print_info "ESLint checking..."
        docker run --rm \
            -v $(pwd):/app \
            -w /app \
            node:20-alpine \
            sh -c "npm ci && npm run lint"
        
        print_success "Code quality checks completed!"
        ;;
        
    "ci:coverage")
        print_info "Generating test coverage report..."
        check_docker
        ./Scripts/docker-test-commands.sh test:coverage
        print_success "Coverage report generated in ./coverage/"
        ;;
        
    "ci:clean")
        print_warning "Cleaning up CI/CD artifacts..."
        check_docker
        
        # Clean test containers
        ./Scripts/docker-test-commands.sh clean
        
        # Remove coverage reports
        rm -rf coverage/
        rm -rf .lighthouseci/
        rm -rf playwright-report/
        rm -rf dependency-check-report/
        
        print_success "CI/CD cleanup completed!"
        ;;
        
    *)
        echo "🚀 CashGuard Paradise - CI/CD Commands"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Available commands:"
        echo "  ci:local        - Run complete CI/CD pipeline locally"
        echo "  ci:unit         - Run only unit tests"
        echo "  ci:integration  - Run only integration tests"
        echo "  ci:e2e          - Run only E2E tests"
        echo "  ci:security     - Run security audit"
        echo "  ci:performance  - Run performance checks"
        echo "  ci:quality      - Run code quality checks (TypeScript + ESLint)"
        echo "  ci:coverage     - Generate test coverage report"
        echo "  ci:clean        - Clean up CI/CD artifacts"
        echo ""
        echo "Examples:"
        echo "  $0 ci:local     # Run everything locally"
        echo "  $0 ci:unit      # Quick unit test check"
        echo "  $0 ci:security  # Security audit only"
        echo ""
        echo "Note: All commands run in Docker containers (no local dependencies)"
        exit 1
        ;;
esac
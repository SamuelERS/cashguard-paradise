#!/bin/bash
# 🤖 [IA] - v1.2.4: Pre-commit checks - Fast validation before commit

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Running pre-commit checks...${NC}"

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
    echo -e "${YELLOW}No JavaScript/TypeScript files staged for commit${NC}"
    exit 0
fi

echo -e "${BLUE}Checking staged files:${NC}"
echo "$STAGED_FILES"

# TypeScript check for staged files only
echo -e "${BLUE}Running TypeScript check...${NC}"
docker run --rm \
    -v $(pwd):/app \
    -w /app \
    node:20-alpine \
    sh -c "npm ci --silent && npx tsc --noEmit" || {
    echo -e "${RED}❌ TypeScript errors found! Please fix before committing.${NC}"
    exit 1
}

# Quick unit test for modified files (if test files exist)
TEST_FILES=$(echo "$STAGED_FILES" | grep -E '\.test\.(ts|tsx)$' || true)
if [ ! -z "$TEST_FILES" ]; then
    echo -e "${BLUE}Running tests for modified test files...${NC}"
    docker compose -f docker-compose.test.yml run --rm cashguard-tests npm run test:unit -- --run || {
        echo -e "${RED}❌ Tests failed! Please fix before committing.${NC}"
        exit 1
    }
fi

echo -e "${GREEN}✅ All pre-commit checks passed!${NC}"
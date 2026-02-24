#!/bin/bash
# 🤖 [IA] - ORDEN DACC/FASE-6: Hygiene guardrails — no .skip, no .bak artifacts
# Uso: bash Scripts/lint-hygiene.sh
# Integrado en: pre-commit-checks.sh + npm run lint:hygiene

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

FAILED=0

# ── CHECK 1: Sin .skip() en tests ────────────────────────────────────────────
echo "🔍 Verificando ausencia de .skip() en tests..."

SKIP_HITS=$(rg -l '\b(it|test|describe)\.skip\(' src e2e 2>/dev/null | wc -l | tr -d ' ')

if [ "$SKIP_HITS" -gt 0 ]; then
  echo -e "${RED}❌ HYGIENE FAIL: Encontrados archivos con .skip() en tests:${NC}"
  rg -n '\b(it|test|describe)\.skip\(' src e2e 2>/dev/null || true
  FAILED=1
else
  echo -e "${GREEN}✅ Sin .skip() en tests${NC}"
fi

# ── CHECK 2: Sin artefactos .bak/.backup/~ ───────────────────────────────────
echo "🔍 Verificando ausencia de artefactos .bak/.backup..."

BAK_HITS=$(find . \( -name '*.bak' -o -name '*.backup' -o -name '*~' \) \
  ! -path './node_modules/*' \
  ! -path './.git/*' \
  ! -path './dist/*' \
  ! -path './coverage/*' \
  ! -path './Backups-RESPALDOS/*' \
  2>/dev/null | wc -l | tr -d ' ')

if [ "$BAK_HITS" -gt 0 ]; then
  echo -e "${RED}❌ HYGIENE FAIL: Encontrados artefactos .bak/.backup:${NC}"
  find . \( -name '*.bak' -o -name '*.backup' -o -name '*~' \) \
    ! -path './node_modules/*' \
    ! -path './.git/*' \
    ! -path './dist/*' \
    ! -path './coverage/*' \
    ! -path './Backups-RESPALDOS/*' \
    2>/dev/null || true
  FAILED=1
else
  echo -e "${GREEN}✅ Sin artefactos .bak/.backup${NC}"
fi

# ── RESULTADO FINAL ───────────────────────────────────────────────────────────
if [ "$FAILED" -eq 1 ]; then
  echo -e "${RED}❌ Hygiene checks FALLARON. Corrige los problemas antes de continuar.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Todos los hygiene checks pasaron${NC}"

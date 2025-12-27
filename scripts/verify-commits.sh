#!/bin/bash
# =============================================================================
# Tables Magiques - Commit Verification Script
# ISO/IEC 25010 - Quality Assurance (Hook Bypass Detection)
# =============================================================================
#
# Ce script detecte les commits potentiellement faits avec --no-verify
# en comparant le log git avec le log des commits valides
#
# Usage:
#   ./scripts/verify-commits.sh [--strict] [--last N]
#
# Options:
#   --strict  : Echoue si des commits non valides sont detectes
#   --last N  : Verifie seulement les N derniers commits (defaut: 10)
#
# =============================================================================

set -e

VALID_COMMITS_LOG=".git/tm-valid-commits.log"
STRICT_MODE=false
LAST_N=10

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --strict) STRICT_MODE=true ;;
    --last) LAST_N="$2"; shift ;;
    *) echo "Option inconnue: $1"; exit 1 ;;
  esac
  shift
done

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║         🦄 TABLES MAGIQUES - VERIFICATION COMMITS               ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Verifier si le fichier de log existe
if [ ! -f "$VALID_COMMITS_LOG" ]; then
  echo "⚠️  Fichier de log des commits valides non trouve"
  echo "   Le post-commit hook cree ce fichier automatiquement"
  echo ""

  if [ "$STRICT_MODE" = true ]; then
    echo "❌ Mode strict: echec (pas de log de commits valides)"
    exit 1
  fi

  echo "ℹ️  Suggestion: Activer les hooks avec 'npx husky install'"
  exit 0
fi

# Recuperer les N derniers commits
echo "🔍 Verification des $LAST_N derniers commits..."
echo ""

INVALID_COUNT=0
VALID_COUNT=0

while IFS= read -r commit_hash; do
  commit_short=$(echo "$commit_hash" | cut -c1-7)
  commit_msg=$(git log -1 --format="%s" "$commit_hash" 2>/dev/null || echo "???")

  # Chercher dans le log des commits valides
  if grep -q "$commit_short" "$VALID_COMMITS_LOG" 2>/dev/null; then
    echo "  ✅ $commit_short - $commit_msg"
    ((VALID_COUNT++))
  else
    echo "  ⚠️  $commit_short - $commit_msg [NON VERIFIE]"
    ((INVALID_COUNT++))
  fi
done < <(git log --format="%H" -n "$LAST_N" 2>/dev/null)

# Resume
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Commits verifies:      $VALID_COUNT"
echo "  Commits non verifies:  $INVALID_COUNT"
echo ""

if [ "$INVALID_COUNT" -gt 0 ]; then
  echo "⚠️  Des commits ont potentiellement ete faits avec --no-verify"
  echo ""
  echo "   Rappel: Utiliser --no-verify bypass les controles qualite:"
  echo "   - Type safety (CWE-704)"
  echo "   - Error handling"
  echo "   - Secret scanning"
  echo "   - Lint + format"
  echo ""

  if [ "$STRICT_MODE" = true ]; then
    echo "❌ Mode strict: echec ($INVALID_COUNT commits non verifies)"
    exit 1
  fi
else
  echo "✅ Tous les commits ont ete verifies par les hooks qualite"
fi

echo ""

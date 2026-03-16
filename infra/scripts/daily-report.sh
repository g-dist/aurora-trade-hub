#!/usr/bin/env bash
# =============================================================
# daily-report.sh — Daglig statusrapport til Obsidian
# Kjøres på Mac mini kl. 06:00. Genererer markdown-rapport.
# =============================================================

set -euo pipefail

DATE=$(date +%Y-%m-%d)
REPORT_DIR="$HOME/Documents/GlobalDistribution/08_Daily"
REPORT_FILE="$REPORT_DIR/${DATE}-daily-report.md"
LOG_DIR="$HOME/logs/daily-report"
LOG_FILE="$LOG_DIR/${DATE}.log"

mkdir -p "$REPORT_DIR" "$LOG_DIR"

log() {
  echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "=== daily-report.sh startet ==="

# ----- Start rapport -----
cat > "$REPORT_FILE" <<EOF
# Daglig rapport — ${DATE}

_Generert automatisk av daily-report.sh_

## Repo-status

EOF

# Git status for aurora-trade-hub
REPO="$HOME/repos/aurora-trade-hub"
if [ -d "$REPO/.git" ]; then
  BRANCH=$(git -C "$REPO" branch --show-current 2>/dev/null || echo "ukjent")
  LAST_COMMIT=$(git -C "$REPO" log -1 --format="%h %s (%ar)" 2>/dev/null || echo "ingen commits")
  BEHIND=$(git -C "$REPO" rev-list HEAD..origin/main --count 2>/dev/null || echo "?")
  cat >> "$REPORT_FILE" <<EOF
### aurora-trade-hub
- Branch: \`${BRANCH}\`
- Siste commit: ${LAST_COMMIT}
- Commits bak origin/main: ${BEHIND}

EOF
fi

# ----- Vercel deploy-status -----
cat >> "$REPORT_FILE" <<EOF
## Vercel-deploys

EOF

if command -v vercel &>/dev/null; then
  VERCEL_STATUS=$(vercel ls --json 2>/dev/null | head -50 || echo "Vercel ikke innlogget")
  echo "\`\`\`" >> "$REPORT_FILE"
  echo "$VERCEL_STATUS" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
else
  echo "_vercel CLI ikke installert på denne maskinen_" >> "$REPORT_FILE"
fi

# ----- Test-status -----
cat >> "$REPORT_FILE" <<EOF

## Test-resultater

EOF

if [ -d "$REPO" ]; then
  cd "$REPO"
  TEST_OUTPUT=$(npm run test --workspace=apps/portal 2>&1 | tail -20 || echo "Tester feilet")
  echo "\`\`\`" >> "$REPORT_FILE"
  echo "$TEST_OUTPUT" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
fi

# ----- Avslutt rapport -----
cat >> "$REPORT_FILE" <<EOF

## Notater

_Legg til manuelle notater her_

---
_Rapport generert: $(date '+%Y-%m-%d %H:%M:%S')_
EOF

log "Rapport skrevet til: $REPORT_FILE"
log "=== daily-report.sh ferdig ==="

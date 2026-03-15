#!/usr/bin/env bash
# =============================================================
# sync-all.sh — Pull alle repoer + Obsidian vault
# Kjøres på Mac mini. Logg til ~/logs/sync/YYYY-MM-DD.log
# =============================================================

set -euo pipefail

LOG_DIR="$HOME/logs/sync"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d).log"
mkdir -p "$LOG_DIR"

log() {
  echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "=== sync-all.sh startet ==="

# --- Aurora Trade Hub ---
REPO_GDIST="$HOME/repos/aurora-trade-hub"
if [ -d "$REPO_GDIST/.git" ]; then
  log "Pulling aurora-trade-hub..."
  git -C "$REPO_GDIST" fetch --all 2>&1 | tee -a "$LOG_FILE"
  git -C "$REPO_GDIST" pull origin main 2>&1 | tee -a "$LOG_FILE"
  log "aurora-trade-hub: OK"
else
  log "ADVARSEL: $REPO_GDIST finnes ikke. Klon med:"
  log "  git clone https://github.com/g-dist/aurora-trade-hub $REPO_GDIST"
fi

# --- Jessica Buyer Portal ---
REPO_BUYER="$HOME/repos/jessica-buyer-portal"
if [ -d "$REPO_BUYER/.git" ]; then
  log "Pulling jessica-buyer-portal..."
  git -C "$REPO_BUYER" pull origin main 2>&1 | tee -a "$LOG_FILE"
  log "jessica-buyer-portal: OK"
else
  log "INFO: jessica-buyer-portal ikke klonet ennå — hopper over"
fi

# --- Obsidian Vault ---
VAULT="$HOME/Documents/GlobalDistribution"
if [ -d "$VAULT/.git" ]; then
  log "Syncing Obsidian vault..."
  git -C "$VAULT" add -A 2>&1 | tee -a "$LOG_FILE"
  # Commit bare hvis det er endringer
  if ! git -C "$VAULT" diff --cached --quiet; then
    git -C "$VAULT" commit -m "chore: auto-sync $(date '+%Y-%m-%d %H:%M')" 2>&1 | tee -a "$LOG_FILE"
    git -C "$VAULT" push 2>&1 | tee -a "$LOG_FILE"
    log "Obsidian: committed + pushed"
  else
    git -C "$VAULT" pull 2>&1 | tee -a "$LOG_FILE"
    log "Obsidian: ingen endringer, bare pull"
  fi
else
  log "ADVARSEL: Obsidian vault har ikke git remote — hopper over push"
fi

log "=== sync-all.sh ferdig ==="

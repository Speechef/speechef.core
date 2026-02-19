#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# dev.sh — start the full Speechef stack with one command
#
# Usage:  ./dev.sh
#
# What it does:
#   1. Installs Docker CLI + Colima (lightweight Docker runtime)
#      via Homebrew if they are not already present.
#   2. Starts the Colima VM if it is not already running.
#   3. Runs docker compose up --build, which:
#        • Starts Postgres 16 + Redis 7
#        • Builds and starts the Django backend (auto-migrates + seeds)
#        • Builds and starts the Next.js frontend
#        • Starts Celery worker + beat
#
# Access the app:
#   Django  → http://localhost:8000
#   Next.js → http://localhost:3000
#   Admin   → http://localhost:8000/admin
# ─────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

# ── helpers ────────────────────────────────────────────────
green() { printf '\033[0;32m%s\033[0m\n' "$*"; }
blue()  { printf '\033[0;34m%s\033[0m\n' "$*"; }
warn()  { printf '\033[0;33m%s\033[0m\n' "$*"; }

# ── 1. docker CLI ──────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  blue "Installing docker CLI via Homebrew…"
  brew install docker
fi

# ── 2. docker compose plugin ──────────────────────────────
if ! docker compose version &>/dev/null 2>&1; then
  blue "Installing docker-compose plugin via Homebrew…"
  brew install docker-compose
  mkdir -p ~/.docker/cli-plugins
  ln -sfn "$(brew --prefix)/opt/docker-compose/bin/docker-compose" \
          ~/.docker/cli-plugins/docker-compose
fi

# ── 3. colima (Docker runtime — no Docker Desktop needed) ─
if ! command -v colima &>/dev/null; then
  blue "Installing Colima (lightweight Docker runtime) via Homebrew…"
  blue "This is a one-time download (~150 MB)."
  brew install colima
fi

# ── 4. start colima VM if not running ─────────────────────
if ! colima status 2>/dev/null | grep -q "Running"; then
  blue "Starting Colima VM (first run takes ~60 seconds to download the VM image)…"
  colima start --cpu 2 --memory 4
  green "Colima started."
else
  green "Colima already running."
fi

# ── 5. docker compose up ───────────────────────────────────
echo ""
green "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
green " Starting Speechef"
green " Django  → http://localhost:8000"
green " Next.js → http://localhost:3000"
green " Admin   → http://localhost:8000/admin"
green "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
warn "Press Ctrl+C to stop all services."
echo ""

docker compose up --build

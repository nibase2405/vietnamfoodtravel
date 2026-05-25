#!/usr/bin/env bash
set -euo pipefail

echo "== RunCloud deploy: $(date -u +"%Y-%m-%dT%H:%M:%SZ") =="
echo "Working directory: $(pwd)"

export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export npm_config_cache="${HOME}/.npm"
export PM2_HOME="${HOME}/.pm2"

node -v
npm -v

if command -v pnpm >/dev/null 2>&1; then
  PNPM="pnpm"
else
  PNPM="npx --yes pnpm@11.0.8"
fi

echo "Installing dependencies with: ${PNPM}"
${PNPM} install --frozen-lockfile

echo "Building Next.js application"
${PNPM} run build

if command -v pm2 >/dev/null 2>&1; then
  PM2="pm2"
else
  PM2="npx --yes pm2"
fi

echo "Starting application with: ${PM2}"
${PM2} startOrReload ecosystem.config.cjs --update-env
${PM2} save

echo "Deployment finished"

#!/usr/bin/env bash
set -euo pipefail

# Run this script from the frontend directory to execute Prisma commands inside a Debian-based Node container
# Example: cd techuai/frontend && ./scripts/prisma-docker-run.sh

docker run --rm -v "$PWD":/app -w /app node:20-bullseye bash -lc \
  "npm install --silent && npx prisma generate && npx prisma migrate dev --name init --skip-seed"

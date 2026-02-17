#!/bin/bash

set -euo pipefail

COMPOSE_FILE="$(dirname "$0")/docker-compose.test.yml"

cleanup() {
  cd ..
  echo "Stopping test database..."
  docker compose -f "$COMPOSE_FILE" down
}

trap cleanup EXIT

echo "Starting test database..."
docker compose -f "$COMPOSE_FILE" up -d --wait

echo "Running integration tests..."
cd ./backend
yarn test:integration

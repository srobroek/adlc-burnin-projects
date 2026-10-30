#!/usr/bin/env bash
# The agenda project's check: lint, typecheck, tests. Run from anywhere.
set -euo pipefail
cd "$(dirname "$0")"
bun install --frozen-lockfile
bun run check

#!/bin/sh
# Run every caelundas-db migration against each database in the comma-separated
# CAELUNDAS_MIGRATION_DATABASES, in order, stopping at the first failure. The
# host and credentials come from CAELUNDAS_POSTGRES_*; re-running applies nothing.
set -eu

: "${CAELUNDAS_MIGRATION_DATABASES:?set CAELUNDAS_MIGRATION_DATABASES to a comma-separated list of databases}"

cd /workspace/projects/caelundas/caelundas-db
export SWC_NODE_PROJECT=configuration/tsconfig.json

printf '%s\n' "$CAELUNDAS_MIGRATION_DATABASES" | tr ',' '\n' | while IFS= read -r database; do
  [ -n "$database" ] || continue
  echo "caelundas-migrate: migrating ${database}"
  CAELUNDAS_POSTGRES_DATABASE="$database" node --import @swc-node/register/esm-register \
    node_modules/typeorm/cli.js migration:run -d src/modules/database/data-source.constants.ts
done

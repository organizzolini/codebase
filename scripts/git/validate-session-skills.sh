#!/bin/bash
#
# sessionStart hook: checks that skills in skills-lock.json are installed.
#
#   - Silent when every declared skill is present; otherwise injects the gaps
#     as additionalContext
#
# It reports rather than restores: skills register at session start, so a
# restore would miss it.

cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 0
CONTEXT="$(NODE_OPTIONS='' node --import @swc-node/register/esm-register synchronization/src/synchronization.main.ts installed-skills check 2>/dev/null)" && exit 0
printf '%s' "${CONTEXT}" | bash scripts/git/emit-session-hook-context.sh "pnpm exec nx run synchronization:installed-skills"

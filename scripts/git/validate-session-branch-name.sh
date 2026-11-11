#!/bin/bash
#
# sessionStart hook: validates the git branch name via `session-branch-name`.
#
#   - Silent when the branch follows <type>/<scope>-<description>, or has no branch
#   - Otherwise injects the command's output as additionalContext, verbatim
#   - Injects a `pnpm install` or rerun directive when the command cannot run

cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 0
CONTEXT="$(NODE_OPTIONS='' node --import @swc-node/register/esm-register validation/src/validation.main.ts session-branch-name 2>/dev/null)" && exit 0
printf '%s' "${CONTEXT}" | bash scripts/git/emit-session-hook-context.sh "pnpm exec nx run validation:start:session-branch-name"

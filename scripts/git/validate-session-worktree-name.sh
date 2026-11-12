#!/bin/bash
#
# sessionStart hook: validates the worktree directory name via `session-worktree-name`.
#
#   - Silent for the main repository, a submodule, or a kebab-case worktree
#   - Otherwise injects the naming errors as additionalContext
#   - Injects an install directive when the command cannot run
#
# It judges this script's own checkout.

cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 0
CONTEXT="$(NODE_OPTIONS='' node --import @swc-node/register/esm-register validation/src/validation.main.ts session-worktree-name 2>/dev/null)" && exit 0
printf '%s' "${CONTEXT}" | bash scripts/git/emit-session-hook-context.sh "pnpm exec nx run validation:start:session-worktree-name"

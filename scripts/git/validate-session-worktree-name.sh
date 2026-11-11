#!/bin/bash
#
# sessionStart hook: validates the worktree directory name via `session-worktree-name`.
#
#   - Silent for the main repository, a submodule, or a kebab-case worktree
#   - Otherwise injects the naming errors and a directive as additionalContext
#   - Injects a pnpm install or rerun directive when the command cannot run
#
# It judges the checkout this script lives in, not the caller's directory.

cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 0
CONTEXT="$(NODE_OPTIONS='' node --import @swc-node/register/esm-register validation/src/validation.main.ts session-worktree-name 2>/dev/null)" && exit 0
printf '%s' "${CONTEXT}" | bash scripts/git/emit-session-hook-context.sh "pnpm exec nx run validation:start:session-worktree-name"

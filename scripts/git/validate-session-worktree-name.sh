#!/bin/bash
#
# sessionStart hook — validates the current git worktree directory naming,
# through `session-worktree-name` in the validation project.
#
#   - Silent when the checkout is the main repository, a submodule, or a
#     worktree whose directory follows lowercase kebab-case naming and, inside
#     the main checkout, is gitignored
#   - Injects the worktree naming errors + using-git-worktrees skill directive
#     as additionalContext otherwise: the command's standard output is that
#     context, word for word
#   - Injects a "run pnpm install" directive when the command cannot even boot
#     for want of dependencies, or the command to rerun it when it crashed —
#     what an empty context means to emit-session-hook-context.sh
#
# The worktree judged is the checkout this script lives in, not the caller's
# working directory, which is why it runs from the script's repository root.

cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 0
CONTEXT="$(NODE_OPTIONS='' node --import @swc-node/register/esm-register projects/validation/src/validation.main.ts session-worktree-name 2>/dev/null)" && exit 0
printf '%s' "${CONTEXT}" | bash scripts/git/emit-session-hook-context.sh "pnpm exec nx run validation:start:session-worktree-name"

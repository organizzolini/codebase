#!/bin/bash
#
# sessionStart hook — validates the current git branch name, through
# `session-branch-name` in the validation project.
#
#   - Silent when the branch follows <type>/<scope>-<description>, or when
#     there is no branch at all (detached HEAD, no repository, no git)
#   - Injects the validate-branch-name errorMsg + rename-branch skill directive
#     as additionalContext otherwise: the command's standard output is that
#     context, word for word
#   - Injects a "run pnpm install" directive when the command cannot even boot
#     for want of dependencies, or the command to rerun it when it crashed —
#     what an empty context means to emit-session-hook-context.sh

cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 0
CONTEXT="$(NODE_OPTIONS='' node --import @swc-node/register/esm-register validation/src/validation.main.ts session-branch-name 2>/dev/null)" && exit 0
printf '%s' "${CONTEXT}" | bash scripts/git/emit-session-hook-context.sh "pnpm exec nx run validation:start:session-branch-name"

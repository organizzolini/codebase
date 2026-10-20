#!/bin/bash
#
# sessionStart hook — validates that the git hooks directory exists.
#
#   - Silent when `core.hooksPath` resolves to a directory holding a pre-commit
#     hook
#   - Injects the repair commands as additionalContext otherwise
#
# Husky points `core.hooksPath` at a generated directory under the Husky
# folder, and git does not complain when that directory is missing: commits
# simply run no hooks, so the signing check and lint-staged stop without a
# word. Moving the Husky folder leaves every existing checkout in that state
# until its next install, and a worktree's own `core.hooksPath` names the main
# checkout's copy, so the main checkout's install fixes the folder but not the
# worktree's path.
#
# It reports rather than repairs: the repair writes git configuration shared by
# every worktree of the repository.

SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY_ROOT="$(cd "${SCRIPT_DIRECTORY}/../.." && pwd)"

HUSKY_DIRECTORY="configuration/.husky"

# ✅ Validation

HOOKS_PATH="$(git -C "${REPOSITORY_ROOT}" config core.hooksPath 2>/dev/null)"

if [[ -n "${HOOKS_PATH}" ]]; then
	[[ "${HOOKS_PATH}" == /* ]] || HOOKS_PATH="${REPOSITORY_ROOT}/${HOOKS_PATH}"
	[[ -f "${HOOKS_PATH}/pre-commit" ]] && exit 0
fi

# 📋 Context

COMMON_DIRECTORY="$(git -C "${REPOSITORY_ROOT}" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
MAIN_CHECKOUT="$(dirname "${COMMON_DIRECTORY}")"

CONTEXT="⚠️  Git hooks will not run: core.hooksPath is \"${HOOKS_PATH:-unset}\", which holds no pre-commit hook.
🚨 Commits and pushes skip the signing check, lint-staged, commitlint, and the branch-name check without any error.

Action required:
1. In the main checkout (${MAIN_CHECKOUT}), run \"pnpm install\" so Husky regenerates ${HUSKY_DIRECTORY}/_.
2. In a worktree, point it at that copy: \"git config --worktree core.hooksPath ${MAIN_CHECKOUT}/${HUSKY_DIRECTORY}/_\".
3. Re-run \"bash scripts/git/validate-session-hooks-path.sh\" to confirm.
Never run \"husky\" from a worktree: it overwrites the main checkout's core.hooksPath."

printf '%s' "${CONTEXT}" | bash "${SCRIPT_DIRECTORY}/emit-session-hook-context.sh"

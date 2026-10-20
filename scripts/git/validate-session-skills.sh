#!/bin/bash
#
# sessionStart hook — validates that the skills declared in skills-lock.json are
# installed, through `installed-skills check` in the synchronization project.
#
#   - Silent when every declared skill is present (check exits 0)
#   - Injects the missing skill names + restore directive as additionalContext
#     otherwise: check's standard output is that context, word for word
#   - Injects a "run pnpm install" directive when check cannot even boot for
#     want of dependencies, or the command to rerun it when it crashed — what
#     an empty context means to emit-session-hook-context.sh
#
# pnpm skips postinstall, which restores skills, when node_modules is already
# up to date, as in a worktree branched from an existing checkout; this hook
# catches that gap. It reports rather than restores, because skills register
# when a session starts, so a restore here would miss the current session.

cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 0
CONTEXT="$(NODE_OPTIONS='' node --import @swc-node/register/esm-register synchronization/src/synchronization.main.ts installed-skills check 2>/dev/null)" && exit 0
printf '%s' "${CONTEXT}" | bash scripts/git/emit-session-hook-context.sh "pnpm exec nx run synchronization:installed-skills"

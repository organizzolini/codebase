#!/bin/bash
#
# Shared sessionStart emitter — reads context text on stdin and prints the JSON
# shape the calling agent harness understands.
#
#   - Claude Code reads hookSpecificOutput.additionalContext
#   - GitHub Copilot reads a top-level additionalContext
#   - Empty input means the command that should have written the context could
#     not run at all: the context then says why, as far as this can tell
#   - Without node, nothing can be emitted, so it exits silently
#
# A hook that is a shim over a workspace command calls this only when that
# command fails, naming how a person reruns it to see its error:
#
#   CONTEXT="$(<command> 2>/dev/null)" && exit 0
#   printf '%s' "${CONTEXT}" | bash scripts/git/emit-session-hook-context.sh "<rerun>"

command -v node &>/dev/null || exit 0

REPOSITORY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RERUN_COMMAND="${1:-the session hook}"

# 🔎 Harness

# Claude Code exports CLAUDE_PROJECT_DIR into every hook command it runs, so its
# presence is what distinguishes a Claude Code hook from a Copilot one.
if [[ -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
	HOOK_CONTEXT_SHAPE='claude-code'
else
	HOOK_CONTEXT_SHAPE='copilot'
fi
export HOOK_CONTEXT_SHAPE

# 📋 Context

# The four lines of a fallback context, between which this adds the heading.
fallback_context() {
	printf '%s\n%s\n\nAction required:\n%s\n%s' "$@"
}

# pnpm writes node_modules/.modules.yaml last, so its absence means no install
# ever finished here; with it present the command itself is what broke.
if [[ -f "${REPOSITORY_ROOT}/node_modules/.modules.yaml" ]]; then
	FALLBACK_CONTEXT="$(fallback_context \
		"⚠️  A session hook could not run its check: it failed before printing a result, although dependencies are installed." \
		"🚨 What that check verifies is unknown until it runs." \
		"1. Run \"${RERUN_COMMAND}\" from the repository root to see the error, and fix it." \
		"2. Ask the user to start a new session afterwards so every session hook runs again.")"
else
	FALLBACK_CONTEXT="$(fallback_context \
		"⚠️  A session hook could not run its check, because this checkout's dependencies are not installed." \
		"🚨 What that check verifies is unknown until they are." \
		'1. Install them with "pnpm install" from the repository root.' \
		"2. Ask the user to start a new session afterwards so every session hook runs again.")"
fi

node -e "
const chunks = [];
process.stdin.on('data', (chunk) => chunks.push(chunk.toString()));
process.stdin.on('end', () => {
  const additionalContext =
    chunks.join('') || process.argv[1];
  const payload = process.env.HOOK_CONTEXT_SHAPE === 'claude-code'
    ? { hookSpecificOutput: { additionalContext, hookEventName: 'SessionStart' } }
    : { additionalContext };
  process.stdout.write(JSON.stringify(payload));
});
" "${FALLBACK_CONTEXT}"

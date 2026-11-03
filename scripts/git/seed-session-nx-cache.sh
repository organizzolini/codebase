#!/bin/bash
#
# sessionStart hook — points this session's Nx at the machine-wide shared cache.
#
#   - Starts the `installation` project's `shared-nx-cache` server when none is
#     answering, detached so it outlives the session and the worktree
#   - Appends the two environment variables Nx reads to Claude Code's
#     CLAUDE_ENV_FILE, so every `nx` call this session makes shares the cache
#   - `env` as the first argument prints those exports instead, for a git hook
#     to `eval`; nothing is printed while the server cannot be reached
#   - Always exits 0 and prints nothing else: a missing cache only makes Nx
#     slower, and must never block a session or a commit
#
# Every worktree keeps its own `.nx/cache` and task database, so a fresh one
# starts cold and re-runs every gate. A task that misses locally asks the
# shared server, which holds what any worktree on this machine has already
# computed, so an agent's first commit replays instead of recomputing.

SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY_ROOT="$(cd "${SCRIPT_DIRECTORY}/../.." && pwd)"

PORT="${NX_SHARED_CACHE_PORT:-19750}"
TOKEN="${NX_SELF_HOSTED_REMOTE_CACHE_ACCESS_TOKEN:-codebase-local-nx-cache}"
SERVER_URL="http://127.0.0.1:${PORT}"
LOG_FILE="${HOME}/.cache/codebase-nx-shared.log"

# 🩺 Health

# The server answers an unknown hash with 404; anything else is not it.
is_serving() {
	local status
	status="$(curl -s -o /dev/null -m 2 -w '%{http_code}' \
		-H "Authorization: Bearer ${TOKEN}" "${SERVER_URL}/v1/cache/probe" 2>/dev/null)"
	[[ "${status}" == "404" ]]
}

# 🚀 Start

start_server() {
	command -v node &>/dev/null || return 1
	[[ -d "${REPOSITORY_ROOT}/node_modules" ]] || return 1

	mkdir -p "$(dirname "${LOG_FILE}")"
	(
		cd "${REPOSITORY_ROOT}" || exit 1
		NODE_OPTIONS='' nohup node --import @swc-node/register/esm-register \
			installation/src/installation.main.ts shared-nx-cache --port "${PORT}" \
			>>"${LOG_FILE}" 2>&1 </dev/null &
	)

	local attempt
	for attempt in 1 2 3 4 5 6 7 8 9 10; do
		is_serving && return 0
		sleep 0.5
	done
	return 1
}

# 📋 Output

is_serving || start_server || exit 0

EXPORTS="export NX_SELF_HOSTED_REMOTE_CACHE_SERVER='${SERVER_URL}'
export NX_SELF_HOSTED_REMOTE_CACHE_ACCESS_TOKEN='${TOKEN}'"

if [[ "${1:-}" == "env" ]]; then
	printf '%s\n' "${EXPORTS}"
elif [[ -n "${CLAUDE_ENV_FILE:-}" ]]; then
	printf '%s\n' "${EXPORTS}" >>"${CLAUDE_ENV_FILE}"
fi

exit 0

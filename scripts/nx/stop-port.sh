#!/bin/bash
#
# Stops whatever listens on a TCP port.
#
# Usage: stop-port.sh --port <port> [--timeout <seconds>]
#
#   --port     TCP port to free. Required.
#   --timeout  Seconds after SIGTERM before SIGKILL. Default 10.
#
# Only listeners stop, never clients, so an open browser tab survives. A `node --watch`
# parent is stopped too, or it restarts the server.
#
# Empty values count as unset, so callers can forward flags.

set -euo pipefail

port=""
timeout="10"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port) port="${2:-}" ;;
    --timeout) timeout="${2:-}" ;;
    *)
      echo "stop-port: unknown argument '$1'" >&2
      exit 2
      ;;
  esac
  shift 2 || {
    echo "stop-port: '$1' needs a value" >&2
    exit 2
  }
done

timeout="${timeout:-10}"

if [[ -z "${port}" ]]; then
  echo "stop-port: set --port (for an Nx target, options.port)" >&2
  exit 2
fi

if ! [[ "${port}" =~ ^[0-9]+$ && "${timeout}" =~ ^[0-9]+$ ]]; then
  echo "stop-port: --port and --timeout must be whole numbers, got '${port}' and '${timeout}'" >&2
  exit 2
fi

listeners() {
  lsof -nP -t "-iTCP:${port}" -sTCP:LISTEN 2>/dev/null || true
}

# Prints the parent of a process when that parent is a `node --watch` supervisor.
watch_supervisor_of() {
  local parent_id
  parent_id="$(ps -o ppid= -p "$1" 2>/dev/null | tr -d ' ')"
  if [[ -n "${parent_id}" ]] && [[ "$(ps -o command= -p "${parent_id}" 2>/dev/null)" == *" --watch "* ]]; then
    echo "${parent_id}"
  fi
}

process_ids="$(listeners)"

if [[ -z "${process_ids}" ]]; then
  echo "👍 Nothing is listening on port ${port}"
  exit 0
fi

supervisor_ids=""
for process_id in ${process_ids}; do
  supervisor_ids="${supervisor_ids} $(watch_supervisor_of "${process_id}")"
done

for process_id in ${supervisor_ids}; do
  echo "⏹️ Stopping the node --watch supervisor (${process_id}) of port ${port}"
  kill "${process_id}" 2>/dev/null || true
done

for process_id in ${process_ids}; do
  process_name="$(ps -p "${process_id}" -o comm= 2>/dev/null || echo "unknown")"
  echo "⏹️ Stopping ${process_name} (${process_id}) on port ${port}"
  kill "${process_id}" 2>/dev/null || true
done

deadline=$(($(date +%s) + timeout))
while [[ -n "$(listeners)" && "$(date +%s)" -lt "${deadline}" ]]; do
  sleep 0.2
done

stragglers="$(listeners)"
if [[ -n "${stragglers}" ]]; then
  for process_id in ${stragglers}; do
    echo "💥 ${process_id} ignored SIGTERM for ${timeout}s, sending SIGKILL"
    kill -9 "${process_id}" 2>/dev/null || true
  done
  sleep 0.5
fi

if [[ -n "$(listeners)" ]]; then
  echo "stop-port: port ${port} is still in use" >&2
  exit 1
fi

echo "✅ Port ${port} is free"

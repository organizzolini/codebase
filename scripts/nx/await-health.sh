#!/bin/bash
#
# Blocks until an HTTP endpoint is healthy, or fails.
#
# Usage: await-health.sh --url <url> [--query <graphql>] [--expect <text>] [--timeout <seconds>]
#
#   --url      Required.
#   --query    GraphQL body; else a GET.
#   --expect   Body text required, else any 2xx.
#   --timeout  Seconds to retry. Default 60.
#
# Empty values count as unset.

set -euo pipefail

url=""
query=""
expect=""
timeout="60"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url) url="${2:-}" ;;
    --query) query="${2:-}" ;;
    --expect) expect="${2:-}" ;;
    --timeout) timeout="${2:-}" ;;
    *)
      echo "await-health: unknown argument '$1'" >&2
      exit 2
      ;;
  esac
  shift 2 || {
    echo "await-health: '$1' needs a value" >&2
    exit 2
  }
done

timeout="${timeout:-60}"

if [[ -z "${url}" ]]; then
  echo "await-health: set --url (for an Nx target, options.url)" >&2
  exit 2
fi

if ! [[ "${timeout}" =~ ^[0-9]+$ ]]; then
  echo "await-health: --timeout must be a whole number of seconds, got '${timeout}'" >&2
  exit 2
fi

curl_arguments=(--fail --silent --show-error --max-time 2)
if [[ -n "${query}" ]]; then
  escaped_query="${query//\\/\\\\}"
  escaped_query="${escaped_query//\"/\\\"}"
  curl_arguments+=(--header "content-type: application/json" --data "{\"query\":\"${escaped_query}\"}")
fi

started_at="$(date +%s)"
deadline=$((started_at + timeout))

while [[ "$(date +%s)" -lt "${deadline}" ]]; do
  if response="$(curl "${curl_arguments[@]}" "${url}" 2>/dev/null)"; then
    if [[ -z "${expect}" || "${response}" == *"${expect}"* ]]; then
      echo "✅ ${url} healthy after $(($(date +%s) - started_at))s"
      exit 0
    fi
  fi
  sleep 0.5
done

echo "await-health: ${url} was not healthy after ${timeout}s" >&2
exit 1

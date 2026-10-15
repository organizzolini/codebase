#!/bin/bash
#
# Block until an HTTP endpoint reports healthy, or fail once a deadline passes.
#
# Usage: await-health.sh --url <url> [--query <graphql>] [--expect <text>] [--timeout <seconds>]
#
#   --url      Endpoint to poll. Required.
#   --query    A GraphQL query to POST to the endpoint. Without it, the script sends a GET.
#   --expect   Text that must appear in the response body. Without it, any 2xx response passes.
#   --timeout  Seconds to keep trying before failing. Default 60.
#
# An empty value counts as unset, so a caller can forward optional flags unconditionally.

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

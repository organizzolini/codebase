#!/bin/bash

echo "🫜 Validating codebase root directory..."
current_directory="$(pwd)"
workspace_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"

if [[ -z "${workspace_root}" ]] || [[ "${current_directory}" != "${workspace_root}" ]] || [[ ! -f "package.json" ]] || [[ ! -f "./scripts/utilities.sh" ]]; then
  echo "❌ Error: This script must be run from the codebase workspace/worktree root directory"
  echo "📁 Current directory: ${current_directory}"
  if [[ -n "${workspace_root}" ]]; then
    echo "📁 Detected git root: ${workspace_root}"
  fi
  exit 1
fi

echo "🚪 Setting script to exit immediately on error..."
set -e

echo "🎛️  Exporting environment variables from .env file..."
if [[ -f ".env" ]]; then
  set -a
  # shellcheck source=/dev/null
  source .env
  set +a
else
  echo "⚠️  .env file not found (will be created by the installation setup command)"
fi

# Only scripts git already stores as executable are touched. Making a file
# executable that git stores as 644 shows up as a modification, and a later
# `git add -A` would commit it.
echo "👟 Making the codebase workspace's executable scripts executable..."
git ls-files --stage -- '*.sh' | while read -r mode _ _ script; do
  if [[ "${mode}" == "100755" ]]; then
    chmod +x "${script}"
  fi
done || true

get_git_commit_hash() {
  local commit
  commit=$(git rev-parse --short=7 HEAD 2>/dev/null || echo "unknown")
  echo "🔖 Git Commit Hash (first 7 characters): ${commit}" >&2
  echo "${commit}"
}

get_utc_timestamp() {
  local timestamp
  timestamp=$(date -u +"%Y%m%d-%H%M%S")
  echo "🕐 UTC Timestamp: ${timestamp}" >&2
  echo "${timestamp}"
}

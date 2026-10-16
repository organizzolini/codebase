#!/usr/bin/env bash
# Imports the Nx task cache the pull request's own run uploaded, into a merge
# group's run.
#
# A merge group runs on a ref of its own, which can read `main`'s caches and
# its own, never the pull request's. Its tasks are mostly the ones the pull
# request's run just finished, so without this they run twice. A workflow
# artifact is readable by any run in the repository, so the pull request's run
# uploads its cache as one (see `cleanup-codebase`) and this downloads it.
#
# Only a pull request from this repository is trusted: a fork's artifact could
# carry results crafted for any task hash. Any other outcome, a missing
# artifact included, ends cleanly with a cold cache; the run must never fail
# for want of a cache.
#
# Environment:
#   GITHUB_REF, GITHUB_REPOSITORY  the merge group's ref and this repository
#   NX_CACHE_SCOPE                 the leg's cache scope, in the artifact's name
#   GH_TOKEN                       a token with `actions: read`
#   GH                             the `gh` command to use (default `gh`)

set -euo pipefail

gh_command="${GH:-gh}"
merge_script="$(dirname "${BASH_SOURCE[0]}")/merge-task-cache.sh"
work_directory="$(mktemp -d)"
trap 'rm -rf "${work_directory}"' EXIT

# Runs inside an `if`, where `set -e` does not apply, so each step that can
# fail says so with `|| return 1`.
import_cache() {
  local pattern='^refs/heads/gh-readonly-queue/[^/]+/pr-([0-9]+)-[0-9a-f]+$'
  if [[ ! "${GITHUB_REF:-}" =~ ${pattern} ]]; then
    echo "📥 Not a merge group; nothing to import"
    return 0
  fi
  local number="${BASH_REMATCH[1]}"
  local repository="${GITHUB_REPOSITORY:?}"

  local pull_request head_sha head_repository base_repository
  pull_request="$(
    "${gh_command}" api "repos/${repository}/pulls/${number}" \
      --jq '[.head.sha, (.head.repo.full_name // "none"), .base.repo.full_name] | join(" ")'
  )" || return 1
  read -r head_sha head_repository base_repository <<<"${pull_request}"
  if [[ -z "${head_sha}" || "${head_repository}" != "${base_repository}" ]]; then
    echo "📥 Pull request #${number} comes from ${head_repository}, not ${base_repository}; not importing"
    return 0
  fi

  local name="nx-cache-${NX_CACHE_SCOPE:?}-${head_sha}"
  local repository_id artifact
  repository_id="$("${gh_command}" api "repos/${repository}" --jq .id)" || return 1
  artifact="$(
    "${gh_command}" api "repos/${repository}/actions/artifacts?name=${name}&per_page=10" \
      --jq "[.artifacts[] | select(.expired == false and .workflow_run.head_sha == \"${head_sha}\" and .workflow_run.head_repository_id == ${repository_id})] | .[0].id // empty"
  )" || return 1
  if [[ -z "${artifact}" ]]; then
    echo "📥 No ${name} artifact from this repository; running cold"
    return 0
  fi

  "${gh_command}" api "repos/${repository}/actions/artifacts/${artifact}/zip" \
    >"${work_directory}/cache.zip" || return 1
  mkdir "${work_directory}/cache"
  unzip -q "${work_directory}/cache.zip" -d "${work_directory}/cache" || return 1
  echo "📥 Importing ${name} from pull request #${number}"
  bash "${merge_script}" "${work_directory}/cache" || return 1
}

if ! import_cache; then
  echo "::warning::Could not import the pull request's Nx cache; running cold"
fi

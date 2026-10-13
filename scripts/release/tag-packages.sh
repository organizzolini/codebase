#!/usr/bin/env bash
# Tags each newly versioned ic-suite package on the release commit, and pushes
# the tags.
#
# semantic-release's release commit carries the versions and changelogs that
# version-packages.sh wrote. It makes that commit only when the codebase itself
# releases, which a package-scoped `no-release` commit can prevent while Nx
# still bumps the package, so anything left uncommitted is committed here
# instead, on its own.
#
# A package is newly versioned when its `<project>@<version>` tag, the pattern
# nx.json's `release.releaseTag` sets, does not exist yet. Checkout fetches
# every tag, so only this release's are missing, and a re-run creates nothing
# twice. A new package's hand-written `0.0.0` is never tagged as a release: it
# has not been released, and its first release is still to come.
#
# That first release needs a starting point, though. Nx writes a changelog from
# a package's previous tag and stops when it has none, so a package that has
# never been tagged gets a `<project>@0.0.0` baseline on the commit before the
# one that added it. Nx then reads that as its current version and versions
# every commit that touched the package, the one that added it included. It is
# an anchor, not a release: nothing is published from it, and the first real
# tag follows when the release commit is tagged.
#
# GitHub rejects any push to this repository that updates more than 6 refs,
# and a first release tags 20 or more packages, so the tags go 6 at a time. A
# rejected batch is retried, since GitHub rejected one of v2.35.0's moments
# after accepting the batch before it. Tags still missing when the run ends are
# pushed by the next run, which runs this script before versioning.
#
# Inputs, all from the environment:
#   GIT_COMMITTER_NAME, GIT_COMMITTER_EMAIL
#                      the identity a leftover release commit is signed as
#   GITHUB_ENV         where `RELEASE_SUPERSEDED=true` is written when `main`
#                      moved before the leftover commit could be pushed
# The remote must already carry a token allowed to push, as
# version-packages.sh leaves it.

set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/release-group.sh"
source "$(dirname "${BASH_SOURCE[0]}")/main-tip.sh"

# The most refs GitHub accepts in one push to this repository.
readonly REFS_PER_PUSH=6

# How many times a rejected batch of tags is pushed in all, and the seconds
# between attempts, which tests can shorten.
readonly PUSH_ATTEMPTS=4
readonly PUSH_RETRY_DELAY="${PUSH_RETRY_DELAY:-20}"

# Prints every file version-packages.sh may have written that exists. Globs
# rather than git path patterns, which fail the whole `git add` when one
# matches nothing, as the changelog one does until a package's first
# changelog entry.
versioned_files() {
  local file
  for file in packages/ic-suite/*/*/CHANGELOG.md packages/ic-suite/*/*/package.json pnpm-lock.yaml; do
    if [[ -e "${file}" ]]; then printf '%s\n' "${file}"; fi
  done
}

# Commits and pushes any versions semantic-release left uncommitted. A push
# rejected because `main` moved steps aside, as main-tip.sh describes, and
# exits the script before anything is tagged.
commit_leftover_versions() {
  local base files
  mapfile -t files < <(versioned_files)
  git add -- "${files[@]}"
  if git diff --cached --quiet; then
    return
  fi
  echo "🏷️ No codebase release committed the package versions; committing them"
  base="$(git rev-parse HEAD)"
  git commit --message "chore(release): 🔖 tag packages"
  if ! git push origin HEAD:refs/heads/main; then
    if main_has_moved_from "${base}"; then
      step_aside_from "${base}"
      exit 0
    fi
    exit 1
  fi
}

# Tags the commit before each never-tagged release-group package was added with
# a `<project>@0.0.0` baseline, adding each tag it makes to `tags`. A package
# that has any tag, or whose version is no longer `0.0.0`, is left alone, so a
# released package that lost its tag is not restarted from its first commit;
# tag_new_versions tags it at HEAD instead.
tag_baselines() {
  local group project root added parent
  group="$(release_group)"
  while read -r project root; do
    if [[ "$(jq -r .version "${root}/package.json")" != "0.0.0" ]] ||
      [[ -n "$(git tag --list "${project}@*")" ]]; then
      continue
    fi
    added="$(git log --diff-filter=A --format=%H -- "${root}/package.json" | tail -n 1)"
    if [[ -z "${added}" ]] || ! parent="$(git rev-parse --verify --quiet "${added}^")"; then
      echo "❌ Cannot find the commit before ${project} was added" >&2
      exit 1
    fi
    git tag --annotate "${project}@0.0.0" "${parent}" --message "${project}@0.0.0"
    tags+=("${project}@0.0.0")
  done <<<"${group}"
}

# Tags HEAD for every release-group package whose version has no tag yet,
# adding each tag it makes to `tags`.
tag_new_versions() {
  local group project root tag
  group="$(release_group)"
  while read -r project root; do
    tag="${project}@$(jq -r .version "${root}/package.json")"
    if [[ "${tag}" == *@0.0.0 ]] || git rev-parse --quiet --verify "refs/tags/${tag}" >/dev/null; then
      continue
    fi
    git tag --annotate "${tag}" --message "${tag}"
    tags+=("${tag}")
  done <<<"${group}"
}

# Pushes the given refs, trying again after a rejection, up to PUSH_ATTEMPTS
# times in all.
push_with_retries() {
  local attempt
  for ((attempt = 1; attempt < PUSH_ATTEMPTS; attempt++)); do
    git push origin "$@" && return 0
    echo "🔁 Push rejected; trying again in ${PUSH_RETRY_DELAY}s"
    sleep "${PUSH_RETRY_DELAY}"
  done
  git push origin "$@"
}

commit_leftover_versions

tags=()
tag_baselines
tag_new_versions
echo "🏷️ Pushing ${#tags[@]} package tags, ${REFS_PER_PUSH} at a time"

for ((start = 0; start < ${#tags[@]}; start += REFS_PER_PUSH)); do
  refs=()
  for tag in "${tags[@]:start:REFS_PER_PUSH}"; do
    refs+=("refs/tags/${tag}")
  done
  push_with_retries "${refs[@]}"
done

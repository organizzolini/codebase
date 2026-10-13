#!/usr/bin/env bash
# Versions and tags the codebase with semantic-release: the root version, the
# root `CHANGELOG.md`, the `v*` tag and GitHub release the README badge shows,
# and the one `chore(release): 🔖 tag codebase` commit that also carries the
# package versions and changelogs version-packages.sh wrote.
#
# It steps aside, as main-tip.sh describes, both before semantic-release and
# after a failed one. Before matters because semantic-release, finding `main`
# ahead of it, skips the release and exits 0, and tag-packages.sh would then
# commit the package versions on a stale commit. After matters because
# semantic-release takes minutes before it pushes, and a merge in that window
# gets the push rejected. Any other failure still fails.
#
# Inputs, all from the environment:
#   GITHUB_TOKEN  a token allowed to push to `main`, create tags and releases
#   GIT_COMMITTER_NAME, GIT_COMMITTER_EMAIL
#                 the identity the release commit is signed as
#   GITHUB_ENV    where `RELEASE_SUPERSEDED=true` is written when `main` moved

set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/main-tip.sh"

base="$(git rev-parse HEAD)"

if main_has_moved_from "${base}"; then
  step_aside_from "${base}"
  exit 0
fi

# The release commit and its push skip Husky's hooks. Every task in the
# pre-commit hook only checks, and the merge queue already ran those checks on
# this same content, so repeating them here only costs time: over 20 minutes
# for a release that bumps most of the packages, which outran the job's
# timeout. The release commit's content is a version, a changelog and a
# lockfile written by Nx, and the push to `main` runs the full checks again.
status=0
HUSKY=0 pnpm semantic-release || status=$?
if [[ "${status}" -eq 0 ]]; then
  exit 0
fi

if main_has_moved_from "${base}"; then
  step_aside_from "${base}"
  exit 0
fi

exit 1

#!/usr/bin/env bash
# Runs one Nx target on the projects a CI change affects, after correcting the
# list of changed files Nx selects projects from.
#
# Fits in as: CI matrix leg -> `run-affected` action -> this script ->
# `nx affected --target=$TARGET`. The caller picks the target and the revisions;
# Nx picks the projects. This script only decides which changed files Nx is
# told about. The pre-commit hook does not use it (see
# `configuration/lint-staged.config.ts`).
#
# 1. List the files changed between NX_BASE and NX_HEAD.
# 2. Find the spelling files. They over-select: Nx decides affected per project,
#    not per target, and `spell-check` lists the dictionaries as inputs, so one
#    new word selected every project for every target. Dropped unless
#    INCLUDE_SPELLING is "true".
# 3. With none, run `nx affected --base --head`. Otherwise give Nx the list
#    without them over `--stdin`.
#
# `--stdin` is the fallback because Nx reads every file it is handed as changed
# in full: a lockfile then touches every project, and a one-line version bump
# selected 47 projects instead of 3. Only `--base`/`--head` diff such files
# field by field.
#
# The list is built the way Nx builds its own: merge base of the revisions,
# falling back to NX_BASE. An empty list affects nothing; it never falls back
# to everything.
#
# Environment:
#   TARGET            the Nx target to run (required)
#   ARGUMENTS         extra `nx affected` flags, space separated
#   NX_BASE, NX_HEAD  the revisions, as `nrwl/nx-set-shas` exports them
#   INCLUDE_SPELLING  "true" to keep spelling files in the list
#   SPELLING_PATHS    extended regex overriding which files are spelling

set -euo pipefail

DEFAULT_SPELLING_PATHS='^configuration/\.cspell/|(^|/)cspell\.config\.yaml$'

spelling_paths="${SPELLING_PATHS:-${DEFAULT_SPELLING_PATHS}}"

arguments=()
read -ra arguments <<<"${ARGUMENTS:-}"

# Prints the changed files, one per line.
list_changed_files() {
  local base
  base="$(git merge-base "${NX_BASE}" "${NX_HEAD}" || echo "${NX_BASE}")"
  git diff --name-only --no-renames --relative "${base}" "${NX_HEAD}"
}

# Prints the lines of "$2" matching the regex "$1".
matching() {
  grep -E "$1" <<<"$2" || true
}

# Prints the lines of "$2" not matching the regex "$1".
excluding() {
  grep -Ev "$1" <<<"$2" || true
}

# Prints heading "$1", then each file in "$2".
report() {
  local heading="$1" files="$2" file
  echo "${heading}"
  while IFS= read -r file; do
    printf '  %s\n' "${file}"
  done <<<"${files}"
}

if [[ -z "${TARGET:-}" ]]; then
  echo "❌ TARGET is unset; name the Nx target to run"
  exit 1
fi

if [[ -z "${NX_BASE:-}" || -z "${NX_HEAD:-}" ]]; then
  echo "❌ NX_BASE and NX_HEAD are unset; run setup-codebase first"
  exit 1
fi

# Steps 1 and 2. The list is only built when spelling files are to be dropped.
changed=""
spelling=""
if [[ "${INCLUDE_SPELLING:-false}" != "true" ]]; then
  changed="$(list_changed_files)"
  spelling="$(matching "${spelling_paths}" "${changed}")"
fi

# Step 3, nothing to drop: Nx diffs the revisions itself.
if [[ -z "${spelling}" ]]; then
  exec pnpm exec nx affected --base="${NX_BASE}" --head="${NX_HEAD}" \
    --target="${TARGET}" ${arguments[@]+"${arguments[@]}"}
fi

# Step 3, dropping: hand Nx the list without the spelling files.
report "✂️ Not affecting ${TARGET} with spelling files:" "${spelling}"

excluding "${spelling_paths}" "${changed}" \
  | pnpm exec nx affected --stdin --target="${TARGET}" \
    ${arguments[@]+"${arguments[@]}"}

#!/usr/bin/env bash
# Runs one Nx target on the projects a CI change affects, after correcting the
# list of changed files that Nx would otherwise select projects from.
#
# WHERE IT FITS
#
#   CI matrix leg (continuous-integration.yml)
#     -> `run-affected` composite action (.github/actions/run-affected)
#       -> this script
#         -> `nx affected --target=$TARGET`
#
# The CI job picks the target (`guard-code`, `test-code`, ...) and the
# revisions (`NX_BASE`, `NX_HEAD`, from `nrwl/nx-set-shas`). This script does not
# choose targets or projects. Nx does, by mapping changed files onto the
# `inputs` each project's target declares. This script only decides which
# changed files Nx is told about. The pre-commit hook does not use it: it hands
# Nx its own revisions in `configuration/lint-staged.config.ts` and covers
# templates with a separate entry there.
#
# HOW IT WORKS
#
#   1. List the files changed between the two revisions.
#   2. Find the ones that would mislead Nx for this target:
#        - spelling files, which over-select (see SPELLING below)
#        - conformetry templates, which under-select (see TEMPLATES below)
#   3. If there are none, run `nx affected --base --head` and let Nx diff the
#      revisions itself. Otherwise rewrite the list and give it to Nx over
#      `--stdin`.
#
# SPELLING (dropped unless INCLUDE_SPELLING is "true")
#
# `spell-check` lists the shared dictionaries among its `{workspaceRoot}`
# inputs, and Nx decides affected per project, not per target: one new word in
# a dictionary marks every project affected for every target, so a word list
# edit ran the whole workspace's tests and timed the job out. Only the target
# that runs `spell-check` should see those files.
#
# TEMPLATES (added to only if INCLUDE_TEMPLATES is "true")
#
# `.nxignore` hides `configuration/conformetry-templates` from Nx, because a
# template holds a `project.json` that Nx would register as a project, so a
# template edit marks no project affected and every cached
# `conformetry-validate` looks current. With `INCLUDE_TEMPLATES` set, a changed
# template adds `configuration/conformetry.config.ts` to the list, which every
# instance project already lists as an input, so they are all selected. Only
# the target that runs `conformetry-validate` should set it: Nx decides affected
# per project, so every other target would run the whole workspace too.
#
# WHY --stdin IS THE FALLBACK, NOT THE DEFAULT
#
# Nx reads every file it is handed over `--stdin` as changed in full. A lockfile
# then touches every project, defeating `projectsAffectedByDependencyUpdates:
# "auto"`, and a release commit's one-line `package.json` version bump affected
# 47 projects instead of 3. Only `--base`/`--head` let Nx diff those files field
# by field, so any change set with nothing to correct goes through them
# unchanged.
#
# The changed-file list is built the way Nx builds its own: the merge base of
# the two revisions, falling back to `NX_BASE` itself, then
# `git diff --name-only --no-renames --relative`. An empty list affects nothing
# and exits cleanly; it never falls back to everything.
#
# Inputs, all from the environment:
#   TARGET            the Nx target to run (required)
#   ARGUMENTS         extra `nx affected` flags, space separated
#   NX_BASE, NX_HEAD  the revisions, as `nrwl/nx-set-shas` exports them
#   INCLUDE_SPELLING  "true" to keep spelling files in the list
#   INCLUDE_TEMPLATES "true" to select every conformetry instance project when
#                     a template changes
#   SPELLING_PATHS    an extended regex overriding which files are spelling
#   TEMPLATE_PATHS    an extended regex overriding which files are templates

set -euo pipefail

DEFAULT_SPELLING_PATHS='^configuration/\.cspell/|(^|/)cspell\.config\.yaml$'
DEFAULT_TEMPLATE_PATHS='^configuration/conformetry-templates/'
TEMPLATE_SELECTOR="configuration/conformetry.config.ts"

spelling_paths="${SPELLING_PATHS:-${DEFAULT_SPELLING_PATHS}}"
template_paths="${TEMPLATE_PATHS:-${DEFAULT_TEMPLATE_PATHS}}"

arguments=()
read -ra arguments <<<"${ARGUMENTS:-}"

# Prints the files changed between the revisions, one per line.
list_changed_files() {
  local base
  base="$(git merge-base "${NX_BASE}" "${NX_HEAD}" || echo "${NX_BASE}")"
  git diff --name-only --no-renames --relative "${base}" "${NX_HEAD}"
}

# Prints the lines of "$2" that match the extended regex "$1", or nothing.
matching() {
  grep -E "$1" <<<"$2" || true
}

# Prints the lines of "$2" that do not match the extended regex "$1".
excluding() {
  grep -Ev "$1" <<<"$2" || true
}

# Names each file in "$2" under the heading "$1".
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

# Step 1 and 2: list the changes and find the files that need correcting. The
# list is only built when this target asks for a correction.
changed=""
spelling=""
templates=""
drop_spelling=false
add_templates=false
[[ "${INCLUDE_SPELLING:-false}" != "true" ]] && drop_spelling=true
[[ "${INCLUDE_TEMPLATES:-false}" == "true" ]] && add_templates=true

if [[ "${drop_spelling}" == true || "${add_templates}" == true ]]; then
  changed="$(list_changed_files)"
fi
if [[ "${drop_spelling}" == true ]]; then
  spelling="$(matching "${spelling_paths}" "${changed}")"
fi
if [[ "${add_templates}" == true ]]; then
  templates="$(matching "${template_paths}" "${changed}")"
fi

# Step 3, nothing to correct: let Nx diff the revisions itself.
if [[ -z "${spelling}" && -z "${templates}" ]]; then
  exec pnpm exec nx affected --base="${NX_BASE}" --head="${NX_HEAD}" \
    --target="${TARGET}" ${arguments[@]+"${arguments[@]}"}
fi

# Step 3, corrected: rewrite the list and hand it to Nx.
corrected="${changed}"

if [[ -n "${spelling}" ]]; then
  report "✂️ Not affecting ${TARGET} with spelling files:" "${spelling}"
  corrected="$(excluding "${spelling_paths}" "${corrected}")"
fi

if [[ -n "${templates}" ]]; then
  report "🧬 Selecting every conformetry instance for ${TARGET}, templates changed:" \
    "${templates}"
  corrected="$(printf '%s\n%s' "${corrected}" "${TEMPLATE_SELECTOR}")"
fi

printf '%s\n' "${corrected}" \
  | pnpm exec nx affected --stdin --target="${TARGET}" \
    ${arguments[@]+"${arguments[@]}"}

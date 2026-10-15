#!/usr/bin/env bash
# Runs `nx affected` for one target between `NX_BASE` and `NX_HEAD`, dropping
# spelling files from the change set unless `INCLUDE_SPELLING` is "true".
#
# `spell-check` lists the shared dictionaries among its `{workspaceRoot}`
# inputs, and Nx decides affected per project, not per target: one new word in
# a dictionary marks every project affected for every target, so a word list
# edit ran the whole workspace's tests and timed the job out. Only the target
# that runs `spell-check` should see those files.
#
# Handing Nx its list over `--stdin` is the fallback, not the default, because
# Nx reads every file it names as changed in full. A lockfile then touches
# every project, defeating `projectsAffectedByDependencyUpdates: "auto"`, and a
# release commit's one-line `package.json` version bump affected 47 projects
# instead of 3. Only `--base`/`--head` let Nx diff those files field by field,
# so any change set with nothing to drop goes through them unchanged.
#
# Conformetry templates need the opposite treatment. `.nxignore` hides
# `configuration/conformetry-templates` from Nx, because a template holds a
# `project.json` that Nx would register as a project, so a template edit marks
# no project affected and every cached `conformetry-validate` looks current.
# With `INCLUDE_TEMPLATES` set, a changed template adds
# `configuration/conformetry.config.ts` to the change set, which every
# instance project already lists as an input, so they are all selected. Only
# the target that runs `conformetry-validate` should set it: Nx decides affected
# per project, so every other target would run the whole workspace too.
#
# The changed-files list is built the way Nx builds its own: the merge base of
# the two revisions, falling back to `NX_BASE` itself, then
# `git diff --name-only --no-renames --relative`. An empty list affects nothing
# and exits cleanly; it never falls back to everything.
#
# Inputs, all from the environment:
#   TARGET            the Nx target to run (required)
#   ARGUMENTS         extra `nx affected` flags, space separated
#   INCLUDE_SPELLING  "true" to keep spelling files
#   INCLUDE_TEMPLATES "true" to select every conformetry instance project when
#                     a template changes
#   NX_BASE, NX_HEAD  the revisions, as `nrwl/nx-set-shas` exports them
#   SPELLING_PATHS    an extended regex overriding which files are spelling
#   TEMPLATE_PATHS    an extended regex overriding which files are templates

set -euo pipefail

if [[ -z "${TARGET:-}" ]]; then
  echo "❌ TARGET is unset; name the Nx target to run"
  exit 1
fi

if [[ -z "${NX_BASE:-}" || -z "${NX_HEAD:-}" ]]; then
  echo "❌ NX_BASE and NX_HEAD are unset; run setup-codebase first"
  exit 1
fi

default_spelling_paths='^configuration/\.cspell/|(^|/)cspell\.config\.yaml$'
spelling_paths="${SPELLING_PATHS:-${default_spelling_paths}}"

arguments=()
read -ra arguments <<<"${ARGUMENTS:-}"

template_paths="${TEMPLATE_PATHS:-^configuration/conformetry-templates/}"
template_selector="configuration/conformetry.config.ts"

changed=""
spelling=""
templates=""
if [[ "${INCLUDE_SPELLING:-false}" != "true" ||
  "${INCLUDE_TEMPLATES:-false}" == "true" ]]; then
  base="$(git merge-base "${NX_BASE}" "${NX_HEAD}" || echo "${NX_BASE}")"
  changed="$(git diff --name-only --no-renames --relative \
    "${base}" "${NX_HEAD}")"
fi

if [[ "${INCLUDE_SPELLING:-false}" != "true" ]]; then
  spelling="$(grep -E "${spelling_paths}" <<<"${changed}" || true)"
fi

if [[ "${INCLUDE_TEMPLATES:-false}" == "true" ]]; then
  templates="$(grep -E "${template_paths}" <<<"${changed}" || true)"
fi

if [[ -z "${spelling}" && -z "${templates}" ]]; then
  exec pnpm exec nx affected --base="${NX_BASE}" --head="${NX_HEAD}" \
    --target="${TARGET}" ${arguments[@]+"${arguments[@]}"}
fi

if [[ -n "${spelling}" ]]; then
  echo "✂️ Not affecting ${TARGET} with spelling files:"
  while IFS= read -r spelling_path; do
    printf '  %s\n' "${spelling_path}"
  done <<<"${spelling}"
fi

kept="${changed}"
if [[ -n "${spelling}" ]]; then
  kept="$(grep -Ev "${spelling_paths}" <<<"${changed}" || true)"
fi

if [[ -n "${templates}" ]]; then
  echo "🧬 Selecting every conformetry instance for ${TARGET}, templates changed:"
  while IFS= read -r template_path; do
    printf '  %s\n' "${template_path}"
  done <<<"${templates}"
  kept="$(printf '%s\n%s' "${kept}" "${template_selector}")"
fi

printf '%s\n' "${kept}" \
  | pnpm exec nx affected --stdin --target="${TARGET}" \
    ${arguments[@]+"${arguments[@]}"}

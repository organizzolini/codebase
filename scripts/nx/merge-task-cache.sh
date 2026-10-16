#!/usr/bin/env bash
# Merges another run's Nx task cache into this one, so tasks that run already
# finished are hits here too.
#
# The source is a directory holding the other run's `cache/` and
# `workspace-data/`, as `.nx` lays them out. Entries this cache already has win,
# and the merge is skipped, never failed, when the source cannot be read: the
# caller would rather run cold than stop.
#
# Order matters. Nx decides a hit from a database row alone, so a row without
# its files restores nothing and still reports a hit. The outputs are copied
# first and the rows second; a failure between them leaves files with no row,
# an ordinary miss.
#
# Usage: merge-task-cache.sh <source-directory>

set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/task-database.sh"

source_directory="${1:?usage: merge-task-cache.sh <source-directory>}"

skip() {
  echo "::warning::Not merging the Nx cache from ${source_directory}: $1"
  exit 0
}

if [[ ! -d "${source_directory}/cache" ]]; then
  skip "it has no cache directory"
fi

source_databases=()
for datastore in "${source_directory}"/workspace-data/*.db; do
  if [[ -e "${datastore}" ]]; then
    source_databases+=("${datastore}")
  fi
done
if ((${#source_databases[@]} == 0)); then
  skip "it has no task database"
fi
incoming="$(newest_task_database "${source_databases[@]}")"

if [[ "$(sqlite3 "${incoming}" 'PRAGMA integrity_check;' 2>&1 || true)" != "ok" ]]; then
  skip "its task database is corrupt"
fi

tables="$(sqlite3 "${incoming}" '.tables' 2>&1 || true)"
if [[ "${tables}" != *cache_outputs* || "${tables}" != *task_details* ]]; then
  skip "its task database has an unfamiliar schema"
fi

mkdir -p "$(task_cache_directory)" "$(task_database_directory)"

existing=()
while IFS= read -r datastore; do
  existing+=("${datastore}")
done < <(list_task_databases)

if ((${#existing[@]} == 0)); then
  cp -R "${source_directory}/cache/." "$(task_cache_directory)/"
  cp "${incoming}" "$(task_database_directory)/${incoming##*/}"
  echo "🧩 Adopted the Nx cache from ${source_directory}: nothing to merge into"
  exit 0
fi

target="$(newest_task_database "${existing[@]}")"
if [[ "${target##*-v}" != "${incoming##*-v}" ]]; then
  skip "its schema (${incoming##*-v}) differs from this cache's (${target##*-v})"
fi

before="$(sqlite3 "${target}" 'SELECT count(*) FROM cache_outputs;')"

# Not `cp -n`: it exits non-zero when it skips a file that exists, which `set -e`
# would turn into a silent abort on a second merge.
cache_directory="$(task_cache_directory)"
while IFS= read -r -d '' entry; do
  relative="${entry#"${source_directory}"/cache/}"
  if [[ ! -e "${cache_directory}/${relative}" ]]; then
    mkdir -p "$(dirname "${cache_directory}/${relative}")"
    cp -p "${entry}" "${cache_directory}/${relative}"
  fi
done < <(find "${source_directory}/cache" -type f -print0)

sqlite3 "${target}" <<SQL
ATTACH '${incoming}' AS incoming;
BEGIN;
INSERT OR IGNORE INTO task_details (hash, project, target, configuration)
  SELECT hash, project, target, configuration FROM incoming.task_details;
INSERT OR IGNORE INTO cache_outputs (hash, code, size, created_at, accessed_at)
  SELECT hash, code, size, created_at, accessed_at FROM incoming.cache_outputs;
COMMIT;
SQL

after="$(sqlite3 "${target}" 'SELECT count(*) FROM cache_outputs;')"
echo "🧩 Merged $((after - before)) task results into the Nx cache (${before} before)"

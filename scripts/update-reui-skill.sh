#!/bin/bash

# Refresh the vendored ReUI skill from the bundle reui.io serves.
#
# Every other vendored skill moves with `skills update`, which re-fetches each
# lockfile entry from its GitHub source. ReUI publishes its skill only as a JSON
# bundle, so it is locked as `sourceType: "local"`, which `skills update` skips on
# purpose. This script is that missing step: the weekly upgrade-dependencies
# workflow runs it right after `skills update`.
#
# Three properties matter:
#
#   - Idempotent. The bundle is hashed the way the skills CLI hashes a skill
#     folder, and nothing is written when that equals both the pin in
#     skills-lock.json and the folder on disk, so local drift is healed too.
#   - Safe to extract. A bundle path that resolves outside the skill folder aborts
#     the run before anything is deleted or written.
#   - Non-fatal. An outage prints the retry command and exits 0, because a stale
#     skill is agent context rather than a broken build.
#
# The skill's name is already in skills-lock.json, so the exclusion lists need no
# regeneration when its content moves.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)" || exit 0
cd "${ROOT}" || exit 0

RETRY_HINT="💡 Retry with 'pnpm exec nx run codebase:update-reui-skill'"

if [[ ! -f "skills-lock.json" ]]; then
  exit 0
fi

REUI_SKILL_URL="${REUI_SKILL_URL:-https://mcp.reui.io/api/skills/download}" \
  node - "${RETRY_HINT}" <<'JS'
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const [retryHint] = process.argv.slice(2);
const SKILL_DIRECTORY = path.resolve(".agents/skills/reui");
const LOCKFILE = "skills-lock.json";

/** The skills CLI's folder hash: sorted relative paths, each followed by its bytes. */
function hashFiles(files) {
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));
  const hash = crypto.createHash("sha256");
  for (const file of sorted) {
    hash.update(file.path);
    hash.update(file.content);
  }
  return Array.from(hash.digest(), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/** The files now in the skill folder, in the shape the bundle uses. */
function readInstalledFiles() {
  const files = [];
  const walk = (directory) => {
    if (!fs.existsSync(directory)) return;
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, item.name);
      if (item.isDirectory()) walk(full);
      else {
        files.push({
          content: fs.readFileSync(full),
          path: path.relative(SKILL_DIRECTORY, full).split(path.sep).join("/"),
        });
      }
    }
  };
  walk(SKILL_DIRECTORY);
  return files;
}

async function main() {
  const response = await fetch(process.env.REUI_SKILL_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const bundle = await response.json();
  if (!Array.isArray(bundle.files) || bundle.files.length === 0) {
    throw new Error("the bundle holds no files");
  }

  const files = bundle.files.map((file) => ({
    content: Buffer.from(file.content),
    path: file.path,
  }));
  const escaping = files.find(
    (file) =>
      !path
        .resolve(SKILL_DIRECTORY, file.path)
        .startsWith(SKILL_DIRECTORY + path.sep),
  );
  if (escaping) {
    throw new Error(`"${escaping.path}" resolves outside ${SKILL_DIRECTORY}`);
  }
  if (!files.some((file) => file.path === "SKILL.md")) {
    throw new Error("the bundle has no SKILL.md");
  }

  const lock = JSON.parse(fs.readFileSync(LOCKFILE, "utf8"));
  const entry = lock.skills?.reui;
  if (!entry) throw new Error(`${LOCKFILE} has no reui entry`);

  const computedHash = hashFiles(files);
  if (
    entry.computedHash === computedHash &&
    hashFiles(readInstalledFiles()) === computedHash
  ) {
    console.log(`🤹 The reui skill is current (version ${bundle.version})`);
    return;
  }

  fs.rmSync(SKILL_DIRECTORY, { force: true, recursive: true });
  for (const file of files) {
    const target = path.resolve(SKILL_DIRECTORY, file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.content);
  }
  entry.computedHash = computedHash;
  fs.writeFileSync(LOCKFILE, JSON.stringify(lock, null, 2) + "\n");
  console.log(
    `🤹 Updated the reui skill to version ${bundle.version} (${files.length} files)`,
  );
}

main().catch((error) => {
  console.error(`⚠️  The reui skill was not updated: ${error.message}`);
  console.error(retryHint);
});
JS

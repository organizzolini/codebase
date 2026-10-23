import type { UpgradeStep } from "./upgrade-dependencies.types";

// ♟️ Constants

/** The shell options a step's script runs under: stop at the first failure. */
export const SCRIPT_OPTIONS = ["-e", "-o", "pipefail", "-c"] as const;

/** How many of a failed step's last lines the pull request quotes. */
export const TAIL_LINES = 20;

/** The most characters of them it quotes, so one runaway line cannot flood it. */
export const TAIL_CHARACTERS = 2000;

/** The file, in the OS temp directory, the pull request body is written to. */
export const PULL_REQUEST_BODY_FILE = "pull-request-body.md";

/** The workflow that runs this command, linked from the pull request body. */
export const WORKFLOW_URL =
  "https://github.com/organizzolini/codebase/actions/workflows/upgrade-dependencies.yml";

/** What each upgrade does, as the pull request lists them. */
export const UPGRADE_DETAILS = [
  "Update node to latest patch of current major",
  "Update pnpm to latest version",
  "Deduplicate the lockfile so in-range transitive upgrades land",
  "Update pnpm lockfile",
  "Update Python to latest stable 3.x when every dependency supports it",
  "Update Python dependencies across all projects",
  "Update vendored skills from their upstream sources",
  "Update the Impeccable skill bundle to the latest release",
] as const;

/** Printed when skipped steps are all the run has to show for itself. */
export const NOTHING_SHIPPED_MESSAGE =
  "Upgrade steps were skipped and nothing else changed, so there is no pull request to report them in.";

/**
 * The upgrades, in the order they run. A step that fails is undone and
 * reported, and the next one still runs: one broken upgrade must not stop the
 * others, as the Python bump once stopped the skills.
 *
 * Scripts avoid the `${` of a template literal, which JavaScript would read as
 * its own substitution.
 */
export const UPGRADE_STEPS: readonly UpgradeStep[] = [
  {
    // Worth keeping only if pnpm can switch to it, which its
    // minimumReleaseAge refuses for a release under a day old.
    label: "Upgrade pnpm",
    script: String.raw`
version=$(pnpm view pnpm version)
test -n "$version"
jq --arg v "pnpm@$version" '.packageManager = $v' package.json > package.json.temporary
mv package.json.temporary package.json
pnpm --version
`,
  },
  {
    label: "Upgrade node",
    script: String.raw`
test -n "$LATEST_NODE" || { echo "LATEST_NODE is not set, and nothing in this repository sets it." >&2; exit 1; }
jq --arg v ">=$LATEST_NODE" '.engines.node = $v' package.json > package.json.temporary
mv package.json.temporary package.json
`,
  },
  {
    // The bump moves every Python version setting, upper bound included, to
    // the newest stable release, then `uv sync` proves the lockfile installs
    // on it, since a lock alone would not catch a dependency with no wheel
    // (ormsgpack, #1491). The template must stay identical to the application.
    label: "Upgrade Python",
    recover: "uv sync --frozen --quiet --project configuration",
    script: String.raw`
uv python install 3 --upgrade
LATEST_PYTHON=$(uv run --no-project --python 3 python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PYTHON_VER=$(echo "$LATEST_PYTHON" | tr -d '.')
NEXT_PYTHON="3.$(( $(echo "$LATEST_PYTHON" | cut -d. -f2) + 1 ))"
for file in \
  projects/affirmancy/pyproject.toml \
  "configuration/conformetry-templates/jupyter-notebook-application/{{nameKebabCase}}/pyproject.toml"
do
  sed -i "s/^requires-python = .*/requires-python = \">=$LATEST_PYTHON,<$NEXT_PYTHON\"/" "$file"
done
sed -i "s/target-version = \"py[0-9][0-9]*/target-version = \"py$PYTHON_VER/" configuration/pyproject.toml
sed -i "s/pythonVersion = \"3\.[0-9][0-9]*/pythonVersion = \"$LATEST_PYTHON/" configuration/pyproject.toml
uv lock --project configuration
uv sync --frozen --quiet --project configuration
`,
  },
  {
    // Per-package npm and GitHub Actions bumps come from Dependabot as their
    // own pull requests. This only dedupes, which reaches the transitive
    // dependencies those cannot: a package satisfying its parents' ranges
    // stays pinned even as they move. `nx show projects` proves the dedupe did
    // not break Nx, while the diff is still on disk and not inside the husky
    // pre-commit hook of the commit that opens the pull request.
    label: "Deduplicate lockfile",
    script: String.raw`
pnpm dedupe
pnpm exec nx show projects
`,
  },
  {
    // One lockfile covers every uv workspace member.
    label: "Upgrade Python dependencies",
    script: "uv lock --upgrade --project configuration",
  },
  {
    // The skills CLI falls back to installing for every agent when none is
    // detected and --yes is passed. For 'eve' that creates an untracked agent/
    // folder the project-structure lint rejects, so it is removed. ReUI serves
    // its skill as a JSON bundle, which `skills update` skips, so the
    // installation project's command re-fetches and re-pins it.
    label: "Upgrade skills",
    script: String.raw`
pnpm exec skills update --yes
rm -rf agent/
NODE_OPTIONS='' node --import @swc-node/register/esm-register installation/src/installation.main.ts update-reui-skill
`,
  },
  {
    label: "Upgrade Impeccable",
    script: "npx impeccable update",
  },
];

/** Printed when a failed step's files could not be put back. */
export const unrestoredMessage = (label: string, reason: string): string =>
  `${label} failed and could not be undone (${reason}); stopping so a half-applied change is not committed.`;

/** The workflow annotation that makes a skipped step show on the run page. */
export const skippedAnnotation = (label: string, exitCode: number): string =>
  `::warning title=${label} skipped::Exited ${String(exitCode)}; its changes were undone and the run carried on.`;

import type { Command } from "../process-runner/process-runner.types";
import type { UpgradeStep } from "./upgrade-dependencies.types";

// ♟️ Constants

/** How many of a failed step's last lines the pull request quotes. */
export const TAIL_LINES = 20;

/** The most characters of them it quotes, so one runaway line cannot flood it. */
export const TAIL_CHARACTERS = 2000;

/**
 * Git's empty tree. Naming it as the source of attributes makes a diff ignore
 * `.gitattributes`, whose `-diff` on the lockfile would count its changes as 0.
 */
export const EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

/** The file, in the OS temp directory, the pull request body is written to. */
export const PULL_REQUEST_BODY_FILE = "pull-request-body.md";

/** The workflow that runs this command, linked from the pull request body when no run id is known. */
export const WORKFLOW_URL =
  "https://github.com/organizzolini/codebase/actions/workflows/upgrade-dependencies.yml";

/** Where this repository's workflow runs live, to which a run id is appended. */
export const RUNS_URL =
  "https://github.com/organizzolini/codebase/actions/runs";

/** The most `⚠` lines the pull request quotes from one step. */
export const WARNING_LIMIT = 10;

/** The most characters it quotes of a warning or of a skipped step's reason. */
export const LINE_CHARACTERS = 160;

/**
 * Formats the files an upgrade wrote. The repository keeps vendored skills
 * formatted, so what upstream ships unformatted would otherwise be reformatted
 * by the commit hook, and the pull request would report changes that the
 * commit does not hold.
 */
const FORMAT_UPGRADED_FILES: Command = [
  "pnpm",
  "exec",
  "nx",
  "run",
  "configuration:oxfmt:write",
];

/** Printed when skipped steps are all the run has to show for itself. */
export const NOTHING_SHIPPED_MESSAGE =
  "Upgrade steps were skipped and nothing else changed, so there is no pull request to report them in.";

/**
 * The upgrades, in the order they run. A step that fails is undone and
 * reported, and the next one still runs: one broken upgrade must not stop the
 * others, as the Python bump once stopped the skills.
 *
 * Those with logic of their own are tasks, each carried out by a service.
 * The rest are commands, run in order until one fails.
 */
export const UPGRADE_STEPS: readonly UpgradeStep[] = [
  { label: "Upgrade pnpm", task: "pnpm" },
  { label: "Upgrade node", task: "node" },
  {
    label: "Upgrade Python",
    // The environment is rebuilt from the lock the step left unchanged.
    recover: [
      ["uv", "sync", "--frozen", "--quiet", "--project", "configuration"],
    ],
    task: "python",
  },
  {
    // Per-package npm and GitHub Actions bumps come from Dependabot as their
    // own pull requests. This only dedupes, which reaches the transitive
    // dependencies those cannot: a package satisfying its parents' ranges
    // stays pinned even as they move. `nx show projects` proves the dedupe did
    // not break Nx, while the diff is still on disk and not inside the husky
    // pre-commit hook of the commit that opens the pull request.
    commands: [
      ["pnpm", "dedupe"],
      ["pnpm", "exec", "nx", "show", "projects"],
    ],
    label: "Deduplicate lockfile",
  },
  {
    // One lockfile covers every uv workspace member.
    commands: [["uv", "lock", "--upgrade", "--project", "configuration"]],
    label: "Upgrade Python dependencies",
  },
  {
    // The skills CLI falls back to installing for every agent when none is
    // detected and --yes is passed. For 'eve' that creates an untracked agent/
    // folder the project-structure lint rejects, so it is removed. ReUI serves
    // its skill as a JSON bundle, which `skills update` skips, so the
    // installation project's command re-fetches and re-pins it.
    commands: [
      ["pnpm", "exec", "skills", "update", "--yes"],
      ["rm", "-rf", "agent/"],
      [
        "node",
        "--import",
        "@swc-node/register/esm-register",
        "installation/src/installation.main.ts",
        "update-reui-skill",
      ],
      FORMAT_UPGRADED_FILES,
    ],
    label: "Upgrade skills",
  },
  {
    commands: [["npx", "impeccable", "update"], FORMAT_UPGRADED_FILES],
    label: "Upgrade Impeccable",
  },
];

/** Printed when a failed step's files could not be put back. */
export const unrestoredMessage = (label: string, reason: string): string =>
  `${label} failed and could not be undone (${reason}); stopping so a half-applied change is not committed.`;

/** The workflow annotation that makes a skipped step show on the run page. */
export const skippedAnnotation = (label: string, exitCode: number): string =>
  `::warning title=${label} skipped::Exited ${String(exitCode)}; its changes were undone and the run carried on.`;

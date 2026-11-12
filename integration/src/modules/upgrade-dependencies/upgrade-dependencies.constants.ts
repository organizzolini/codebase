import type { Command } from "../process-runner/process-runner.types";
import type { UpgradeStep } from "./upgrade-dependencies.types";

// ♟️ Constants

/** How many of a failed step's last lines the pull request quotes. */
export const TAIL_LINES = 20;

/** Most characters quoted, so one runaway line cannot flood it. */
export const TAIL_CHARACTERS = 2000;

/** Git's empty tree, as attributes source, so `-diff` ignores lockfiles. */
export const EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

/** OS temp file the pull request body is written to. */
export const PULL_REQUEST_BODY_FILE = "pull-request-body.md";

/** This command's workflow, linked when no run id is known. */
export const WORKFLOW_URL =
  "https://github.com/organizzolini/codebase/actions/workflows/upgrade-dependencies.yml";

/** Where workflow runs live; a run id is appended. */
export const RUNS_URL =
  "https://github.com/organizzolini/codebase/actions/runs";

/** The most `⚠` lines the pull request quotes from one step. */
export const WARNING_LIMIT = 10;

/** Most characters quoted from a warning or skipped step's reason. */
export const LINE_CHARACTERS = 160;

/** Formats upgrades, so the commit hook does not reformat them. */
const FORMAT_UPGRADED_FILES: Command = [
  "pnpm",
  "exec",
  "nx",
  "run",
  "configuration:oxfmt:write",
];

/** Printed when skipped steps are all the run shows. */
export const NOTHING_SHIPPED_MESSAGE =
  "Upgrade steps were skipped and nothing else changed, so there is no pull request to report them in.";

/** Upgrades. A failed step is undone; the rest still run. */
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
    // Per-package npm and GitHub Actions bumps come from Dependabot. This
    // dedupes the transitive dependencies Dependabot cannot reach. `nx show
    // projects` proves the dedupe did not break Nx, before the diff is
    // committed through the pre-commit hook.
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
    // The skills CLI installs for every agent when none is detected and --yes
    // is passed, leaving an untracked agent/ folder that lint rejects, so it is
    // removed. ReUI serves its skill as a JSON bundle that `skills update`
    // skips, so the installation project re-fetches it.
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
    // Impeccable writes a hooks manifest for every harness it detects. Codex is
    // not one this project uses, and its `.codex/` folder is rejected by the
    // project-structure lint, so it is removed.
    commands: [
      ["npx", "impeccable", "update"],
      ["rm", "-rf", ".codex/"],
      FORMAT_UPGRADED_FILES,
    ],
    label: "Upgrade Impeccable",
  },
];

/** Printed when a failed step's files could not be put back. */
export const unrestoredMessage = (label: string, reason: string): string =>
  `${label} failed and could not be undone (${reason}); stopping so a half-applied change is not committed.`;

/** Annotation that shows a skipped step on the run page. */
export const skippedAnnotation = (label: string, exitCode: number): string =>
  `::warning title=${label} skipped::Exited ${String(exitCode)}; its changes were undone and the run carried on.`;

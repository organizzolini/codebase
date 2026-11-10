/**
 * Lint-staged configuration — runs checks on staged files during pre-commit.
 *
 * Each key is a glob pattern matching staged files, and its handler returns
 * an array of commands to run. Uses `nx affected` to scope checks to the
 * projects that own the changed files, plus codebase-level checks.
 *
 * Invoked by Husky's pre-commit hook via `npx lint-staged`.
 */
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

/**
 * Tasks per `nx affected` run. Kept low after an out-of-memory kill; CI uses 8
 * because the release commit's hook checks every bumped package.
 */
const ANALYSIS_PARALLELISM = process.env["CI"] ? 8 : getLocalParallelism();

/**
 * Concurrent task slots: two fewer than the CPU count, within 4 to 6. Each gets 3 GB.
 */
function getLocalParallelism(): number {
  const byCpu = os.availableParallelism() - 2;
  const byMemory = Math.floor(os.totalmem() / 3 / 1024 ** 3);
  return Math.max(4, Math.min(byCpu, byMemory, 6));
}

/**
 * Targets every commit runs, locally and in CI, including a check-only glossary pass. Other gates run in CI and `validate-code`.
 */
const ANALYSIS_TARGETS = "typecheck,oxlint,oxfmt,coinagerie-check";

/**
 * Renders staged paths as one `--files=` flag each. One comma-separated value would
 * outgrow Node 26's 1011-byte argument limit.
 */
function getStagedFilesFlags(files: string[]): string {
  return files
    .map((file) => `--files=${path.relative(process.cwd(), file)}`)
    .join(" ");
}

/**
 * Hands `nx affected` the staged changes as two revisions, selecting projects as CI does.
 * With no HEAD yet, falls back to `--files`.
 */
function getStagedRevisionFlags(files: string[]): string {
  try {
    const tree = runGit(["write-tree"]);
    const head = runGit([
      "commit-tree",
      tree,
      "-p",
      "HEAD",
      "--no-gpg-sign",
      "-m",
      "lint-staged: staged changes",
    ]);
    return `--base=HEAD --head=${head}`;
  } catch {
    return getStagedFilesFlags(files);
  }
}

/**
 * Runs one git command and returns its trimmed stdout. Stderr is captured, so a
 * missing `HEAD` prints nothing.
 */
function runGit(gitArguments: string[]): string {
  return execFileSync("git", gitArguments, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

/**
 * Flags every conformetry instance when a template is staged, else `undefined`.
 * `.nxignore` hides templates from Nx, so this flags the instances directly.
 */
function getStagedTemplateFlags(files: string[]): string | undefined {
  const stagedTemplates = files.some((file) =>
    path
      .relative(process.cwd(), file)
      .startsWith("configuration/conformetry-templates/"),
  );

  return stagedTemplates
    ? `${getStagedFilesFlags(files)} --files=configuration/conformetry.config.ts`
    : undefined;
}

/**
 * Hands `nx affected` the staged changes: template flags when a template is staged,
 * otherwise two revisions.
 */
function getStagedChangeFlags(files: string[]): string {
  return getStagedTemplateFlags(files) ?? getStagedRevisionFlags(files);
}

const config = {
  // 🔒 Lockfile integrity
  // Runs as the `validation` CLI, not its Nx target, which would cost another graph build.
  // No environment prefix: lint-staged spawns commands without a shell.
  //
  // It checks that the resolution still holds with `pnpm install --frozen-lockfile
  // --lockfile-only`, which no Nx target models. It never writes node_modules.
  "{**/package.json,pnpm-workspace.yaml}": (): string[] => [
    "node --import @swc-node/register/esm-register validation/src/validation.main.ts lockfile",
  ],

  // 📦 Manifest consistency
  // A manifest under a project makes only that project affected, but syncpack
  // and sherif compare every manifest against every other, so
  // `configuration`, which owns those two, has to run whether or not
  // `affected` selected it.
  "**/package.json": (): string[] => [
    "nx run-many --projects=validation --targets=catalog-manifests --outputStyle=static",
    "nx run-many --projects=configuration --targets=sherif,syncpack --outputStyle=static",
  ],

  // 🔬 Static analysis and conformetry validation
  // One `nx affected` run over the staged changes, on the same `lint-code`
  // target the Lint Codebase workflow runs and selecting projects the same
  // way it does, so what passes here passes there.

  // This replaces a per-path table mapping each changed file to its target. Nx already maps
  // files to targets: each leaf lists the config files it reads in its `inputs`. Doing it by
  // hand duplicated that, and every entry cost another project graph build.

  // Conformetry is scoped like the rest: a project needs validating when its own
  // files, the conformetry configuration, or a conformetry template change. The
  // template case is the one `nx affected` cannot always see, so
  // `getStagedChangeFlags` covers it.

  // Each derivation synchronization is named alongside `lint-code`, not reached through
  // `dependsOn`: it also publishes on the default branch, and an explicit configuration
  // forwarded down `dependsOn` would let `lint-code --configuration=write` publish from a branch.

  // `callidescope-restrict` and `codependix-bound` are reached through `guard-code`'s
  // `dependsOn`, not named here: each is inferred per project, and `nx affected` scopes it
  // to the projects a commit touched. `configuration:codependix` is write-only. The
  // glossary check is in `ANALYSIS_TARGETS`: it writes nothing, so `validate-code` repairs.

  // There is no aggregate `synchronize` target to name instead: each
  // synchronization is its own Nx target on the `synchronization` project, run
  // directly the way `configuration:codometer` and `configuration:callidescope` are —
  // named by whichever caller wants it rather than through a shared process
  // that loops over all of them.

  // `nx sync:check` no longer runs anywhere: the generator plugin it checked is emitted
  // on install rather than committed, so no commit can stage it out of date. Every
  // conformetry command re-checks the emitted plugin itself. See
  // configuration/.husky/pre-commit for the retirement note.
  "*": (files: string[]): string[] => [
    `nx affected --target=${ANALYSIS_TARGETS} --configuration=check --parallel=${String(ANALYSIS_PARALLELISM)} --outputStyle=static ${getStagedChangeFlags(files)}`,
  ],
};

export default config;

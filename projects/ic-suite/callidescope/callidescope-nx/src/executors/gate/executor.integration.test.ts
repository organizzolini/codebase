import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { MARKDOWN_DEEP_STACKS_HEADING } from "@callidescope/output";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { captureOutput, useTemporaryDirectory } from "@codebase/testing";

import {
  EMPTY_TRACE_REPORT,
  reportUnreadProjects,
} from "../../modules/plugin/plugin.constants";
import { ProjectsService } from "../../modules/projects/projects.service";

import gateExecutor from "./executor";

import type { GateExecutorOptions } from "./executor.types";
import type { CapturedOutput } from "@codebase/testing";
import type { ExecutorContext, ProjectGraph } from "@nx/devkit";

/**
 * Nx names, deliberately unlike the roots below. A gate handed Nx names owns no finding
 * and passes anything, so the fixture forces them apart.
 */
const BREACHING_PROJECT_NAME = "the-project-that-breaches";
const DEPENDENT_PROJECT_NAME = "the-project-that-depends";
const UNREAD_PROJECT_NAME = "the-project-that-reads-nothing";

/** Workspace-relative roots — what callidescope calls a project name. */
const BREACHING_PROJECT_ROOT = "packages/breaching";
const DEPENDENT_PROJECT_ROOT = "packages/dependent";
const UNREAD_PROJECT_ROOT = "packages/unread";

/** The callable whose stack breaches the breaching project's own limit. */
const BREACHING_ENTRY_POINT = "readBreachingEntryPoint";

/**
 * Filename for the workspace and breaching project limits. JSON, since a TypeScript config
 * would import its type and add an Nx dependency edge.
 */
const CONFIGURATION_FILE_NAME = "callidescope.config.json";

/** The name a project declares itself through, which must spell `undefined`. */
const PROJECT_CONFIGURATION_FILE_NAME = "callidescope.config.js";

/** A three-frame stack, against a project limit of two. */
const BREACHING_SOURCE = [
  "export function readBreachingEntryPoint(): string {",
  "  return buildBreachingMiddle();",
  "}",
  "",
  "function buildBreachingMiddle(): string {",
  "  return readBreachingLeaf();",
  "}",
  "",
  "function readBreachingLeaf(): string {",
  '  return "over its own limit";',
  "}",
  "",
].join("\n");

/** A one-frame stack, against the workspace limit this fixture never nears. */
const DEPENDENT_SOURCE = [
  "export function readDependentEntryPoint(): string {",
  '  return "within its own limit";',
  "}",
  "",
].join("\n");

const PROJECT_PROGRAM = {
  compilerOptions: {
    module: "esnext",
    moduleResolution: "bundler",
    noEmit: true,
    strict: true,
    target: "esnext",
  },
  include: ["src/**/*.ts"],
};

/**
 * An executor context for one project of the fixture workspace. Built literally, not mocked,
 * because `createMock` fabricates every property it is not handed.
 */
function buildContext(args: {
  projectName: string;
  workspaceRoot: string;
}): ExecutorContext {
  return {
    cwd: args.workspaceRoot,
    isVerbose: false,
    nxJsonConfiguration: {},
    projectGraph: { dependencies: {}, nodes: {} },
    projectName: args.projectName,
    projectsConfigurations: { projects: {}, version: 2 },
    root: args.workspaceRoot,
  };
}

/**
 * Gate options every case starts from. The configuration path is named, not searched for,
 * since a search would find this repository's configuration.
 */
function buildOptions(args: { workspaceRoot: string }): GateExecutorOptions {
  return {
    configuration: path.join(args.workspaceRoot, CONFIGURATION_FILE_NAME),
  };
}

/**
 * The Nx graph the run resolves scope from, built here since a fixture is in no real graph.
 * Downstream code is real.
 */
function buildProjectGraph(): ProjectGraph {
  return {
    dependencies: {
      [BREACHING_PROJECT_NAME]: [],
      [DEPENDENT_PROJECT_NAME]: [
        {
          source: DEPENDENT_PROJECT_NAME,
          target: BREACHING_PROJECT_NAME,
          type: "static",
        },
      ],
      // The dependency is what makes the unread case reachable: it keeps the
      // run itself non-empty while this project's own sources are all gone.
      [UNREAD_PROJECT_NAME]: [
        {
          source: UNREAD_PROJECT_NAME,
          target: BREACHING_PROJECT_NAME,
          type: "static",
        },
      ],
    },
    nodes: {
      [BREACHING_PROJECT_NAME]: {
        data: { root: BREACHING_PROJECT_ROOT, tags: ["type:package"] },
        name: BREACHING_PROJECT_NAME,
        type: "lib",
      },
      [DEPENDENT_PROJECT_NAME]: {
        data: { root: DEPENDENT_PROJECT_ROOT, tags: ["type:package"] },
        name: DEPENDENT_PROJECT_NAME,
        type: "lib",
      },
      [UNREAD_PROJECT_NAME]: {
        data: { root: UNREAD_PROJECT_ROOT, tags: ["type:package"] },
        name: UNREAD_PROJECT_NAME,
        type: "lib",
      },
    },
  };
}

/**
 * Reads the depth finding count from a printed report. Asserts which findings a verdict owned;
 * the heading comes from `callidescope-output`'s exported constant.
 */
function readDeepStackCount(report: string): number {
  const matched = new RegExp(
    String.raw`## ${MARKDOWN_DEEP_STACKS_HEADING} \((\d+)\)`,
  ).exec(report);

  return matched?.[1] === undefined ? -1 : Number(matched[1]);
}

/** Writes one fixture project: a program, a manifest, and some source. */
function writeProject(args: {
  configuration?:
    | undefined
    | { exclude?: string[]; limits?: { maximumDepth: number } };
  projectRoot: string;
  source: string;
  workspaceRoot: string;
}): void {
  const projectDirectory = path.join(args.workspaceRoot, args.projectRoot);
  mkdirSync(path.join(projectDirectory, "src"), { recursive: true });
  writeFileSync(
    path.join(projectDirectory, "tsconfig.json"),
    JSON.stringify(PROJECT_PROGRAM),
  );
  writeFileSync(
    path.join(projectDirectory, "package.json"),
    JSON.stringify({ name: path.basename(args.projectRoot), version: "0.0.0" }),
  );
  writeFileSync(path.join(projectDirectory, "src", "index.ts"), args.source);

  // Every traced project declares a complete configuration or the run refuses
  // to start, so a fixture project that overrides nothing still writes one.
  // JavaScript rather than JSON, because `undefined` is what says "no breadth
  // limit" and "no destination", and JSON cannot spell it.
  writeFileSync(
    path.join(projectDirectory, PROJECT_CONFIGURATION_FILE_NAME),
    `export default {
      entryPoints: {
        addresses: [],
        decorators: [],
        includeExportedFunctions: true,
        includeOrphans: true,
        includeTests: false,
      },
      exclude: ${JSON.stringify(args.configuration?.exclude ?? [])},
      limits: {
        maximumBreadth: undefined,
        maximumDepth: ${String(args.configuration?.limits?.maximumDepth ?? 99)},
      },
      write: { markdown: undefined, mermaid: undefined },
    };\n`,
  );
}

/**
 * The gate fires on the project that owns a breach, and only on that project.
 *
 * An integration test rather than a unit one because the bug this exists to
 * catch lived in the seam between two naming schemes, and a unit test writing
 * names on both sides of that seam cannot see it. Here the judged set comes out
 * of the real Nx resolution and the findings come out of a real trace of real
 * files on disk, so the two vocabularies have to agree for anything to fail.
 *
 * Both halves of the model are pinned, and each one is what fails when the
 * other half is broken:
 *
 * - A gate handed Nx project names matches no report, owns no finding, and
 *   passes whatever it read. Every project's gate in the workspace passed that
 *   way once, and a green all-projects sweep is exactly what that bug produces
 *   — which is why the sweep is not the check and this is.
 * - A gate judging the whole run's findings rather than its own fails the
 *   dependent for a breach in the dependency it merely measured.
 * - A gate asking whether the *run* read anything rather than whether the
 *   project it judges did passes a project whose own files were all excluded,
 *   on the strength of its dependencies' code.
 */
describe("the gate executor, against a workspace on disk", () => {
  let output: CapturedOutput;
  let workspaceRoot = "";

  // Resolved through symlinks: on macOS the temporary directory is a link into /private, and a
  // run rooted at the link makes every path a ../ climb that no project root contains. The
  // testing helper returns the real path.
  const getWorkspaceRoot = useTemporaryDirectory("callidescope-gate");

  beforeAll(() => {
    workspaceRoot = getWorkspaceRoot();
    // High enough that nothing in the fixture reaches it: the breach has to
    // come from the limit the breaching project declared for itself, or the
    // narrowing below proves nothing.
    writeFileSync(
      path.join(workspaceRoot, CONFIGURATION_FILE_NAME),
      JSON.stringify({ limits: { maximumDepth: 99 } }),
    );
    writeProject({
      configuration: { limits: { maximumDepth: 2 } },
      projectRoot: BREACHING_PROJECT_ROOT,
      source: BREACHING_SOURCE,
      workspaceRoot,
    });
    writeProject({
      projectRoot: DEPENDENT_PROJECT_ROOT,
      source: DEPENDENT_SOURCE,
      workspaceRoot,
    });
    // A project that excludes every file it holds — the over-matching
    // `exclude` a project's own configuration is free to write. It breaks no
    // limit, because nothing of it was read to break one with.
    writeProject({
      configuration: { exclude: ["**"] },
      projectRoot: UNREAD_PROJECT_ROOT,
      source: DEPENDENT_SOURCE,
      workspaceRoot,
    });
  });

  beforeEach(() => {
    vi.spyOn(ProjectsService.prototype, "readProjectGraph").mockResolvedValue(
      buildProjectGraph(),
    );
    output = captureOutput();
  });

  it(
    "fails the project that broke the limit it declared for itself",
    { timeout: 120_000 },
    async () => {
      expect.hasAssertions();

      const result = await gateExecutor(
        buildOptions({ workspaceRoot }),
        buildContext({
          projectName: BREACHING_PROJECT_NAME,
          workspaceRoot,
        }),
      );
      const report = output.stdout();

      expect(result).toStrictEqual({ success: false });
      expect(readDeepStackCount(report)).toBe(1);
      expect(report).toContain(BREACHING_ENTRY_POINT);
    },
  );

  it(
    "passes the dependent whose trace read that same breach",
    { timeout: 120_000 },
    async () => {
      expect.hasAssertions();

      const result = await gateExecutor(
        buildOptions({ workspaceRoot }),
        buildContext({
          projectName: DEPENDENT_PROJECT_NAME,
          workspaceRoot,
        }),
      );
      const report = output.stdout();

      expect(result).toStrictEqual({ success: true });
      expect(readDeepStackCount(report)).toBe(0);
      expect(report).not.toContain(BREACHING_ENTRY_POINT);
    },
  );

  it(
    "fails that same trace once the breaching project joins the judged set",
    { timeout: 120_000 },
    async () => {
      expect.hasAssertions();

      // The A/B for the case above, on one binary: identical directories
      // traced and identical limits resolved, differing only in which projects
      // the run was pointed at. A green dependent is therefore the narrowing,
      // not a trace that never read the breach.
      const result = await gateExecutor(
        {
          ...buildOptions({ workspaceRoot }),
          projects: [DEPENDENT_PROJECT_NAME, BREACHING_PROJECT_NAME],
        },
        buildContext({
          projectName: DEPENDENT_PROJECT_NAME,
          workspaceRoot,
        }),
      );
      const report = output.stdout();

      expect(result).toStrictEqual({ success: false });
      expect(readDeepStackCount(report)).toBe(1);
      expect(report).toContain(BREACHING_ENTRY_POINT);
    },
  );

  it(
    "fails a project whose own exclude left it nothing to be judged on",
    { timeout: 120_000 },
    async () => {
      expect.hasAssertions();

      const result = await gateExecutor(
        buildOptions({ workspaceRoot }),
        buildContext({
          projectName: UNREAD_PROJECT_NAME,
          workspaceRoot,
        }),
      );
      const report = output.stdout();

      expect(result).toStrictEqual({ success: false });
      // The exact rendering, so the project this gate never read is named back
      // rather than the reader being left to work out which one it was.
      expect(report.trim()).toBe(reportUnreadProjects([UNREAD_PROJECT_ROOT]));
      // And not the whole-run rule: this project's closure holds the breaching
      // project, so the run read three callables and the old question — did
      // the *run* read anything — answers yes. That is the door this closes.
      expect(report).not.toContain(EMPTY_TRACE_REPORT);
      expect(readDeepStackCount(report)).toBe(-1);
    },
  );
});

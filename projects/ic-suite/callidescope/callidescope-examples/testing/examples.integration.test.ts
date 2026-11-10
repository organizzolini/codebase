import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import {
  createTemporaryDirectory,
  useTemporaryDirectory,
} from "@codebase/testing";

import callidescopeConfiguration from "../callidescope.workspace.config.js";

import type {
  CallGraphResult,
  DeepStackFinding,
  ProjectReport,
} from "@callidescope/core";

// 🔭 Fixture expectations

/** Where this repository's root sits, relative to this file. */
const WORKSPACE_ROOT = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "..",
  "..",
);

/** The package whose fixtures every assertion below is about. */
const EXAMPLES_DIRECTORY =
  "projects/ic-suite/callidescope/callidescope-examples";

/** The one target name every guide's `## Run it` block is supposed to name. */
const AGGREGATE_TARGET_NAME = "examples";

/** The command every guide's `## Run it` block documents, composed from names so a rename fails every guide. */
const RUN_IT_COMMAND = `nx run ${readProjectDefinition().name}:${AGGREGATE_TARGET_NAME}`;

/** Every directory under `examples/`, whether or not it is a project. */
const EXAMPLE_NAMES = readdirSync(
  path.join(WORKSPACE_ROOT, EXAMPLES_DIRECTORY, "examples"),
  { withFileTypes: true },
)
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();

/** The nested project that carries its own limits, and breaches both. */
const GATED_LEAF_DIRECTORY = `${EXAMPLES_DIRECTORY}/examples/gated-leaf`;

/** Guides documenting runs beyond the aggregate target, named rather than discovered. Adding one is a deliberate act. */
const GUIDES_WITH_DOCUMENTED_RUNS = ["gated-leaf"];

/** Example directories holding their own `tsconfig.json`, read off disk so a new nested project cannot be missed. */
const NESTED_PROJECT_DIRECTORIES = readdirSync(
  path.join(WORKSPACE_ROOT, EXAMPLES_DIRECTORY, "examples"),
  { withFileTypes: true },
)
  .filter(
    (entry) =>
      entry.isDirectory() &&
      existsSync(
        path.join(
          WORKSPACE_ROOT,
          EXAMPLES_DIRECTORY,
          "examples",
          entry.name,
          "tsconfig.json",
        ),
      ),
  )
  .map((entry) => `${EXAMPLES_DIRECTORY}/examples/${entry.name}`)
  .toSorted();

/** As much of an Nx project definition as anything here reads. */
interface ProjectDefinition {
  name: string;
  targets: Record<
    string,
    { configurations?: Record<string, { command: string }> }
  >;
}

/** This package's own Nx project definition, read off disk. */
function readProjectDefinition(): ProjectDefinition {
  return JSON.parse(
    readFileSync(
      path.join(WORKSPACE_ROOT, EXAMPLES_DIRECTORY, "project.json"),
      "utf8",
    ),
  ) as ProjectDefinition;
}

/**
 * Reads `--directories` out of one `examples` target configuration, so the suite and the target trace one list.
 */
function readTargetDirectories(configuration: "check" | "write"): string {
  const command = String(
    readProjectDefinition().targets[AGGREGATE_TARGET_NAME]?.configurations?.[
      configuration
    ]?.command,
  ).split(" ");
  const value = command[command.indexOf("--directories") + 1];

  if (value === undefined) {
    throw new Error(`The examples ${configuration} command names no roots`);
  }

  return value;
}

/** The roots a run is pointed at, read from the `examples` target. Nested projects are reached only when named there. */
const STARTING_DIRECTORIES = readTargetDirectories("check");

/**
 * The `dependency-closure` stack, frame by frame, with the project each frame was declared in.
 */
function readClosureFrames(
  result: CallGraphResult,
): { displayName: string; project: string }[] {
  const stack = result.projects
    .flatMap((project) => project.stacks)
    .find(
      (candidate) =>
        candidate.frames[0]?.displayName ===
        "DependencyClosureService.allowsDepth",
    );

  return (stack?.frames ?? []).map((frame) => ({
    displayName: frame.displayName,
    project: readFileProject(result, frame.location.filePath),
  }));
}

/**
 * Every deep-stack finding one project answers for, by the project owning its root, not its path.
 */
function readDeepStacksFor(
  result: CallGraphResult,
  projectName: string,
): DeepStackFinding[] {
  return result.deepStacks.filter((stack) => {
    const filePath = stack.frames[0]?.location.filePath;

    return (
      filePath !== undefined &&
      readFileProject(result, filePath) === projectName
    );
  });
}

/**
 * Every command a guide documents beside the outcome it promises, read from the guide rather than restated here.
 */
function readDocumentedRuns(
  exampleName: string,
): { command: string; promised: string }[] {
  const guide = readGuide(exampleName);
  const commands = readFences(guide, "bash").filter(
    (command) => command !== RUN_IT_COMMAND,
  );
  const promises = readFences(guide, "text");

  return commands.map((command, index) => ({
    command,
    promised: promises[index] ?? "",
  }));
}

/**
 * Every fenced block of one language in a guide, in order, split on the opener.
 */
function readFences(guide: string, language: string): string[] {
  return guide
    .split(`\`\`\`${language}\n`)
    .slice(1)
    .map((rest) => rest.split("```")[0] ?? "")
    .map((block) => block.trimEnd());
}

/**
 * The project a frame's file belongs to, named the way the run names it. The longest match wins.
 */
function readFileProject(result: CallGraphResult, filePath: string): string {
  const owner = result.projects
    .map((project) => project.projectName)
    .filter((projectName) => filePath.startsWith(`${projectName}/`))
    .toSorted((first, second) => second.length - first.length)[0];

  if (owner === undefined) {
    throw new Error(`The run reported no project owning ${filePath}`);
  }

  return owner;
}

/** One example's guide, read whole. */
function readGuide(exampleName: string): string {
  return readFileSync(
    path.join(
      WORKSPACE_ROOT,
      EXAMPLES_DIRECTORY,
      "examples",
      exampleName,
      "README.md",
    ),
    "utf8",
  );
}

/**
 * What one example's `## Next` section links to: the first `## Next` section, not a generated block below it.
 */
function readNextLink(exampleName: string): string {
  const [, ...rest] = readGuide(exampleName).split("## Next");

  return (rest[0] ?? "").split("\n## ")[0] ?? "";
}

/**
 * This package's own slice of a run, so other packages' ordinary changes do not fail the counts.
 */
function readOwnReport(result: CallGraphResult): ProjectReport {
  return readProjectReport(result, EXAMPLES_DIRECTORY);
}

/** Reads one project's report, failing loudly when the run reached no such project. */
function readProjectReport(
  result: CallGraphResult,
  projectName: string,
): ProjectReport {
  const report = result.projects.find(
    (project) => project.projectName === projectName,
  );

  if (report === undefined) {
    throw new Error(`The run reported no project named ${projectName}`);
  }

  return report;
}

/**
 * The headline a documented outcome promises, without its JSON payload, which may legitimately move.
 */
function readPromisedHeadline(promised: string): string {
  const [firstLine = ""] = promised.split("\n");

  return (firstLine.split(" {")[0] ?? firstLine).trim();
}

/**
 * The examples in the order the package guide walks through them, read out of the guide rather than restated.
 */
function readReadingOrder(): string[] {
  const guide = readFileSync(
    path.join(WORKSPACE_ROOT, EXAMPLES_DIRECTORY, "README.md"),
    "utf8",
  );
  const walkthrough = guide
    .split("Read them in the order below for a walkthrough:")
    .at(-1)
    ?.split("\n\n")[0];

  return [...(walkthrough ?? "").matchAll(/\(examples\/([a-z0-9-]+)\/README/g)]
    .map((match) => match[1])
    .filter((exampleName) => exampleName !== undefined);
}

/**
 * The `## Run it` command one guide documents: its first `bash` fence. Empty when a guide documents nothing runnable.
 */
function readRunItCommand(exampleName: string): string {
  return readFences(readGuide(exampleName), "bash")[0] ?? "";
}

/**
 * Runs one documented command line and reports how it went. Strips comments and continuations,
 * so the argv is the one the guide prints.
 */
function runDocumented(command: string): { output: string; status: number } {
  const [, ...args] = command
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("#"))
    .join(" ")
    .replaceAll("\\", " ")
    .split(/\s+/)
    .filter((token) => token !== "");
  const result = spawnSync(process.execPath, args, {
    cwd: WORKSPACE_ROOT,
    encoding: "utf8",
  });

  return {
    output: `${result.stdout}${result.stderr}`,
    status: result.status ?? -1,
  };
}

/**
 * Traces the fixtures as the Nx target does, into a throwaway report.
 * Must not be named `callidescope.config.ts`.
 */
function traceFixtures(
  temporaryDirectory: string,
  overrides: {
    exclude?: readonly string[];
    limits?: Record<string, number>;
  } = {},
): CallGraphResult {
  const reportPath = path.join(temporaryDirectory, "report.json");
  const configurationPath = path.join(
    temporaryDirectory,
    "callidescope.config.json",
  );

  writeFileSync(
    configurationPath,
    JSON.stringify({
      ...callidescopeConfiguration,
      exclude: [
        ...(callidescopeConfiguration.exclude ?? []),
        ...(overrides.exclude ?? []),
      ],
      limits: { ...callidescopeConfiguration.limits, ...overrides.limits },
      write: { json: { path: reportPath } },
    }),
    "utf8",
  );

  execFileSync(
    process.execPath,
    [
      "--import",
      "@swc-node/register/esm-register",
      "projects/ic-suite/callidescope/callidescope-cli/src/callidescope-cli.main.ts",
      "callidescope",
      "--directories",
      STARTING_DIRECTORIES,
      "--config",
      configurationPath,
      "--write",
    ],
    { cwd: WORKSPACE_ROOT, stdio: "ignore" },
  );

  return JSON.parse(readFileSync(reportPath, "utf8")) as CallGraphResult;
}

describe("callidescope examples (integration)", () => {
  let result: CallGraphResult;

  const getTraceDirectory = useTemporaryDirectory("callidescope-examples");

  beforeAll(() => {
    result = traceFixtures(getTraceDirectory());
  });

  describe("the examples target names every root", () => {
    // The standard's completeness rule, applied to the one list this package
    // keeps in three places: a nested-project example added without being
    // named by the target is simply never traced, and its guide's generated
    // section never appears — with nothing failing to say so.
    it("names the same roots in check and in write", () => {
      expect(readTargetDirectories("write")).toBe(STARTING_DIRECTORIES);
    });

    it("names this package and every nested project under examples", () => {
      expect(STARTING_DIRECTORIES.split(",").toSorted()).toStrictEqual(
        [EXAMPLES_DIRECTORY, ...NESTED_PROJECT_DIRECTORIES].toSorted(),
      );
    });
  });

  describe("the examples are all documented", () => {
    // The half no assertion about a finding can catch: an example whose guide
    // is missing, or which nothing links to, is reachable only by listing the
    // directory. Every sibling `*-examples` package checks the same two things.
    const exampleNames = EXAMPLE_NAMES;

    it.each(exampleNames)("%s carries its own README.md", (exampleName) => {
      expect.hasAssertions();
      expect(
        existsSync(
          path.join(
            WORKSPACE_ROOT,
            EXAMPLES_DIRECTORY,
            "examples",
            exampleName,
            "README.md",
          ),
        ),
      ).toBe(true);
    });

    it.each(exampleNames)(
      "%s is linked from the package guide's reading order",
      (exampleName) => {
        expect.hasAssertions();

        const guide = readFileSync(
          path.join(WORKSPACE_ROOT, EXAMPLES_DIRECTORY, "README.md"),
          "utf8",
        );

        expect(guide).toContain(`(examples/${exampleName}/README.md)`);
      },
    );

    it("reads every example exactly once, in the order the guide gives", () => {
      // The reading order is this package's index, so an example missing from
      // it is an example nothing walks a reader to. Asserted against the
      // directory listing rather than against a list written here, which would
      // be the same omission one file further away.
      expect(readReadingOrder().toSorted()).toStrictEqual(exampleNames);
    });

    it("hands every example on to the one after it", () => {
      // Inserting into a reading order changes its neighbor, and a dangling or
      // skipped `## Next` is the defect nothing else here would catch: every
      // guide still exists, every guide is still linked, and the walkthrough
      // silently loops or stops halfway.
      const order = readReadingOrder();

      expect(
        order.map((exampleName, index) => {
          const next = order[index + 1];

          return [
            exampleName,
            readNextLink(exampleName).includes(
              next === undefined ? "../../README.md" : `../${next}/README.md`,
            ),
          ];
        }),
      ).toStrictEqual(order.map((exampleName) => [exampleName, true]));
    });
  });

  describe("the commands the guides document", () => {
    // The third instance of one defect on this branch was a guide documenting
    // a `--check breadth` run as refused, which configuring these packages had
    // quietly made succeed — a documented behavior that stopped being true
    // with nothing to say so. These assertions are what says so.

    it.each(EXAMPLE_NAMES)(
      "%s documents the aggregate target this package really has",
      (exampleName) => {
        // The `## Run it` command is not spawned here: the aggregate trace above already runs that configuration.
        // What no assertion covered was the command line itself, so a renamed target would go unnoticed.
        expect(readRunItCommand(exampleName)).toBe(RUN_IT_COMMAND);
      },
    );

    it.each(GUIDES_WITH_DOCUMENTED_RUNS)(
      "%s runs every command it documents to the outcome it promises",
      (exampleName) => {
        const runs = readDocumentedRuns(exampleName);

        // Guarded rather than assumed: a guide whose documented runs were
        // deleted would otherwise pass this by having nothing to check.
        expect(runs.length).toBeGreaterThan(0);
        expect(
          runs.map((run) => {
            const { output, status } = runDocumented(run.command);
            const headline = readPromisedHeadline(run.promised);

            return {
              headline,
              printed: output.includes(headline),
              succeeded: status === 0,
            };
          }),
        ).toStrictEqual(
          runs.map((run) => ({
            headline: readPromisedHeadline(run.promised),
            printed: true,
            // Both of `gated-leaf`'s runs exit non-zero, for opposite reasons
            // its guide states outright: the first found the finding it was
            // asked to look for, the second had no limit to look with.
            succeeded: false,
          })),
        );
      },
    );
  });

  describe("what the run measured", () => {
    it("traces this package and the projects its imports reach", () => {
      // The closure as a set. Absent projects are the narrowing rule this run exercises:
      // a project root with a tsconfig.json and no package.json, and the workspace root.
      //
      // Every `*-core` arrives behind its `configuration` package, which moved its result vocabulary into a contracts leaf.
      expect(
        result.projects.map((project) => project.projectName),
      ).toStrictEqual([
        "projects/common/observability",
        "projects/ic-suite/callidescope/callidescope-configuration",
        "projects/ic-suite/callidescope/callidescope-core",
        EXAMPLES_DIRECTORY,
        GATED_LEAF_DIRECTORY,
        "projects/ic-suite/codependix/codependix-configuration",
        "projects/ic-suite/codependix/codependix-core",
        "projects/ic-suite/codometer/codometer-configuration",
        "projects/ic-suite/codometer/codometer-core",
        "projects/ic-suite/coinagerie/coinagerie-configuration",
        "projects/ic-suite/coinagerie/coinagerie-core",
        "projects/ic-suite/coinagerie/coinagerie-languages",
      ]);
    });

    it("measures this package's own fixtures exactly", () => {
      expect(readOwnReport(result).summary).toStrictEqual({
        callableCount: 80,
        cyclicComponentCount: 1,
        edgeCount: 54,
        entryPointCount: 19,
        fileCount: 41,
        maximumDepth: 8,
        projectCount: 1,
        unresolvedCallCount: 2,
      });
    });

    it("credits a nested project's files to the nested project", () => {
      // Ownership is by containment, so a nested project owns its own files.
      // Otherwise a limit would be resolved against a project that owns none of its code.
      expect(
        result.projects
          .filter((project) =>
            project.projectName.startsWith(`${EXAMPLES_DIRECTORY}/examples/`),
          )
          .map((project) => [project.projectName, project.summary.fileCount]),
      ).toStrictEqual([[GATED_LEAF_DIRECTORY, 2]]);
    });

    it("leaves out the file a project excluded", () => {
      // `gated-leaf` declares `exclude: ["*.generated.ts"]`. Counting disk against trace makes this an assertion about the exclusion.
      // A glob anchored to the workspace would match nothing, and the counts would agree.
      const traced = (directory: string): Record<string, number> => ({
        onDisk: readdirSync(path.join(WORKSPACE_ROOT, directory)).filter(
          (name) => name.endsWith(".ts"),
        ).length,
        traced: readProjectReport(result, directory).summary.fileCount,
      });

      expect(traced(GATED_LEAF_DIRECTORY)).toStrictEqual({
        onDisk: 3,
        traced: 2,
      });
    });

    it("drops the over-cap structural expansion, and only that", () => {
      // Nine classes satisfy `LineSink` against a cap of eight, so the whole expansion is dropped as unfollowable.
      // The count pins that: a cap that stopped working would resolve those nine edges and drop it to one.
      expect(readOwnReport(result).summary.unresolvedCallCount).toBe(2);
    });
  });

  describe("dependency closure", () => {
    it("follows a call into a dependency, and stops at the boundary without it", () => {
      // The closure can only be shown to do something by taking one project
      // out of it. The same fixture heads the same stack either way; what
      // changes is how far the stack goes, which is the whole claim.
      const withoutDependency = traceFixtures(
        createTemporaryDirectory("callidescope-examples"),
        {
          exclude: [
            "projects/ic-suite/callidescope/callidescope-configuration/**",
          ],
        },
      );

      expect(readClosureFrames(result)).toStrictEqual([
        {
          displayName: "DependencyClosureService.allowsDepth",
          project: EXAMPLES_DIRECTORY,
        },
        {
          displayName: "DependencyClosureService.readDepthLimit",
          project: EXAMPLES_DIRECTORY,
        },
        {
          displayName: "ConfigurationService.resolveConfiguration",
          project: "projects/ic-suite/callidescope/callidescope-configuration",
        },
        // Two frames sit inside the dependency: the package's facade forwards to the loader behind it.
        {
          displayName: "ConfigurationFileService.resolveConfiguration",
          project: "projects/ic-suite/callidescope/callidescope-configuration",
        },
        {
          displayName: "ConfigurationFileService.resolveEntryPoints",
          project: "projects/ic-suite/callidescope/callidescope-configuration",
        },
      ]);

      expect(readClosureFrames(withoutDependency)).toStrictEqual([
        {
          displayName: "DependencyClosureService.allowsDepth",
          project: EXAMPLES_DIRECTORY,
        },
        {
          displayName: "DependencyClosureService.readDepthLimit",
          project: EXAMPLES_DIRECTORY,
        },
      ]);
    });
  });

  describe("depth findings", () => {
    it("reports every deliberately deep stack this package heads", () => {
      // Narrowed to the stacks this package heads. Another project's own limit is not this suite's to pin.
      expect(
        readDeepStacksFor(result, EXAMPLES_DIRECTORY).map((stack) => ({
          depth: stack.depth,
          entry: stack.frames[0]?.displayName,
          isLowerBound: stack.isLowerBound,
        })),
      ).toStrictEqual([
        {
          depth: 8,
          entry: "ComputedMemberService.dispatch",
          isLowerBound: true,
        },
        { depth: 8, entry: "DeepStackService.quote", isLowerBound: false },
        {
          depth: 8,
          entry: "ForwardingStackService.handle",
          isLowerBound: false,
        },
        {
          depth: 7,
          entry: "FrameAnnotationsService.trace",
          isLowerBound: false,
        },
        {
          depth: 6,
          entry: "ProjectDepthLimitService.judge",
          isLowerBound: false,
        },
      ]);
    });

    it("ends the two pricing stacks on the tail they share", () => {
      // The convergence the mermaid diagram is drawn for. Without it the
      // diagram is two straight lines, which a list already says better.
      const tails = result.deepStacks
        .filter((stack) =>
          ["DeepStackService.quote", "ForwardingStackService.handle"].includes(
            stack.frames[0]?.displayName ?? "",
          ),
        )
        .map((stack) => stack.frames.at(-1)?.displayName);

      expect(tails).toStrictEqual(["roundToCents", "roundToCents"]);
    });
  });

  describe("recursion", () => {
    it("collapses the cycle of three into frames marked as one", () => {
      // Every member of a cycle has a caller inside it, so none is promoted as
      // an orphan. `traverse` is the root above the cluster that makes the
      // collapsed component reachable, and therefore reportable at all.
      const stack = result.projects
        .flatMap((project) => project.stacks)
        .find(
          (candidate) =>
            candidate.frames[0]?.displayName ===
            "MutualRecursionService.traverse",
        );

      expect(
        stack?.frames.map((frame) => [frame.displayName, frame.isCycle]),
      ).toStrictEqual([
        ["MutualRecursionService.traverse", false],
        ["MutualRecursionService.branch", true],
        ["MutualRecursionService.leaf", true],
        ["MutualRecursionService.descend", true],
      ]);
    });
  });

  describe("entry points", () => {
    it("carries one stack of every root kind", () => {
      const kinds = new Set(
        readOwnReport(result).stacks.map((stack) => stack.entryPointKind),
      );

      expect([...kinds].toSorted()).toStrictEqual([
        "declared",
        "decorated-method",
        "exported-function",
        "lifecycle",
        "module-bootstrap",
        "orphan-root",
      ]);
    });

    it("roots a declared address without taking the caller's own root away", () => {
      // `collect` has a caller, so no rule and no orphan promotion would ever
      // root it — the address in this package's own configuration is the whole
      // reason it heads a stack. `publish` keeps its orphan root beside it,
      // which is the "additive, never subtractive" half of the rule.
      expect(
        readOwnReport(result)
          .stacks.filter((stack) =>
            (stack.frames[0]?.displayName ?? "").startsWith(
              "DeclaredEntryPointsService.",
            ),
          )
          .map((stack) => [stack.frames[0]?.displayName, stack.entryPointKind]),
      ).toStrictEqual([
        ["DeclaredEntryPointsService.publish", "orphan-root"],
        ["DeclaredEntryPointsService.collect", "declared"],
      ]);
    });
  });

  describe("per-project limits", () => {
    it("judges each project against the limit its own configuration settles on", () => {
      // Three depth limits in one report, each from its own project's `callidescope.config.ts`.
      //
      // `@codebase/observability` measures five here but four in the workspace run, which ignores
      // calls into `LoggerService`. The per-project feature working, not a fixture misbehaving.
      expect(
        result.deepStacks.map((stack) => [
          stack.frames[0]?.displayName,
          stack.limit,
        ]),
      ).toStrictEqual([
        ["ComputedMemberService.dispatch", 5],
        ["DeepStackService.quote", 5],
        ["ForwardingStackService.handle", 5],
        ["FrameAnnotationsService.trace", 5],
        ["LoggerService.log", 4],
        ["ProjectDepthLimitService.judge", 5],
        ["LoggerService.debug", 4],
        ["LoggerService.error", 4],
        ["LoggerService.verbose", 4],
        ["LoggerService.warn", 4],
        ["GatedLeafService.read", 3],
      ]);
    });

    it("makes a six-frame chain a finding that the run's own default would pass", () => {
      // `project-depth-limit`'s reason for existing. Six frames pass the six
      // the run supplies as its default and fail the five this package
      // declares, so the same fixture is a finding or not depending on nothing
      // but which file the number was written in.
      const judged = readDeepStacksFor(result, EXAMPLES_DIRECTORY).find(
        (stack) =>
          stack.frames[0]?.displayName === "ProjectDepthLimitService.judge",
      );

      expect(judged?.depth).toBe(6);
      expect(judged?.limit).toBe(5);
    });

    it("gates the leaf below every limit above it", () => {
      // `gated-leaf`'s reason for existing. Four frames and three direct
      // callees are under every limit any project above it carries, and over
      // the two this project wrote for itself.
      const [deep] = readDeepStacksFor(result, GATED_LEAF_DIRECTORY);
      const wide = result.wideCallables;

      expect([
        deep?.frames[0]?.displayName,
        deep?.depth,
        deep?.limit,
      ]).toStrictEqual(["GatedLeafService.read", 4, 3]);
      expect(
        wide.map((finding) => [
          finding.displayName,
          finding.breadth,
          finding.limit,
        ]),
      ).toStrictEqual([["GatedLeafService.read", 3, 2]]);
    });
  });

  describe("frame annotations", () => {
    it("marks a deprecated frame, from its own root", () => {
      // Calling a `@deprecated` member is an ESLint error here, so the tag can
      // only have a frame if the deprecated callable heads its own stack.
      const stack = result.projects
        .flatMap((project) => project.stacks)
        .find(
          (candidate) =>
            candidate.frames[0]?.displayName ===
            "FrameAnnotationsService.legacyRender",
        );

      expect(stack?.frames[0]?.documentation?.isDeprecated).toBe(true);
    });

    it("names a destructured parameter that has no name in the syntax", () => {
      const frames =
        result.deepStacks.find(
          (stack) =>
            stack.frames[0]?.displayName === "FrameAnnotationsService.trace",
        )?.frames ?? [];
      const byName = new Map(frames.map((frame) => [frame.displayName, frame]));

      expect(
        byName.get("FrameAnnotationsService.describe")?.signature?.text,
      ).toContain("{ count, name }");
    });

    it("carries the whole summary in the report a machine reads", () => {
      // Shortening is the printed tree's business. The JSON keeps every
      // comment in full, because a machine reading it has no line width.
      const summary = result.deepStacks
        .flatMap((stack) => stack.frames)
        .find((frame) => frame.displayName === "FrameAnnotationsService.finish")
        ?.documentation?.summary;

      expect(summary?.length).toBeGreaterThan(120);
    });
  });
});

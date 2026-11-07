import { createMock } from "@golevelup/ts-vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OptionsService } from "../../modules/options/options.service";
import { EMPTY_SCOPE_REPORT } from "../../modules/plugin/plugin.constants";

import gateBatchExecutor from "./batch-executor";

import type { PluginService } from "../../modules/plugin/plugin.service";
import type { ResolvedTraceScope } from "../../modules/plugin/plugin.types";
import type { GateExecutorOptions } from "./executor.types";
import type { ConfigurationService } from "@callidescope/configuration";
import type { ExecutorContext, TaskGraph } from "@nx/devkit";
import type { MockInstance } from "vitest";

/** The workspace configuration every run must name. */
const CONFIGURATION_PATH = "configuration/callidescope.config.ts";

const pluginService = createMock<PluginService>();

vi.mock("../../modules/plugin/plugin-context.utilities", () => ({
  resolveOptionsService: async (): Promise<OptionsService> =>
    await Promise.resolve(
      new OptionsService(
        createMock<ConfigurationService>({
          requireConfigurationPath: (path: string | undefined): string =>
            path ?? "",
        }),
      ),
    ),
  resolvePluginService: async (): Promise<PluginService> =>
    await Promise.resolve(pluginService),
}));

/** The context a batch worker hands over: no project, since it holds many. */
const CONTEXT: ExecutorContext = {
  cwd: "/workspace",
  isVerbose: false,
  nxJsonConfiguration: {},
  projectGraph: { dependencies: {}, nodes: {} },
  projectsConfigurations: { projects: {}, version: 2 },
  root: "/workspace",
};

/** The options Nx resolves for each task: one shared configuration. */
function buildOptions(
  projectNames: string[],
  overrides: Partial<GateExecutorOptions> = {},
): Record<string, GateExecutorOptions> {
  return Object.fromEntries(
    projectNames.map((project) => [
      `${project}:callidescope-restrict`,
      { configuration: CONFIGURATION_PATH, ...overrides },
    ]),
  );
}

/** A resolved scope for one project, nothing refused. */
function buildScope(project: string): ResolvedTraceScope {
  return {
    directories: [`packages/${project}`, "packages/shared"],
    knownNames: [],
    knownTags: [],
    projectNames: [project],
    selectedDirectories: [`packages/${project}`],
    unknownNames: [],
    unmatchedTags: [],
  };
}

/** A task graph of one gate task for each named project. */
function buildTaskGraph(projectNames: string[]): TaskGraph {
  return {
    continuousDependencies: {},
    dependencies: {},
    roots: [],
    tasks: Object.fromEntries(
      projectNames.map((project) => [
        `${project}:callidescope-restrict`,
        {
          cache: true,
          id: `${project}:callidescope-restrict`,
          outputs: [],
          overrides: {},
          parallelism: true,
          target: { project, target: "callidescope-restrict" },
        },
      ]),
    ),
  };
}

describe(gateBatchExecutor, () => {
  let write: MockInstance<typeof process.stdout.write>;

  beforeEach(() => {
    vi.clearAllMocks();
    write = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    pluginService.resolveTraceScope.mockImplementation(
      async ({ projectNames }) =>
        await Promise.resolve(buildScope(projectNames[0] ?? "")),
    );
    pluginService.describeRefusedScope.mockReturnValue("Unknown Nx projects.");
    pluginService.runGateBatch.mockImplementation(
      async ({ tasks }) =>
        await Promise.resolve(
          Object.fromEntries(
            tasks.map((task) => [
              task.id,
              { ok: true, report: `ok ${task.id}` },
            ]),
          ),
        ),
    );
  });

  it("gates every task from one batch call, each by its own project", async () => {
    expect.hasAssertions();

    const results = await gateBatchExecutor(
      buildTaskGraph(["alpha", "beta"]),
      buildOptions(["alpha", "beta"]),
      { configuration: CONFIGURATION_PATH },
      CONTEXT,
    );

    expect(pluginService.runGateBatch).toHaveBeenCalledTimes(1);
    expect(pluginService.runGateBatch).toHaveBeenCalledWith({
      configurationPath: CONFIGURATION_PATH,
      tasks: [
        {
          directories: ["packages/alpha", "packages/shared"],
          id: "alpha:callidescope-restrict",
          judgedProjectNames: ["packages/alpha"],
        },
        {
          directories: ["packages/beta", "packages/shared"],
          id: "beta:callidescope-restrict",
          judgedProjectNames: ["packages/beta"],
        },
      ],
      workspaceRoot: "/workspace",
    });
    expect(results).toStrictEqual({
      "alpha:callidescope-restrict": {
        success: true,
        terminalOutput: "ok alpha:callidescope-restrict",
      },
      "beta:callidescope-restrict": {
        success: true,
        terminalOutput: "ok beta:callidescope-restrict",
      },
    });
  });

  it("reports a failing verdict as a failed task with its report", async () => {
    expect.hasAssertions();

    pluginService.runGateBatch.mockResolvedValue({
      "alpha:callidescope-restrict": { ok: false, report: "## Deep stacks" },
    });

    await expect(
      gateBatchExecutor(
        buildTaskGraph(["alpha"]),
        buildOptions(["alpha"]),
        { configuration: CONFIGURATION_PATH },
        CONTEXT,
      ),
    ).resolves.toStrictEqual({
      "alpha:callidescope-restrict": {
        success: false,
        terminalOutput: "## Deep stacks",
      },
    });
  });

  it("prints a failing task's report under its id, and nothing for a passing one", async () => {
    expect.hasAssertions();

    pluginService.runGateBatch.mockResolvedValue({
      "alpha:callidescope-restrict": {
        ok: false,
        report: "## Deep stacks (1)",
      },
      "beta:callidescope-restrict": { ok: true, report: "None." },
    });

    await gateBatchExecutor(
      buildTaskGraph(["alpha", "beta"]),
      buildOptions(["alpha", "beta"]),
      { configuration: CONFIGURATION_PATH },
      CONTEXT,
    );

    // Nx stores a batch task's output but never prints it, so without this a
    // failed gate would be a red task that does not say which stack broke.
    const printed = write.mock.calls.map(([chunk]) => String(chunk)).join("");

    expect(printed).toContain("alpha:callidescope-restrict");
    expect(printed).toContain("## Deep stacks (1)");
    expect(printed).not.toContain("beta:callidescope-restrict");
    expect(printed).not.toContain("None.");
  });

  it("prints why a task with nothing to trace failed", async () => {
    expect.hasAssertions();

    pluginService.resolveTraceScope.mockResolvedValue({
      ...buildScope("alpha"),
      directories: [],
    });

    await gateBatchExecutor(
      buildTaskGraph(["alpha"]),
      buildOptions(["alpha"]),
      { configuration: CONFIGURATION_PATH },
      CONTEXT,
    );

    expect(write.mock.calls.map(([chunk]) => String(chunk)).join("")).toContain(
      EMPTY_SCOPE_REPORT,
    );
  });

  it("fails a task with nothing to trace without failing its peers", async () => {
    expect.hasAssertions();

    pluginService.resolveTraceScope.mockImplementation(
      async ({ projectNames }) =>
        await Promise.resolve({
          ...buildScope(projectNames[0] ?? ""),
          directories: projectNames[0] === "alpha" ? [] : ["packages/beta"],
        }),
    );

    const results = await gateBatchExecutor(
      buildTaskGraph(["alpha", "beta"]),
      buildOptions(["alpha", "beta"]),
      { configuration: CONFIGURATION_PATH },
      CONTEXT,
    );

    expect(results["alpha:callidescope-restrict"]).toStrictEqual({
      success: false,
      terminalOutput: EMPTY_SCOPE_REPORT,
    });
    expect(results["beta:callidescope-restrict"]?.success).toBe(true);
  });

  it("fails a task whose selection the workspace refuses, naming why", async () => {
    expect.hasAssertions();

    pluginService.resolveTraceScope.mockImplementation(
      async ({ projectNames }) =>
        await Promise.resolve({
          ...buildScope(projectNames[0] ?? ""),
          unknownNames: projectNames[0] === "alpha" ? ["alpha"] : [],
        }),
    );

    const results = await gateBatchExecutor(
      buildTaskGraph(["alpha", "beta"]),
      buildOptions(["alpha", "beta"]),
      { configuration: CONFIGURATION_PATH },
      CONTEXT,
    );

    expect(results["alpha:callidescope-restrict"]).toStrictEqual({
      success: false,
      terminalOutput: "Unknown Nx projects.",
    });
    expect(results["beta:callidescope-restrict"]?.success).toBe(true);
  });

  it("makes one batch call for each distinct configuration path", async () => {
    expect.hasAssertions();

    const options = {
      ...buildOptions(["alpha"]),
      ...buildOptions(["beta"], { configuration: "other.config.ts" }),
    };

    await gateBatchExecutor(
      buildTaskGraph(["alpha", "beta"]),
      options,
      { configuration: CONFIGURATION_PATH },
      CONTEXT,
    );

    expect(pluginService.runGateBatch).toHaveBeenCalledTimes(2);
  });

  it("makes no batch call when every task was refused", async () => {
    expect.hasAssertions();

    pluginService.resolveTraceScope.mockResolvedValue({
      ...buildScope("alpha"),
      directories: [],
    });

    await gateBatchExecutor(
      buildTaskGraph(["alpha"]),
      buildOptions(["alpha"]),
      { configuration: CONFIGURATION_PATH },
      CONTEXT,
    );

    expect(pluginService.runGateBatch).not.toHaveBeenCalled();
  });
});

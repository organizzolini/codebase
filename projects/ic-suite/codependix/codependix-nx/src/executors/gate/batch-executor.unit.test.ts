import { createMock } from "@golevelup/ts-vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import gateBatchExecutor from "./batch-executor";

import type { BatchService } from "../../modules/batch/batch.service";
import type { GateService } from "../../modules/gate/gate.service";
import type { ExecutorContext, TaskGraph } from "@nx/devkit";
import type { MockInstance } from "vitest";

const batchService = createMock<BatchService>();
const gateService = createMock<GateService>();

vi.mock("../../modules/plugin/plugin-context.utilities", () => ({
  resolveBatchService: async (): Promise<BatchService> =>
    await Promise.resolve(batchService),
  resolveGateService: async (): Promise<GateService> =>
    await Promise.resolve(gateService),
}));

/** A context whose graph says which projects' gate target is cached. */
function buildContext(cachedProjects: string[]): ExecutorContext {
  return {
    cwd: "/workspace",
    isVerbose: false,
    nxJsonConfiguration: {},
    projectGraph: {
      dependencies: {},
      nodes: Object.fromEntries(
        cachedProjects.map((project) => [
          project,
          {
            data: {
              root: `packages/${project}`,
              targets: { "codependix-bound": { cache: true } },
            },
            name: project,
            type: "lib",
          },
        ]),
      ),
    },
    projectsConfigurations: { projects: {}, version: 2 },
    root: "/workspace",
  };
}

/** A task graph of one `codependix-bound` task for each named project. */
function buildTaskGraph(projectNames: string[]): TaskGraph {
  return {
    continuousDependencies: {},
    dependencies: {},
    roots: [],
    tasks: Object.fromEntries(
      projectNames.map((project) => [
        `${project}:codependix-bound`,
        {
          cache: true,
          id: `${project}:codependix-bound`,
          outputs: [],
          overrides: {},
          parallelism: true,
          target: { project, target: "codependix-bound" },
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
    batchService.runBatch.mockResolvedValue({});
    gateService.resolveConfigurationPath.mockImplementation(
      ({ configuration }) => configuration ?? "registered.config.ts",
    );
  });

  it("hands the batch service one task per project, with each task's own options", async () => {
    expect.hasAssertions();

    await gateBatchExecutor(
      buildTaskGraph(["alpha", "beta"]),
      { "alpha:codependix-bound": { configuration: "alpha.config.ts" } },
      { configuration: "overrides.config.ts" },
      buildContext(["alpha"]),
    );

    // The graph says `alpha`'s target is cached and `beta`'s is not, and a
    // task Nx gave no options of its own falls back to the run's overrides.
    expect(batchService.runBatch).toHaveBeenCalledWith({
      tasks: [
        {
          cached: true,
          configurationPath: "alpha.config.ts",
          id: "alpha:codependix-bound",
          options: { configuration: "alpha.config.ts" },
          project: "alpha",
        },
        {
          cached: false,
          configurationPath: "overrides.config.ts",
          id: "beta:codependix-bound",
          options: { configuration: "overrides.config.ts" },
          project: "beta",
        },
      ],
      workspaceRoot: "/workspace",
    });
  });

  it("fails a task whose configuration cannot be resolved without losing its peers", async () => {
    expect.hasAssertions();

    gateService.resolveConfigurationPath.mockImplementation(
      ({ configuration }) => {
        if (configuration === "missing.config.ts") {
          throw new Error("no configuration registered");
        }

        return configuration ?? "registered.config.ts";
      },
    );
    batchService.runBatch.mockResolvedValue({
      "beta:codependix-bound": { success: true, terminalOutput: "" },
    });

    const results = await gateBatchExecutor(
      buildTaskGraph(["alpha", "beta"]),
      {
        "alpha:codependix-bound": { configuration: "missing.config.ts" },
        "beta:codependix-bound": { configuration: "beta.config.ts" },
      },
      { configuration: "overrides.config.ts" },
      buildContext([]),
    );

    expect(results["alpha:codependix-bound"]).toStrictEqual({
      success: false,
      terminalOutput: "no configuration registered",
    });
    expect(results["beta:codependix-bound"]?.success).toBe(true);
    expect(batchService.runBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        tasks: [expect.objectContaining({ id: "beta:codependix-bound" })],
      }),
    );
  });

  it("returns what the batch service settled on for every task", async () => {
    expect.hasAssertions();

    const results = {
      "alpha:codependix-bound": { success: true, terminalOutput: "" },
    };

    batchService.runBatch.mockResolvedValue(results);

    await expect(
      gateBatchExecutor(
        buildTaskGraph(["alpha"]),
        {},
        { configuration: "codependix.config.ts" },
        buildContext([]),
      ),
    ).resolves.toStrictEqual(results);
  });

  it("prints a failed task's report under its id, and nothing for a passing one", async () => {
    expect.hasAssertions();

    batchService.runBatch.mockResolvedValue({
      "alpha:codependix-bound": {
        success: false,
        terminalOutput: "a-is-a-leaf: a must not depend on b",
      },
      "beta:codependix-bound": { success: true, terminalOutput: "" },
    });

    await gateBatchExecutor(
      buildTaskGraph(["alpha", "beta"]),
      {},
      { configuration: "codependix.config.ts" },
      buildContext([]),
    );

    // Nx stores a batch task's output but never prints it, so without this a
    // failed gate would be a red task that does not say which rule broke.
    const printed = write.mock.calls.map(([chunk]) => String(chunk)).join("");

    expect(printed).toContain("alpha:codependix-bound");
    expect(printed).toContain("a-is-a-leaf: a must not depend on b");
    expect(printed).not.toContain("beta:codependix-bound");
  });
});

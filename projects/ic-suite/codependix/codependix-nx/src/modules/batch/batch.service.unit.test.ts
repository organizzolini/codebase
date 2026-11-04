import { ChildProcess, spawn } from "node:child_process";
import { PassThrough } from "node:stream";

import { ConfigurationModule } from "@codependix/configuration";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { GateService } from "../gate/gate.service";
import { PluginService } from "../plugin/plugin.service";

import { BatchService } from "./batch.service";

import type { GateOptions } from "../gate/gate.types";
import type { RunGateBatchTask } from "./batch.types";
import type * as ChildProcessModule from "node:child_process";

vi.mock("node:child_process", async (importOriginal) => ({
  ...(await importOriginal<typeof ChildProcessModule>()),
  spawn: vi.fn<() => void>(),
}));

/** A child process that prints, then exits with the given code or fails. */
function buildChild(args: {
  error?: Error;
  exitCode: null | number;
  standardError?: string;
  standardOutput?: string;
}): ChildProcess {
  const child = new ChildProcess();
  const stdout = new PassThrough();
  const stderr = new PassThrough();

  child.stdout = stdout;
  child.stderr = stderr;

  setImmediate(() => {
    stdout.end(args.standardOutput ?? "");
    stderr.end(args.standardError ?? "");
    if (args.error === undefined) {
      child.emit("close", args.exitCode);
    } else {
      child.emit("error", args.error);
    }
  });

  return child;
}

/** The arguments the batch's last spawn was handed. */
function spawnedArguments(): readonly string[] {
  const [, argv] = vi.mocked(spawn).mock.lastCall ?? [];

  return argv ?? [];
}

describe(BatchService, () => {
  let service: BatchService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigurationModule],
      providers: [BatchService, GateService, PluginService],
    }).compile();

    service = await module.resolve(BatchService);
  });

  beforeEach(() => {
    vi.mocked(spawn).mockReset();
    vi.mocked(spawn).mockReturnValue(buildChild({ exitCode: 0 }));
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
    vi.spyOn(process.stderr, "write").mockReturnValue(true);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  describe("runBatch", () => {
    /** The JSON a `--format json` boundary run prints, for the given findings. */
    function reportOf(
      findings: { projects: string[]; verdict?: "fail" | "note" }[] = [],
    ): string {
      return JSON.stringify({
        boundaries: {
          failures: [],
          judgedProjects: [],
          violations: findings.map((finding) => ({
            cycle: null,
            level: "nx-projects",
            message: "a-is-a-leaf",
            projects: finding.projects,
            rule: "a-is-a-leaf",
            source: "a",
            target: "b",
            verdict: finding.verdict ?? "fail",
          })),
        },
      });
    }

    /**
     * A command line run that finds nothing, new for every spawn.
     *
     * A function and not a value: a run that is spawned more than once must be
     * handed a fresh child each time, and a shared one has already ended by
     * the second, so it would never end again for anyone waiting on it.
     */
    function passingRun(): ChildProcess {
      return buildChild({ exitCode: 0, standardOutput: reportOf() });
    }

    /** One task of the batch: the target of a project, judging only itself. */
    function taskOf(
      project: string,
      overrides: Partial<GateOptions> = {},
    ): RunGateBatchTask {
      return {
        cached: true,
        configurationPath: "codependix.config.ts",
        id: `${project}:codependix-bound`,
        options: overrides,
        project,
      };
    }

    /** The `--projects` value of each command line run the batch spawned. */
    function spawnedProjects(): string[] {
      return vi.mocked(spawn).mock.calls.map(([, argv]) => {
        const flag = argv.indexOf("--projects");

        return argv[flag + 1] ?? "";
      });
    }

    it("judges every task from one command line run", async () => {
      expect.hasAssertions();

      vi.mocked(spawn).mockReturnValue(
        buildChild({ exitCode: 0, standardOutput: reportOf() }),
      );

      const results = await service.runBatch({
        concurrency: 1,
        tasks: [taskOf("a"), taskOf("b")],
        workspaceRoot: "/workspace",
      });

      expect(spawn).toHaveBeenCalledTimes(1);
      expect(spawnedArguments()).toStrictEqual(
        expect.arrayContaining(["--format", "json", "--check", "boundaries"]),
      );
      expect(spawnedProjects()).toStrictEqual(["a,b"]);
      expect(results).toStrictEqual({
        "a:codependix-bound": { success: true, terminalOutput: "" },
        "b:codependix-bound": { success: true, terminalOutput: "" },
      });
    });

    it("fails only the task a finding is charged to, with the command line's own report", async () => {
      expect.hasAssertions();

      vi.mocked(spawn)
        .mockReturnValueOnce(
          buildChild({
            exitCode: 1,
            standardOutput: reportOf([{ projects: ["a"] }]),
          }),
        )
        .mockReturnValueOnce(
          buildChild({
            exitCode: 1,
            standardOutput: "a-is-a-leaf: a must not depend on b",
          }),
        );

      const results = await service.runBatch({
        concurrency: 1,
        tasks: [taskOf("a"), taskOf("b"), taskOf("c")],
        workspaceRoot: "/workspace",
      });

      // The failing task is run again on its own, so what it prints is exactly
      // what a single gate would have printed.
      expect(spawnedProjects()).toStrictEqual(["a,b,c", "a"]);
      expect(results["a:codependix-bound"]).toStrictEqual({
        success: false,
        terminalOutput: "a-is-a-leaf: a must not depend on b",
      });
      expect(results["b:codependix-bound"]?.success).toBe(true);
      expect(results["c:codependix-bound"]?.success).toBe(true);
    });

    it("still fails a task whose own run unexpectedly passes, saying so", async () => {
      expect.hasAssertions();

      vi.mocked(spawn)
        .mockReturnValueOnce(
          buildChild({
            exitCode: 1,
            standardOutput: reportOf([{ projects: ["a"] }]),
          }),
        )
        .mockReturnValueOnce(buildChild({ exitCode: 0 }));

      const results = await service.runBatch({
        tasks: [taskOf("a")],
        workspaceRoot: "/workspace",
      });

      // A pass found by a second look must never hide a finding the batch
      // charged to the project.
      expect(results["a:codependix-bound"]?.success).toBe(false);
      expect(results["a:codependix-bound"]?.terminalOutput).toContain(
        "a:codependix-bound",
      );
    });

    it("passes a task when the only finding is a note on a project outside the batch", async () => {
      expect.hasAssertions();

      vi.mocked(spawn).mockReturnValue(
        buildChild({
          exitCode: 0,
          standardOutput: reportOf([{ projects: ["x"], verdict: "note" }]),
        }),
      );

      const results = await service.runBatch({
        tasks: [taskOf("a")],
        workspaceRoot: "/workspace",
      });

      expect(results["a:codependix-bound"]?.success).toBe(true);
    });

    it("fails every task when what the command line printed cannot be read", async () => {
      expect.hasAssertions();

      // Never a pass on output nobody could check: a gate that read nothing
      // has no verdict to record.
      vi.mocked(spawn).mockReturnValue(
        buildChild({ exitCode: 0, standardOutput: "not json" }),
      );

      const results = await service.runBatch({
        tasks: [taskOf("a"), taskOf("b")],
        workspaceRoot: "/workspace",
      });

      expect(
        Object.values(results).map((result) => result.success),
      ).toStrictEqual([false, false]);
      expect(results["a:codependix-bound"]?.terminalOutput).toContain(
        "not json",
      );
    });

    it("fails every task when the run failed but charged none of them", async () => {
      expect.hasAssertions();

      vi.mocked(spawn).mockReturnValue(
        buildChild({
          exitCode: 1,
          standardError: "container exploded",
          standardOutput: reportOf([{ projects: ["elsewhere"] }]),
        }),
      );

      const results = await service.runBatch({
        tasks: [taskOf("a"), taskOf("b")],
        workspaceRoot: "/workspace",
      });

      expect(
        Object.values(results).map((result) => result.success),
      ).toStrictEqual([false, false]);
    });

    it("fails a run whose command line cannot be started, without throwing", async () => {
      expect.hasAssertions();

      vi.mocked(spawn).mockReturnValue(
        buildChild({ error: new Error("spawn ENOENT"), exitCode: null }),
      );

      const results = await service.runBatch({
        tasks: [taskOf("a")],
        workspaceRoot: "/workspace",
      });

      expect(results["a:codependix-bound"]).toStrictEqual({
        success: false,
        terminalOutput: "spawn ENOENT",
      });
    });

    it("splits the projects across runs so no argument is past the byte budget", async () => {
      expect.hasAssertions();

      vi.mocked(spawn).mockImplementation(passingRun);

      const projects = Array.from(
        { length: 60 },
        (_unused, index) => `project-with-a-long-name-${String(index)}`,
      );
      const results = await service.runBatch({
        tasks: projects.map((project) => taskOf(project)),
        workspaceRoot: "/workspace",
      });

      const runs = spawnedProjects();

      // Node 26 is killed by the operating system on one argument past ~1 KB,
      // before it prints anything, so a long project list must never be one.
      expect(runs.length).toBeGreaterThan(1);
      expect(Math.max(...runs.map((run) => run.length))).toBeLessThanOrEqual(
        900,
      );
      expect(runs.flatMap((run) => run.split(",")).toSorted()).toStrictEqual(
        projects.toSorted(),
      );
      expect(Object.keys(results)).toHaveLength(60);
    });

    it("spreads the projects over parallel runs, one per available core", async () => {
      expect.hasAssertions();

      vi.mocked(spawn).mockImplementation(passingRun);

      const projects = ["a", "b", "c", "d", "e", "f", "g", "h"];
      const results = await service.runBatch({
        concurrency: 4,
        tasks: projects.map((project) => taskOf(project)),
        workspaceRoot: "/workspace",
      });

      expect(spawnedProjects().toSorted()).toStrictEqual([
        "a,e",
        "b,f",
        "c,g",
        "d,h",
      ]);
      expect(Object.keys(results)).toHaveLength(8);
    });

    it("starts every run before waiting on any of them", async () => {
      expect.hasAssertions();

      // No child finishes until all three have been started. Run one after
      // another, the first would wait forever for a second that was never
      // asked for; run together, they all end the moment the third starts.
      const started: {
        child: ChildProcess;
        stderr: PassThrough;
        stdout: PassThrough;
      }[] = [];

      vi.mocked(spawn).mockImplementation(() => {
        const child = new ChildProcess();
        const stdout = new PassThrough();
        const stderr = new PassThrough();

        child.stdout = stdout;
        child.stderr = stderr;
        started.push({ child, stderr, stdout });

        if (started.length === 3) {
          setImmediate(() => {
            for (const run of started) {
              run.stdout.end(reportOf());
              run.stderr.end("");
              run.child.emit("close", 0);
            }
          });
        }

        return child;
      });

      const results = await service.runBatch({
        concurrency: 3,
        tasks: ["a", "b", "c"].map((project) => taskOf(project)),
        workspaceRoot: "/workspace",
      });

      expect(started).toHaveLength(3);
      expect(Object.values(results).every((result) => result.success)).toBe(
        true,
      );
    });

    it("keeps tasks that differ in dependencies in runs of their own", async () => {
      expect.hasAssertions();

      vi.mocked(spawn).mockImplementation(passingRun);

      await service.runBatch({
        tasks: [taskOf("a"), taskOf("b", { dependencies: false })],
        workspaceRoot: "/workspace",
      });

      const flags = vi
        .mocked(spawn)
        .mock.calls.map(([, argv]) => argv.includes("--no-dependencies"));

      expect(flags.toSorted()).toStrictEqual([false, true]);
    });

    it("keeps tasks on different configuration files in runs of their own", async () => {
      expect.hasAssertions();

      vi.mocked(spawn).mockImplementation(passingRun);

      await service.runBatch({
        concurrency: 1,
        tasks: [
          taskOf("a"),
          { ...taskOf("b"), configurationPath: "other.config.ts" },
        ],
        workspaceRoot: "/workspace",
      });

      const configurations = vi
        .mocked(spawn)
        .mock.calls.map(([, argv]) => argv[argv.indexOf("--config") + 1]);

      expect(configurations.toSorted()).toStrictEqual([
        "codependix.config.ts",
        "other.config.ts",
      ]);
    });

    it("runs a task that judges other projects on its own, outside the batch", async () => {
      expect.hasAssertions();

      vi.mocked(spawn).mockImplementation(passingRun);

      const results = await service.runBatch({
        tasks: [
          taskOf("a"),
          { ...taskOf("c", { projects: ["x", "y"] }), cached: false },
        ],
        workspaceRoot: "/workspace",
      });

      expect(spawnedProjects().toSorted()).toStrictEqual(["a", "x,y"]);
      expect(results["c:codependix-bound"]?.success).toBe(true);
    });

    it("fails a cached task that judges other projects without failing its peers", async () => {
      expect.hasAssertions();

      vi.mocked(spawn).mockImplementation(passingRun);

      const results = await service.runBatch({
        tasks: [taskOf("a"), taskOf("c", { projects: ["x"] })],
        workspaceRoot: "/workspace",
      });

      expect(results["c:codependix-bound"]?.success).toBe(false);
      expect(results["c:codependix-bound"]?.terminalOutput).toContain(
        "must set `cache: false`",
      );
      expect(results["a:codependix-bound"]?.success).toBe(true);
    });

    it("makes no run for a batch of no tasks", async () => {
      expect.hasAssertions();

      await expect(
        service.runBatch({ tasks: [], workspaceRoot: "/workspace" }),
      ).resolves.toStrictEqual({});
      expect(spawn).not.toHaveBeenCalled();
    });
  });
});

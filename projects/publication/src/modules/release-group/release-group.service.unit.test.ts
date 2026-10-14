import fs from "node:fs";

import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  failed,
  FakeProcessRunner,
  succeeded,
  useTemporaryDirectories,
  writeFile,
} from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { ReleaseGroupService } from "./release-group.service";

import type { ScriptedAnswer } from "../../../testing/mocks";
import type { CapturedProcess } from "../process-runner/process-runner.types";
import type { ParallelOutcome } from "./release-group.types";

const SHOW =
  "pnpm exec nx show projects --projects projects/ic-suite/*/*,!codometer-examples --json";

/** A project graph naming each given project's directory. */
const graphOf = (roots: Record<string, string>): string =>
  JSON.stringify({
    graph: {
      nodes: Object.fromEntries(
        Object.entries(roots).map(([project, root]) => [
          project,
          { data: { root } },
        ]),
      ),
    },
  });

describe(ReleaseGroupService, () => {
  const makeDirectory = useTemporaryDirectories();
  let reportLines: string[];
  let service: ReleaseGroupService;
  let workspace: string;

  /** Builds the service over a scripted process runner. */
  const createService = async (
    script: Record<string, ScriptedAnswer<CapturedProcess>>,
    graph = graphOf({ "codometer-cli": "projects/ic-suite/codometer/cli" }),
  ): Promise<{ runner: FakeProcessRunner; service: ReleaseGroupService }> => {
    const runner = new FakeProcessRunner({
      "pnpm exec nx graph *": succeeded(),
      ...script,
    });
    runner.effects["pnpm exec nx graph *"] = (args): void => {
      fs.writeFileSync(String(args.at(-1)).replace("--file=", ""), graph);
    };
    const module = await Test.createTestingModule({
      providers: [
        ReleaseGroupService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();

    return { runner, service: await module.resolve(ReleaseGroupService) };
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReleaseGroupService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: ProcessRunnerService, useValue: new FakeProcessRunner({}) },
      ],
    }).compile();

    service = await module.resolve(ReleaseGroupService);
  });

  beforeEach(() => {
    reportLines = [];
    workspace = makeDirectory();
    vi.spyOn(process, "cwd").mockReturnValue(workspace);
    vi.spyOn(console, "info").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
    writeFile(
      workspace,
      "nx.json",
      JSON.stringify({
        release: { projects: ["projects/ic-suite/*/*", "!codometer-examples"] },
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(service).toBeDefined();
  });

  describe("readGroup", () => {
    it("lists each project with its directory, in two Nx calls", async () => {
      expect.hasAssertions();

      const { runner, service: subject } = await createService(
        { [SHOW]: succeeded('["codometer-cli","codometer-core"]\n') },
        graphOf({
          "codometer-cli": "projects/ic-suite/codometer/cli",
          "codometer-core": "projects/ic-suite/codometer/core",
        }),
      );

      expect(subject.readGroup()).toStrictEqual([
        { project: "codometer-cli", root: "projects/ic-suite/codometer/cli" },
        { project: "codometer-core", root: "projects/ic-suite/codometer/core" },
      ]);
      expect(runner.lines).toHaveLength(2);
    });

    it("fails when Nx cannot write the graph", async () => {
      expect.hasAssertions();

      const { service: subject } = await createService({
        "pnpm exec nx graph *": failed("graph failed"),
      });

      expect(() => subject.readGroup()).toThrow(
        "❌ Could not read the Nx release group",
      );
    });

    it("fails when Nx cannot list the group", async () => {
      expect.hasAssertions();

      const { service: subject } = await createService({ [SHOW]: failed() });

      expect(() => subject.readGroup()).toThrow(
        "❌ Could not read the Nx release group",
      );
    });

    it("fails when a project has no directory in the graph", async () => {
      expect.hasAssertions();

      const { service: subject } = await createService({
        [SHOW]: succeeded('["codometer-cli","missing"]'),
      });

      expect(() => subject.readGroup()).toThrow(
        "❌ Could not read the Nx release group",
      );
    });

    it("fails rather than return an empty group", async () => {
      expect.hasAssertions();

      const { service: subject } = await createService({
        [SHOW]: succeeded("[]"),
      });

      expect(() => subject.readGroup()).toThrow(
        "❌ Could not read the Nx release group",
      );
    });
  });

  describe("manifests", () => {
    it("reads the name and version of a package", async () => {
      expect.hasAssertions();

      writeFile(
        workspace,
        "projects/ic-suite/codometer/cli/package.json",
        JSON.stringify({ name: "@codometer/cli", version: "1.2.3" }),
      );
      const { service: subject } = await createService({});

      expect(subject.specifier("projects/ic-suite/codometer/cli")).toBe(
        "@codometer/cli@1.2.3",
      );
    });
  });

  describe("npm", () => {
    it("asks npmjs.org by default", async () => {
      expect.hasAssertions();

      vi.stubEnv("NPM_REGISTRY", undefined);
      const { runner, service: subject } = await createService({
        "npm view a@1.0.0 version --registry https://registry.npmjs.org":
          succeeded("1.0.0\n"),
      });

      await expect(subject.isOnNpm("a@1.0.0")).resolves.toBe(true);
      expect(runner.captured).toHaveLength(1);
    });

    it("asks the configured registry, without its trailing slash", async () => {
      expect.hasAssertions();

      vi.stubEnv("NPM_REGISTRY", "http://localhost:4873/");
      const { service: subject } = await createService({
        "npm view a@1.0.0 version --registry http://localhost:4873":
          failed("E404"),
      });

      await expect(subject.isOnNpm("a@1.0.0")).resolves.toBe(false);
      expect(subject.npmRegistry()).toBe("http://localhost:4873");
    });
  });

  describe("runInParallel", () => {
    it("prints each call's lines whole, in item order", async () => {
      expect.hasAssertions();

      const { service: subject } = await createService({});
      const task = async (delay: number): Promise<ParallelOutcome> => {
        await new Promise((resolve) => {
          setTimeout(resolve, delay);
        });

        return {
          lines: [`${String(delay)}a`, `${String(delay)}b`],
          succeeded: true,
        };
      };

      await expect(subject.runInParallel([20, 0, 10], task)).resolves.toBe(
        true,
      );
      expect(reportLines).toStrictEqual([
        "20a",
        "20b",
        "0a",
        "0b",
        "10a",
        "10b",
      ]);
    });

    it("runs at most six calls at once", async () => {
      expect.hasAssertions();

      const { service: subject } = await createService({});
      let running = 0;
      let most = 0;
      const task = async (): Promise<ParallelOutcome> => {
        running += 1;
        most = Math.max(most, running);
        await new Promise((resolve) => {
          setTimeout(resolve, 1);
        });
        running -= 1;

        return { lines: [], succeeded: true };
      };

      await subject.runInParallel(Array.from({ length: 14 }, String), task);

      expect(most).toBe(6);
    });

    it("finishes every call and fails when any failed or threw", async () => {
      expect.hasAssertions();

      const { service: subject } = await createService({});
      const task = async (item: string): Promise<ParallelOutcome> => {
        await Promise.resolve();

        if (item === "throws") {
          throw new Error("💥 exploded");
        }

        return { lines: [item], succeeded: item !== "fails" };
      };

      await expect(
        subject.runInParallel(["first", "fails", "throws", "last"], task),
      ).resolves.toBe(false);
      expect(reportLines).toStrictEqual([
        "first",
        "fails",
        "💥 exploded",
        "last",
      ]);
    });
  });
});

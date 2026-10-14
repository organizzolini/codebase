import fs from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
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

import { LoggerService } from "@codebase/logging";

import {
  failed,
  FakeProcessRunner,
  succeeded,
  useTemporaryDirectories,
  writeFile,
} from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReleaseGroupService } from "../release-group/release-group.service";

import { PublishPackagesCommand } from "./publish-packages.command";
import { PublishPackagesService } from "./publish-packages.service";

import type { ScriptedAnswer } from "../../../testing/mocks";
import type { CapturedProcess } from "../process-runner/process-runner.types";

const PUBLISH =
  "pnpm -r --filter ./projects/ic-suite/tool/cli --filter ./projects/ic-suite/tool/core publish --provenance --no-git-checks --tag latest --registry https://registry.npmjs.org --report-summary";

const MIRROR_REGISTRY = "https://npm.pkg.github.com";

/** The packages in the temporary workspace, by project. */
const PACKAGES: Readonly<Record<string, string>> = {
  cli: "1.0.0",
  core: "2.0.0",
};

describe(PublishPackagesCommand, () => {
  const originalExitCode = process.exitCode;
  const makeDirectory = useTemporaryDirectories();
  let command: PublishPackagesCommand;
  let home: string;
  let reportLines: string[];
  let runnerTemp: string;
  let workspace: string;

  /** Answers the release group and every mirror lookup as not yet mirrored. */
  const script = (): Record<string, ScriptedAnswer<CapturedProcess>> => ({
    "npm publish *": succeeded("+ published\n"),
    "npm view *": failed("E404"),
    "pnpm --dir *": succeeded(),
    "pnpm exec nx graph *": succeeded(),
    "pnpm exec nx show projects --projects projects/ic-suite/*/* --json":
      succeeded(JSON.stringify(Object.keys(PACKAGES))),
    "tar -xzf *": succeeded(),
  });

  /** Writes pnpm's summary, as a publish of the given specifiers would. */
  const summarizing = (published: Record<string, string>) => (): void => {
    writeFile(
      workspace,
      "pnpm-publish-summary.json",
      JSON.stringify({
        publishedPackages: Object.entries(published).map(([name, version]) => ({
          name,
          version,
        })),
      }),
    );
  };

  /** Runs the command over the real services and a scripted process runner. */
  const runCommand = async (runner: FakeProcessRunner): Promise<void> => {
    runner.effects["pnpm exec nx graph *"] = (args): void => {
      fs.writeFileSync(
        String(args.at(-1)).replace("--file=", ""),
        JSON.stringify({
          graph: {
            nodes: Object.fromEntries(
              Object.keys(PACKAGES).map((project) => [
                project,
                { data: { root: `projects/ic-suite/tool/${project}` } },
              ]),
            ),
          },
        }),
      );
    };
    runner.effects["tar -xzf *"] = (args): void => {
      const unpacked = String(args[3]);
      const project = path.basename(unpacked);
      writeFile(
        unpacked,
        "package.json",
        JSON.stringify({
          name: `@tool/${project}`,
          publishConfig: { registry: "https://registry.npmjs.org/" },
          version: PACKAGES[project],
        }),
      );
    };
    const module = await Test.createTestingModule({
      providers: [
        PublishPackagesCommand,
        PublishPackagesService,
        ReleaseGroupService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();
    const subject = await module.resolve(PublishPackagesCommand);

    await subject.run();
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PublishPackagesCommand,
        {
          provide: PublishPackagesService,
          useValue: createMock<PublishPackagesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(PublishPackagesCommand);
  });

  beforeEach(() => {
    process.exitCode = undefined;
    reportLines = [];
    workspace = makeDirectory();
    home = makeDirectory();
    runnerTemp = makeDirectory();
    vi.spyOn(process, "cwd").mockReturnValue(workspace);
    writeFile(
      workspace,
      "nx.json",
      JSON.stringify({ release: { projects: ["projects/ic-suite/*/*"] } }),
    );
    for (const [project, version] of Object.entries(PACKAGES)) {
      writeFile(
        workspace,
        `projects/ic-suite/tool/${project}/package.json`,
        JSON.stringify({ name: `@tool/${project}`, version }),
      );
    }
    // The user config is written beneath HOME, so never the developer's own.
    vi.stubEnv("HOME", home);
    vi.stubEnv("GITHUB_PACKAGES_REGISTRY", undefined);
    vi.stubEnv("GITHUB_PACKAGES_TOKEN", "packages-token");
    vi.stubEnv("GITHUB_REPOSITORY_OWNER", "Owner");
    vi.stubEnv("NPM_REGISTRY", undefined);
    vi.stubEnv("NPM_TOKEN", "npm-token");
    vi.stubEnv("RUNNER_TEMP", runnerTemp);
    vi.spyOn(console, "info").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
    vi.spyOn(console, "error").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.exitCode = originalExitCode;
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        PublishPackagesCommand,
        {
          provide: PublishPackagesService,
          useValue: createMock<PublishPackagesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("PublishPackagesCommand");
  });

  it("publishes to npm, records what pnpm published, then mirrors", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(script());
    runner.effects[PUBLISH] = summarizing({ "@tool/cli": "1.0.0" });
    await runCommand(runner);

    expect(
      runner.streamed.map(({ args }) => `pnpm ${args.join(" ")}`),
    ).toStrictEqual([PUBLISH]);
    expect(fs.readFileSync(path.join(home, ".npmrc"), "utf8")).toBe(
      `//registry.npmjs.org/:_authToken=npm-token\n//${MIRROR_REGISTRY.replace("https://", "")}/:_authToken=packages-token\n`,
    );
    expect(
      fs.readFileSync(path.join(runnerTemp, "newly-published.txt"), "utf8"),
    ).toBe("@tool/cli@1.0.0\n");
    expect(
      fs.existsSync(path.join(workspace, "pnpm-publish-summary.json")),
    ).toBe(false);
    expect(
      JSON.parse(
        fs.readFileSync(
          path.join(runnerTemp, "github-packages/core/package.json"),
          "utf8",
        ),
      ),
    ).toStrictEqual({ name: "@owner/core", version: "2.0.0" });
    expect(runner.lines).toContain(
      `pnpm --dir projects/ic-suite/tool/cli pack --out ${path.join(runnerTemp, "github-packages/cli.tgz")}`,
    );
    expect(runner.lines).toContain(
      `npm publish ${path.join(runnerTemp, "github-packages/cli")} --ignore-scripts --registry ${MIRROR_REGISTRY}`,
    );
    expect(reportLines).toStrictEqual([
      "📦 Publishing the release group to npm",
      "🐙 Mirroring @tool/cli@1.0.0 to GitHub Packages as @owner/cli",
      "+ published",
      "🐙 Mirroring @tool/core@2.0.0 to GitHub Packages as @owner/core",
      "+ published",
    ]);
    expect(process.exitCode).toBe(0);
  });

  it("skips a mirror GitHub Packages already has", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...script(),
      [`npm view @owner/cli@1.0.0 version --registry ${MIRROR_REGISTRY}`]:
        succeeded("1.0.0\n"),
    });
    await runCommand(runner);

    expect(reportLines).toContain(
      "🐙 @owner/cli@1.0.0 is already on GitHub Packages",
    );
    expect(
      runner.lines.filter((line) => line.startsWith("npm publish")),
    ).toHaveLength(1);
    expect(
      fs.readFileSync(path.join(runnerTemp, "newly-published.txt"), "utf8"),
    ).toBe("");
    expect(process.exitCode).toBe(0);
  });

  it("records a partial publish and mirrors nothing when npm fails", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(script(), 0, { [PUBLISH]: 1 });
    runner.effects[PUBLISH] = summarizing({ "@tool/core": "2.0.0" });
    await runCommand(runner);

    expect(
      fs.readFileSync(path.join(runnerTemp, "newly-published.txt"), "utf8"),
    ).toBe("@tool/core@2.0.0\n");
    expect(runner.lines.some((line) => line.startsWith("npm view"))).toBe(
      false,
    );
    expect(process.exitCode).toBe(1);
  });

  it("publishes to the configured registries when rehearsing", async () => {
    expect.hasAssertions();

    vi.stubEnv("NPM_REGISTRY", "http://localhost:4873/");
    vi.stubEnv("GITHUB_PACKAGES_REGISTRY", "http://localhost:4873");
    const runner = new FakeProcessRunner(script());
    await runCommand(runner);

    expect(runner.lines).toContain(
      PUBLISH.replace("https://registry.npmjs.org", "http://localhost:4873"),
    );
    expect(fs.readFileSync(path.join(home, ".npmrc"), "utf8")).toBe(
      "//localhost:4873/:_authToken=npm-token\n//localhost:4873/:_authToken=packages-token\n",
    );
  });

  it("mirrors every package and fails when any mirror failed", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...script(),
      "pnpm --dir projects/ic-suite/tool/cli *": failed("pack failed\n"),
      "tar -xzf *": [failed("tar failed\n")],
    });
    await runCommand(runner);

    expect(reportLines).toStrictEqual([
      "📦 Publishing the release group to npm",
      "pack failed",
      "tar failed",
    ]);
    expect(process.exitCode).toBe(1);
  });

  it("fails when a mirror cannot be published", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...script(),
      "npm publish *": failed("E403 forbidden\n"),
    });
    await runCommand(runner);

    expect(reportLines).toContain("E403 forbidden");
    expect(process.exitCode).toBe(1);
  });

  it("fails, naming the variable, before publishing anything", async () => {
    expect.hasAssertions();

    vi.stubEnv("NPM_TOKEN", "");
    const runner = new FakeProcessRunner({});
    await runCommand(runner);

    expect(reportLines).toStrictEqual(["❌ NPM_TOKEN is unset"]);
    expect(runner.lines).toHaveLength(0);
    expect(fs.existsSync(path.join(home, ".npmrc"))).toBe(false);
    expect(process.exitCode).toBe(1);
  });
});

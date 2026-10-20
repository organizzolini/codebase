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

import { LoggerService } from "@codebase/observability";

import {
  failed,
  FakeProcessRunner,
  succeeded,
  useTemporaryDirectories,
  writeFile,
} from "../../../testing/mocks";
import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReleaseGroupService } from "../release-group/release-group.service";
import { TagPackagesService } from "../tag-packages/tag-packages.service";

import { VersionPackagesCommand } from "./version-packages.command";
import { VersionPackagesService } from "./version-packages.service";

import type { ScriptedAnswer } from "../../../testing/mocks";
import type { CapturedProcess } from "../process-runner/process-runner.types";

const SET_URL =
  "git remote set-url origin https://x-access-token:secret@github.com/owner/codebase.git";

const NX_RELEASE = "env NX_DAEMON=false pnpm exec nx release --skip-publish";

const NXIGNORE = "node_modules\n";

const ROOT = "projects/ic-suite/tool/bumped";

describe(VersionPackagesCommand, () => {
  const originalExitCode = process.exitCode;
  let command: VersionPackagesCommand;
  const makeDirectory = useTemporaryDirectories();
  let environmentFile: string;
  let reportLines: string[];
  let workspace: string;

  /** Answers the remote, the step-aside check, and one package's tagging. */
  const script = (
    tip: string,
  ): Record<string, ScriptedAnswer<CapturedProcess>> => ({
    "git diff --cached --quiet": succeeded(),
    "git fetch --quiet origin main": succeeded(),
    "git rev-parse --quiet --verify refs/tags/bumped@1.0.0": failed(),
    "git rev-parse --short base": succeeded("base\n"),
    "git rev-parse --short FETCH_HEAD": succeeded(`${tip}\n`),
    "git rev-parse FETCH_HEAD": succeeded(`${tip}\n`),
    "git rev-parse HEAD": succeeded("base\n"),
    "git tag --list bumped@*": succeeded("bumped@0.9.0\n"),
    "pnpm exec nx graph *": succeeded(),
    "pnpm exec nx show projects --projects projects/ic-suite/*/* --json":
      succeeded('["bumped"]'),
    [SET_URL]: succeeded(),
  });

  /** Runs the command over the real services and a scripted process runner. */
  const runCommand = async (runner: FakeProcessRunner): Promise<void> => {
    runner.effects["pnpm exec nx graph *"] = (args): void => {
      fs.writeFileSync(
        String(args.at(-1)).replace("--file=", ""),
        JSON.stringify({
          graph: { nodes: { bumped: { data: { root: ROOT } } } },
        }),
      );
    };
    const module = await Test.createTestingModule({
      providers: [
        MainTipService,
        ReleaseGroupService,
        TagPackagesService,
        VersionPackagesCommand,
        VersionPackagesService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();

    const subject = await module.resolve(VersionPackagesCommand);

    await subject.run();
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VersionPackagesCommand,
        {
          provide: VersionPackagesService,
          useValue: createMock<VersionPackagesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(VersionPackagesCommand);
  });

  beforeEach(() => {
    process.exitCode = undefined;
    reportLines = [];
    workspace = makeDirectory();
    vi.spyOn(process, "cwd").mockReturnValue(workspace);
    writeFile(
      workspace,
      "nx.json",
      JSON.stringify({ release: { projects: ["projects/ic-suite/*/*"] } }),
    );
    writeFile(
      workspace,
      `${ROOT}/package.json`,
      JSON.stringify({ name: "@tool/bumped", version: "1.0.0" }),
    );
    writeFile(workspace, ".nxignore", NXIGNORE);
    environmentFile = path.join(workspace, "github-env");
    fs.writeFileSync(environmentFile, "");
    vi.stubEnv("GITHUB_ENV", environmentFile);
    vi.stubEnv("GITHUB_REPOSITORY", "owner/codebase");
    vi.stubEnv("GITHUB_TOKEN", "secret");
    vi.stubEnv("PUSH_RETRY_DELAY", "0");
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
        VersionPackagesCommand,
        {
          provide: VersionPackagesService,
          useValue: createMock<VersionPackagesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("VersionPackagesCommand");
  });

  it("points the remote at the token, pushes missing tags, then versions", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(script("base"), 0, {
      [NX_RELEASE]: 3,
    });
    await runCommand(runner);

    expect(runner.lines[0]).toBe(SET_URL);
    expect(
      runner.lines.filter(
        (line) =>
          line.startsWith("git push") ||
          line.startsWith("env NX_DAEMON=false pnpm exec nx release"),
      ),
    ).toStrictEqual(["git push origin refs/tags/bumped@1.0.0", NX_RELEASE]);
    expect(process.exitCode).toBe(3);
  });

  it("ignores the configuration project for the release, then restores .nxignore", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(script("base"), 0, {
      [NX_RELEASE]: 2,
    });
    let duringRelease = "";
    runner.effects[NX_RELEASE] = (): void => {
      duringRelease = fs.readFileSync(
        path.join(workspace, ".nxignore"),
        "utf8",
      );
    };
    await runCommand(runner);

    expect(duringRelease).toBe(
      `${NXIGNORE}\n# Added by the publication version-packages command for the release only.\nconfiguration/\n`,
    );
    expect(fs.readFileSync(path.join(workspace, ".nxignore"), "utf8")).toBe(
      NXIGNORE,
    );
    expect(process.exitCode).toBe(2);
  });

  it("steps aside before tagging or versioning when main has moved", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(script("newer"));
    await runCommand(runner);

    expect(runner.streamed).toHaveLength(0);
    expect(fs.readFileSync(environmentFile, "utf8")).toBe(
      "RELEASE_SUPERSEDED=true\n",
    );
    expect(process.exitCode).toBe(0);
  });

  it("does not version when the missing tags cannot be pushed", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(script("base"), 0, {
      "git push origin refs/tags/bumped@1.0.0": 1,
    });
    await runCommand(runner);

    expect(runner.lines).not.toContain(NX_RELEASE);
    expect(process.exitCode).toBe(1);
  });

  it("fails, naming the variable, when the token is unset", async () => {
    expect.hasAssertions();

    vi.stubEnv("GITHUB_TOKEN", "");
    const runner = new FakeProcessRunner({});
    await runCommand(runner);

    expect(reportLines).toStrictEqual(["❌ GITHUB_TOKEN is unset"]);
    expect(runner.lines).toHaveLength(0);
    expect(process.exitCode).toBe(1);
  });

  it("fails, naming the variable, when the repository is unset", async () => {
    expect.hasAssertions();

    vi.stubEnv("GITHUB_REPOSITORY", undefined);
    await runCommand(new FakeProcessRunner({}));

    expect(reportLines).toStrictEqual(["❌ GITHUB_REPOSITORY is unset"]);
    expect(process.exitCode).toBe(1);
  });

  it("fails without printing the token when the remote cannot be set", async () => {
    expect.hasAssertions();

    await runCommand(
      new FakeProcessRunner({ [SET_URL]: failed("no such remote", 2) }),
    );

    expect(reportLines).toStrictEqual([
      "❌ git remote set-url origin exited 2: no such remote",
    ]);
    expect(process.exitCode).toBe(1);
  });
});

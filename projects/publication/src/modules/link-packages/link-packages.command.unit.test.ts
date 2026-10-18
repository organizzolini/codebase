import { hash } from "node:crypto";
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

import { LinkPackagesCommand } from "./link-packages.command";
import { LinkPackagesService } from "./link-packages.service";

import type { ScriptedAnswer } from "../../../testing/mocks";
import type { CapturedProcess } from "../process-runner/process-runner.types";

/** The packages in the temporary workspace, by project. */
const PACKAGES = { cli: "1.0.0", core: "2.0.0", fresh: "0.1.0" };

const CREATE_RECORD =
  "gh api --method POST orgs/owner/artifacts/metadata/storage-record --input *";

/** What npm serves as the given package's tarball, in these tests. */
const tarballOf = (project: string): string => `tarball of ${project}`;

/** The tarball URL npm metadata lists for the given package and version. */
const tarballUrlOf = (
  project: string,
  version: string,
  registry: string,
): string => `${registry}@tool/${project}/-/${project}-${version}.tgz`;

/** The sha256 checksum of the given package's tarball. */
const checksumOf = (project: string): string =>
  hash("sha256", tarballOf(project));

/** The command line that asks for a digest's storage records. */
const recordsLine = (project: string): string =>
  `gh api orgs/owner/artifacts/sha256:${checksumOf(project)}/metadata/storage-records`;

describe(LinkPackagesCommand, () => {
  const originalExitCode = process.exitCode;
  const makeDirectory = useTemporaryDirectories();
  let command: LinkPackagesCommand;
  let recordBodies: unknown[];
  let outputFile: string;
  let reportLines: string[];
  let runnerTemp: string;
  let workspace: string;

  /**
   * Answers the release group: `cli` published by this run, `core` already
   * on npm and linked, `fresh` on neither.
   */
  const script = (): Record<string, ScriptedAnswer<CapturedProcess>> => ({
    [CREATE_RECORD]: succeeded("{}"),
    "curl *": succeeded(),
    "npm view @tool/cli@1.0.0 dist.tarball --registry https://registry.npmjs.org/":
      succeeded(
        `${tarballUrlOf("cli", "1.0.0", "https://registry.npmjs.org/")}\n`,
      ),
    "npm view @tool/core@2.0.0 dist.tarball --registry https://registry.npmjs.org/":
      succeeded(
        `${tarballUrlOf("core", "2.0.0", "https://registry.npmjs.org/")}\n`,
      ),
    "npm view @tool/core@2.0.0 version --registry https://registry.npmjs.org":
      succeeded("2.0.0\n"),
    "npm view @tool/fresh@0.1.0 version --registry https://registry.npmjs.org":
      failed("E404"),
    "pnpm exec nx graph *": succeeded(),
    "pnpm exec nx show projects --projects projects/ic-suite/*/* --json":
      succeeded(JSON.stringify(Object.keys(PACKAGES))),
    [recordsLine("cli")]: { status: 1, stderr: "HTTP 404", stdout: "{}" },
    [recordsLine("core")]: succeeded(
      JSON.stringify({
        storage_records: [{ registry_url: "https://registry.npmjs.org/" }],
      }),
    ),
  });

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
    runner.effects[CREATE_RECORD] = (args): void => {
      recordBodies.push(
        JSON.parse(fs.readFileSync(String(args.at(-1)), "utf8")),
      );
    };
    runner.effects["curl *"] = (args): void => {
      const output = String(args[args.indexOf("--output") + 1]);
      const project = /\/-\/(?<project>[a-z]+)-/v.exec(String(args.at(-1)))
        ?.groups?.["project"];
      fs.writeFileSync(output, tarballOf(String(project)));
    };
    const module = await Test.createTestingModule({
      providers: [
        LinkPackagesCommand,
        LinkPackagesService,
        ReleaseGroupService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    }).compile();
    const subject = await module.resolve(LinkPackagesCommand);

    await subject.run();
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LinkPackagesCommand,
        {
          provide: LinkPackagesService,
          useValue: createMock<LinkPackagesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(LinkPackagesCommand);
  });

  beforeEach(() => {
    process.exitCode = undefined;
    recordBodies = [];
    reportLines = [];
    workspace = makeDirectory();
    runnerTemp = makeDirectory();
    outputFile = path.join(runnerTemp, "github-output");
    fs.writeFileSync(outputFile, "");
    fs.writeFileSync(
      path.join(runnerTemp, "newly-published.txt"),
      "@tool/cli@1.0.0\n",
    );
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
    vi.stubEnv("GITHUB_OUTPUT", outputFile);
    vi.stubEnv("GITHUB_REPOSITORY", "owner/codebase");
    vi.stubEnv("GITHUB_REPOSITORY_OWNER", "owner");
    vi.stubEnv("NPM_REGISTRY", undefined);
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
        LinkPackagesCommand,
        {
          provide: LinkPackagesService,
          useValue: createMock<LinkPackagesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("LinkPackagesCommand");
  });

  it("links what has no record and lists only this run's packages to attest", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner(script());
    await runCommand(runner);

    expect(reportLines).toStrictEqual([
      "🔗 Linking @tool/cli@1.0.0 to owner/codebase",
      "🔗 @tool/core@2.0.0 is already linked",
    ]);
    expect(
      fs.readFileSync(
        path.join(runnerTemp, "attestation-subjects.txt"),
        "utf8",
      ),
    ).toBe(`${checksumOf("cli")}  @tool/cli@1.0.0\n`);
    expect(fs.readFileSync(outputFile, "utf8")).toBe("attest=true\n");
    expect(
      runner.lines.some((line) => line.startsWith("npm view @tool/cli@1.0.0")),
    ).toBe(true);
    expect(runner.lines.find((line) => line.startsWith("curl"))).toBe(
      `curl --silent --show-error --fail --location --retry 48 --retry-all-errors --retry-delay 10 --retry-max-time 480 --output ${String(runner.captured.find(({ executable }) => executable === "curl")?.args.at(-2))} ${tarballUrlOf("cli", "1.0.0", "https://registry.npmjs.org/")}`,
    );
    expect(recordBodies).toStrictEqual([
      {
        artifact_url: "https://www.npmjs.com/package/@tool/cli/v/1.0.0",
        digest: `sha256:${checksumOf("cli")}`,
        github_repository: "codebase",
        name: "@tool/cli",
        registry_url: "https://registry.npmjs.org/",
        status: "active",
        version: "1.0.0",
      },
    ]);
    expect(fs.readdirSync(runnerTemp).toSorted()).toStrictEqual([
      "attestation-subjects.txt",
      "github-output",
      "newly-published.txt",
    ]);
    expect(process.exitCode).toBe(0);
  });

  it("sets no output when nothing was published by this run", async () => {
    expect.hasAssertions();

    fs.rmSync(path.join(runnerTemp, "newly-published.txt"));
    const runner = new FakeProcessRunner({
      ...script(),
      "npm view @tool/cli@1.0.0 version --registry https://registry.npmjs.org":
        failed("E404"),
    });
    await runCommand(runner);

    expect(reportLines).toStrictEqual([
      "🔗 @tool/core@2.0.0 is already linked",
    ]);
    expect(fs.readFileSync(outputFile, "utf8")).toBe("");
    expect(process.exitCode).toBe(0);
  });

  it("still lists the others to attest when one package fails to link", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...script(),
      [CREATE_RECORD]: failed("HTTP 422\n"),
      [recordsLine("core")]: succeeded("not json"),
    });
    await runCommand(runner);

    expect(reportLines).toStrictEqual([
      "🔗 Linking @tool/cli@1.0.0 to owner/codebase",
      "❌ @tool/cli@1.0.0: HTTP 422",
      "🔗 Linking @tool/core@2.0.0 to owner/codebase",
      "❌ @tool/core@2.0.0: HTTP 422",
    ]);
    expect(fs.readFileSync(outputFile, "utf8")).toBe("attest=true\n");
    expect(process.exitCode).toBe(1);
  });

  it("fails a package whose tarball cannot be downloaded", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      ...script(),
      "curl *": failed("curl: (22) 404\n", 22),
    });
    await runCommand(runner);

    expect(reportLines).toStrictEqual([
      "❌ @tool/cli@1.0.0: curl: (22) 404",
      "❌ @tool/core@2.0.0: curl: (22) 404",
    ]);
    expect(fs.readFileSync(outputFile, "utf8")).toBe("");
    expect(process.exitCode).toBe(1);
  });

  it("records nothing on GitHub when rehearsing, but still lists what to attest", async () => {
    expect.hasAssertions();

    vi.stubEnv("NPM_REGISTRY", "http://localhost:4873");
    const runner = new FakeProcessRunner({
      ...script(),
      "npm view @tool/cli@1.0.0 dist.tarball --registry http://localhost:4873/":
        succeeded(
          `${tarballUrlOf("cli", "1.0.0", "http://localhost:4873/")}\n`,
        ),
      "npm view @tool/core@2.0.0 version --registry http://localhost:4873":
        failed(),
      "npm view @tool/fresh@0.1.0 version --registry http://localhost:4873":
        failed(),
    });
    await runCommand(runner);

    expect(runner.lines.some((line) => line.startsWith("gh "))).toBe(false);
    expect(
      runner.lines.some((line) =>
        line.endsWith("http://localhost:4873/@tool/cli/-/cli-1.0.0.tgz"),
      ),
    ).toBe(true);
    expect(reportLines).toStrictEqual([
      "🧪 @tool/cli@1.0.0 is not recorded on GitHub in a rehearsal",
    ]);
    expect(fs.readFileSync(outputFile, "utf8")).toBe("attest=true\n");
    expect(process.exitCode).toBe(0);
  });

  it("fails, naming the variable, before reading the group", async () => {
    expect.hasAssertions();

    vi.stubEnv("GITHUB_OUTPUT", undefined);
    const runner = new FakeProcessRunner({});
    await runCommand(runner);

    expect(reportLines).toStrictEqual(["❌ GITHUB_OUTPUT is unset"]);
    expect(runner.lines).toHaveLength(0);
    expect(process.exitCode).toBe(1);
  });
});

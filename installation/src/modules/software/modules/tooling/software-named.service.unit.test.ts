import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ConfigService } from "@nestjs/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { createFakeProcessRunner } from "../../../../../testing/fake-process-runner";
import { ProcessRunnerService } from "../../../process-runner/process-runner.service";
import { ReleaseArchivesService } from "../../../release-archives/release-archives.service";

import { SoftwareDatabaseService } from "./software-database.service";
import { SoftwareGoToolsService } from "./software-go-tools.service";
import { SoftwareHelmPluginsService } from "./software-helm-plugins.service";
import { SoftwareNamedService } from "./software-named.service";

import type { FakeMachine } from "../../../../../testing/fake-process-runner";
import type { ReleaseArchiveTool } from "../../../release-archives/release-archives.types";

const BINARY_DIRECTORY = path.join(os.homedir(), ".local", "bin");

describe(SoftwareNamedService, () => {
  const originalPath = process.env["PATH"];
  const install = vi.fn<ReleaseArchivesService["install"]>();
  const installPostgres = vi.fn<SoftwareDatabaseService["installPostgres"]>();
  const installGoTool = vi.fn<SoftwareGoToolsService["install"]>();
  const installHelmPlugin = vi.fn<SoftwareHelmPluginsService["install"]>();
  /** Builds the service over a fake machine, path variable only. */
  const build = async (
    environment: Record<string, string> = {},
    machine: FakeMachine = {},
  ): Promise<SoftwareNamedService> => {
    vi.unstubAllEnvs();
    vi.stubEnv("GITHUB_PATH", undefined);
    for (const [name, value] of Object.entries(environment)) {
      vi.stubEnv(name, value);
    }

    const { runner } = createFakeProcessRunner({
      platform: "linux",
      ...machine,
    });
    const { module } = await buildTestingModule(SoftwareNamedService, {
      providers: [
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: ReleaseArchivesService, useValue: { install } },
        { provide: SoftwareDatabaseService, useValue: { installPostgres } },
        {
          provide: SoftwareGoToolsService,
          useValue: { install: installGoTool },
        },
        {
          provide: SoftwareHelmPluginsService,
          useValue: { install: installHelmPlugin },
        },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    });

    return module.resolve(SoftwareNamedService);
  };

  /** The names of the archive tools `install` was asked for, in order. */
  const installedNames = (): string[] =>
    install.mock.calls.map(([tool]: [ReleaseArchiveTool]) => tool.name);

  beforeEach(() => {
    install.mockReset();
    installPostgres.mockReset();
    installGoTool.mockReset();
    installHelmPlugin.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env["PATH"] = originalPath;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SoftwareNamedService, {
      mocks: [
        ConfigService,
        ReleaseArchivesService,
        SoftwareDatabaseService,
        SoftwareGoToolsService,
        SoftwareHelmPluginsService,
        ProcessRunnerService,
      ],
    });

    expect(instance).toBeInstanceOf(SoftwareNamedService);
  });

  it("fails on a name that is not software, before installing any", async () => {
    expect.hasAssertions();

    const subject = await build();

    expect(() => {
      subject.install(["gitleaks", "git"]);
    }).toThrow("Unknown software git");
    expect(install).not.toHaveBeenCalled();
  });

  it("accepts every tool software installs from a release archive", async () => {
    expect.hasAssertions();

    const subject = await build();

    subject.install(["helm", "kubectl", "terraform", "uv"]);

    expect(installedNames()).toStrictEqual([
      "helm",
      "kubectl",
      "terraform",
      "uv",
    ]);
  });

  it("installs the helm-unittest plugin by name", async () => {
    expect.hasAssertions();

    const subject = await build();

    subject.install(["helm-unittest"]);

    expect(installHelmPlugin).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ name: "unittest", version: "1.2.1" }),
    );
  });

  it("refuses a release archive tool on a Mac, where Homebrew installs it", async () => {
    expect.hasAssertions();

    const subject = await build({}, { platform: "darwin" });

    expect(() => {
      subject.install(["trivy"]);
    }).toThrow("run software with no names");
    expect(install).not.toHaveBeenCalled();
  });

  it("installs the PostgreSQL client on a Mac too", async () => {
    expect.hasAssertions();

    const subject = await build(
      {},
      {
        platform: "darwin",
        responses: {
          "pg_dump --version": { stdout: "pg_dump (PostgreSQL) 18.6\n" },
        },
      },
    );

    subject.install(["postgres-client"]);

    expect(installPostgres).toHaveBeenCalledTimes(1);
  });

  it("installs gitleaks and Trivy from their release archives, in the order named", async () => {
    expect.hasAssertions();

    const subject = await build();

    subject.install(["trivy", "gitleaks"]);

    expect(installedNames()).toStrictEqual(["trivy", "gitleaks"]);
    expect(installPostgres).not.toHaveBeenCalled();
  });

  it("builds the Go linters it is asked for, and no archive tool", async () => {
    expect.hasAssertions();

    const subject = await build();

    subject.install(["kubeconform", "actionlint", "kubeconform"]);

    expect(installGoTool.mock.calls.map(([tool]) => tool.name)).toStrictEqual([
      "kubeconform",
      "actionlint",
    ]);
    expect(install).not.toHaveBeenCalled();
  });

  it("expands a project group into the tools that project's targets need", async () => {
    expect.hasAssertions();

    const subject = await build();

    subject.install(["configuration", "infrastructure"]);

    expect(installedNames()).toStrictEqual(["gitleaks", "trivy"]);
    expect(installGoTool.mock.calls.map(([tool]) => tool.name)).toStrictEqual([
      "actionlint",
      "kubeconform",
      "kube-linter",
      "pluto",
    ]);
  });

  it("installs the PostgreSQL client for the persistence group", async () => {
    expect.hasAssertions();

    const subject = await build(
      {},
      {
        responses: {
          "pg_dump --version": { stdout: "pg_dump (PostgreSQL) 18.6\n" },
        },
      },
    );

    subject.install(["persistence"]);

    expect(installPostgres).toHaveBeenCalledTimes(1);
  });

  it("installs a tool named twice once", async () => {
    expect.hasAssertions();

    const subject = await build();

    subject.install(["gitleaks", "gitleaks"]);

    expect(installedNames()).toStrictEqual(["gitleaks"]);
  });

  it("installs PostgreSQL 18 and checks that 18's pg_dump is the one found", async () => {
    expect.hasAssertions();

    const subject = await build(
      {},
      {
        responses: {
          "pg_dump --version": { stdout: "pg_dump (PostgreSQL) 18.6\n" },
        },
      },
    );

    subject.install(["postgres-client"]);

    expect(installPostgres).toHaveBeenCalledTimes(1);
    expect(install).not.toHaveBeenCalled();
  });

  it("fails when the pg_dump found first is not 18", async () => {
    expect.hasAssertions();

    const subject = await build(
      {},
      {
        responses: {
          "pg_dump --version": { stdout: "pg_dump (PostgreSQL) 16.4\n" },
        },
      },
    );

    expect(() => {
      subject.install(["postgres-client"]);
    }).toThrow("pg_dump is not PostgreSQL 18");
  });

  it("puts the install directory first on PATH, and in the file Actions reads", async () => {
    expect.hasAssertions();

    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "software-"));
    const pathFile = path.join(directory, "github-path");
    const subject = await build({ GITHUB_PATH: pathFile });

    subject.install(["gitleaks"]);

    expect(
      process.env["PATH"]?.startsWith(`${BINARY_DIRECTORY}${path.delimiter}`),
    ).toBe(true);
    expect(fs.readFileSync(pathFile, "utf8")).toBe(`${BINARY_DIRECTORY}\n`);

    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("writes no path file when none is named", async () => {
    expect.hasAssertions();

    const subject = await build();

    expect(() => {
      subject.install(["gitleaks"]);
    }).not.toThrow();
  });

  it("lets a failed install fail the run", async () => {
    expect.hasAssertions();

    install.mockImplementationOnce(() => {
      throw new Error("gitleaks does not match its published checksum");
    });

    const subject = await build();

    expect(() => {
      subject.install(["gitleaks"]);
    }).toThrow("published checksum");
  });
});

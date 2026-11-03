import fs from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { enterWorkspace } from "../../../testing/environment";
import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { captureReport } from "../../../testing/report";
import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";
import { DependenciesService } from "../dependencies/dependencies.service";
import { EnvironmentFilesService } from "../environment-files/environment-files.service";
import { LocalServicesService } from "../local-services/local-services.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReleaseArchivesService } from "../release-archives/release-archives.service";
import { ReporterService } from "../reporter/reporter.service";
import { ShellConfigurationService } from "../shell-configuration/shell-configuration.service";
import { SoftwareBrewService } from "../software/software-brew.service";
import { SoftwareDatabaseService } from "../software/software-database.service";
import { SoftwareDockerService } from "../software/software-docker.service";
import { SoftwareGpgService } from "../software/software-gpg.service";
import { SoftwareInfraService } from "../software/software-infra.service";
import { SoftwareLinuxService } from "../software/software-linux.service";
import { SoftwareOllamaService } from "../software/software-ollama.service";
import { SoftwarePythonService } from "../software/software-python.service";
import { SoftwareService } from "../software/software.service";
import { SshSigningService } from "../ssh-signing/ssh-signing.service";

import { SetupCommand } from "./setup.command";
import { SetupService } from "./setup.service";

import type { FakeMachine } from "../../../testing/fake-process-runner";
import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";

describe(SetupCommand, () => {
  const moduleOptions = { mocks: [SetupService] };

  let workspace: TemporaryWorkspace;
  let report: string[];

  /** Builds the command over every real service and the given fake machine. */
  const createCommand = async (
    machine: FakeMachine = {},
  ): Promise<{ command: SetupCommand; commands: string[] }> => {
    const { commands, runner } = createFakeProcessRunner(machine);
    const { module } = await buildTestingModule(SetupCommand, {
      providers: [
        DependenciesService,
        EnvironmentFilesService,
        ReleaseArchivesService,
        LocalServicesService,
        SetupService,
        ShellConfigurationService,
        SoftwareBrewService,
        SoftwareDatabaseService,
        SoftwareDockerService,
        SoftwareGpgService,
        SoftwareInfraService,
        SoftwareLinuxService,
        SoftwareOllamaService,
        SoftwarePythonService,
        SoftwareService,
        SshSigningService,
        ReporterService,
        { provide: ProcessRunnerService, useValue: runner },
      ],
    });

    return { command: await module.resolve(SetupCommand), commands };
  };

  beforeEach(() => {
    workspace = createTemporaryWorkspace();
    report = captureReport();
  });

  afterEach(() => {
    workspace.remove();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(SetupCommand, moduleOptions);

    expect(instance).toBeInstanceOf(SetupCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(SetupCommand, moduleOptions);
  });

  it("runs shell configuration, software, environment files, then dependencies", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/bin/zsh");
    fs.writeFileSync(path.join(workspace.root, ".env.default"), "ROOT=1\n");
    const { command: subject, commands } = await createCommand({
      responses: {
        "git ls-files --cached --others --exclude-standard -- .env.default */.env.default :!:configuration/conformetry-templates/**":
          { stdout: ".env.default\n" },
      },
    });

    await subject.run();

    expect(report.indexOf("🐚 Configuring shell...")).toBeLessThan(
      report.indexOf("🔍 Checking for uv installation..."),
    );
    expect(report.indexOf("📋 Installed tool versions:")).toBeLessThan(
      report.indexOf("🔍 Setting up environment files..."),
    );
    expect(report.indexOf("🔍 Setting up environment files...")).toBeLessThan(
      report.indexOf("📦 Installing Node dependencies..."),
    );
    expect(commands).toContain("pnpm install");
    expect(fs.existsSync(path.join(workspace.root, ".env"))).toBe(true);
  });

  it("finishes by saying how to activate the new shell configuration", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/bin/zsh");
    const { command: subject } = await createCommand();

    await subject.run();

    expect(report.slice(-5)).toStrictEqual([
      "🎉 Setup complete! All tools and shell configuration are ready.",
      "   New terminal windows will automatically have all tools available.",
      "",
      "   To activate in this terminal, run:",
      "   source ~/.zshrc",
    ]);
  });

  it("leaves out the activation hint for a shell it does not configure", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/usr/bin/fish");
    const { command: subject } = await createCommand();

    await subject.run();

    expect(report.at(-1)).toBe(
      "   New terminal windows will automatically have all tools available.",
    );
  });

  it("treats an unset shell as one it does not configure", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace);
    vi.stubEnv("SHELL", undefined);
    const { command: subject } = await createCommand();

    await subject.run();

    expect(report.at(-1)).toBe(
      "   New terminal windows will automatically have all tools available.",
    );
  });

  it("does not report completion when a step fails", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/bin/zsh");
    const { command: subject } = await createCommand({
      responses: { "pnpm install": { status: 1 } },
    });

    await expect(subject.run()).rejects.toThrow("`pnpm install` failed");

    expect(report).not.toContain(
      "🎉 Setup complete! All tools and shell configuration are ready.",
    );
  });
});

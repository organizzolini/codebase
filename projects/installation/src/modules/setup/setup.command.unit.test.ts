import fs from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
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

import { enterWorkspace } from "../../../testing/environment";
import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { captureReport } from "../../../testing/report";
import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";
import { DependenciesService } from "../dependencies/dependencies.service";
import { EnvironmentFilesService } from "../environment-files/environment-files.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";
import { ShellConfigurationService } from "../shell-configuration/shell-configuration.service";
import { SoftwareBrewService } from "../software/software-brew.service";
import { SoftwareDatabaseService } from "../software/software-database.service";
import { SoftwareDockerService } from "../software/software-docker.service";
import { SoftwareGpgService } from "../software/software-gpg.service";
import { SoftwareInfraService } from "../software/software-infra.service";
import { SoftwareOllamaService } from "../software/software-ollama.service";
import { SoftwarePythonService } from "../software/software-python.service";
import { SoftwareService } from "../software/software.service";

import { SetupCommand } from "./setup.command";
import { SetupService } from "./setup.service";

import type { FakeMachine } from "../../../testing/fake-process-runner";
import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";

describe(SetupCommand, () => {
  let command: SetupCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SetupCommand,
        { provide: SetupService, useValue: createMock<SetupService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(SetupCommand);
  });

  let workspace: TemporaryWorkspace;
  let report: string[];

  /** Builds the command over every real service and the given fake machine. */
  const createCommand = async (
    machine: FakeMachine = {},
  ): Promise<{ command: SetupCommand; commands: string[] }> => {
    const { commands, runner } = createFakeProcessRunner(machine);
    const module = await Test.createTestingModule({
      providers: [
        DependenciesService,
        EnvironmentFilesService,
        SetupCommand,
        SetupService,
        ShellConfigurationService,
        SoftwareBrewService,
        SoftwareDatabaseService,
        SoftwareDockerService,
        SoftwareGpgService,
        SoftwareInfraService,
        SoftwareOllamaService,
        SoftwarePythonService,
        SoftwareService,
        ReporterService,
        { provide: ProcessRunnerService, useValue: runner },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

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

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        SetupCommand,
        { provide: SetupService, useValue: createMock<SetupService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("SetupCommand");
  });

  it("runs shell configuration, software, environment files, then dependencies", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/bin/zsh");
    fs.writeFileSync(path.join(workspace.root, ".env.default"), "ROOT=1\n");
    const { command: subject, commands } = await createCommand({
      responses: {
        "git ls-files --cached --others --exclude-standard -- .env.default */.env.default :!:projects/configuration/conformetry-templates/**":
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

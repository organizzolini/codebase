import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { DependenciesService } from "../dependencies/dependencies.service";
import { EnvironmentFilesService } from "../environment-files/environment-files.service";
import { LocalServicesService } from "../local-services/local-services.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";
import { ShellConfigurationService } from "../shell-configuration/shell-configuration.service";
import { SoftwareService } from "../software/software.service";
import { SshSigningService } from "../ssh-signing/ssh-signing.service";

import { SetupService } from "./setup.service";

import type { DeepMocked } from "@golevelup/ts-vitest";

/** The steps a setup can run, as mocks, with the service built over them. */
interface Steps {
  dependencies: DeepMocked<DependenciesService>;
  environmentFiles: DeepMocked<EnvironmentFilesService>;
  localServices: DeepMocked<LocalServicesService>;
  service: SetupService;
  shell: DeepMocked<ShellConfigurationService>;
  software: DeepMocked<SoftwareService>;
  sshSigning: DeepMocked<SshSigningService>;
}

/** Builds the service over a machine that runs the given operating system. */
async function createSteps(platform: NodeJS.Platform): Promise<Steps> {
  const dependencies = createMock<DependenciesService>();
  const environmentFiles = createMock<EnvironmentFilesService>();
  const localServices = createMock<LocalServicesService>();
  const shell = createMock<ShellConfigurationService>();
  const software = createMock<SoftwareService>();
  const sshSigning = createMock<SshSigningService>();
  const module = await Test.createTestingModule({
    providers: [
      SetupService,
      { provide: DependenciesService, useValue: dependencies },
      { provide: EnvironmentFilesService, useValue: environmentFiles },
      { provide: LocalServicesService, useValue: localServices },
      {
        provide: ProcessRunnerService,
        useValue: createFakeProcessRunner({ platform }).runner,
      },
      { provide: ShellConfigurationService, useValue: shell },
      { provide: SoftwareService, useValue: software },
      { provide: SshSigningService, useValue: sshSigning },
      { provide: ReporterService, useValue: createMock<ReporterService>() },
      { provide: LoggerService, useValue: createMock<LoggerService>() },
    ],
  }).compile();

  return {
    dependencies,
    environmentFiles,
    localServices,
    service: await module.resolve(SetupService),
    shell,
    software,
    sshSigning,
  };
}

describe(SetupService, () => {
  let service: SetupService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SetupService,
        {
          provide: DependenciesService,
          useValue: createMock<DependenciesService>(),
        },
        {
          provide: EnvironmentFilesService,
          useValue: createMock<EnvironmentFilesService>(),
        },
        {
          provide: LocalServicesService,
          useValue: createMock<LocalServicesService>(),
        },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        {
          provide: ShellConfigurationService,
          useValue: createMock<ShellConfigurationService>(),
        },
        { provide: SoftwareService, useValue: createMock<SoftwareService>() },
        {
          provide: SshSigningService,
          useValue: createMock<SshSigningService>(),
        },
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(SetupService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("sets up a Mac with the shell, software, files, and dependencies", async () => {
    expect.hasAssertions();

    const steps = await createSteps("darwin");

    await steps.service.setUp();

    expect(steps.shell.configureShell).toHaveBeenCalledWith();
    expect(steps.software.installSoftware).toHaveBeenCalledWith();
    expect(
      steps.environmentFiles.createEnvironmentFiles,
    ).toHaveBeenCalledWith();
    expect(steps.dependencies.installDependencies).toHaveBeenCalledWith();
    expect(steps.sshSigning.configureSshSigning).not.toHaveBeenCalled();
    expect(steps.localServices.startLocalServices).not.toHaveBeenCalled();
  });

  it("sets up Linux with the files, the SSH signing, and the local services", async () => {
    expect.hasAssertions();

    const steps = await createSteps("linux");

    await steps.service.setUp();

    expect(
      steps.environmentFiles.createEnvironmentFiles,
    ).toHaveBeenCalledWith();
    expect(steps.sshSigning.configureSshSigning).toHaveBeenCalledWith();
    expect(steps.localServices.startLocalServices).toHaveBeenCalledWith();
    expect(steps.shell.configureShell).not.toHaveBeenCalled();
    expect(steps.software.installSoftware).not.toHaveBeenCalled();
    expect(steps.dependencies.installDependencies).not.toHaveBeenCalled();
  });

  it("refuses an operating system it has no steps for", async () => {
    expect.hasAssertions();

    const steps = await createSteps("win32");

    await expect(steps.service.setUp()).rejects.toThrow(
      "Unsupported operating system: win32. Use macOS or Linux.",
    );
  });
});

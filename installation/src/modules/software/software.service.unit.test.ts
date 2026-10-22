import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { HelmService } from "../helm/helm.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";
import { SshSigningService } from "../ssh-signing/ssh-signing.service";

import { SoftwareDatabaseService } from "./software-database.service";
import { SoftwareDockerService } from "./software-docker.service";
import { SoftwareGpgService } from "./software-gpg.service";
import { SoftwareInfraService } from "./software-infra.service";
import { SoftwareOllamaService } from "./software-ollama.service";
import { SoftwarePythonService } from "./software-python.service";
import { SoftwareService } from "./software.service";

import type { DeepMocked } from "@golevelup/ts-vitest";

/** The steps a software install can run, as mocks, with the service built over them. */
interface Steps {
  database: DeepMocked<SoftwareDatabaseService>;
  docker: DeepMocked<SoftwareDockerService>;
  gpg: DeepMocked<SoftwareGpgService>;
  helm: DeepMocked<HelmService>;
  infra: DeepMocked<SoftwareInfraService>;
  ollama: DeepMocked<SoftwareOllamaService>;
  python: DeepMocked<SoftwarePythonService>;
  reporter: DeepMocked<ReporterService>;
  service: SoftwareService;
  sshSigning: DeepMocked<SshSigningService>;
}

/** Builds the service over a machine that runs the given operating system. */
async function createSteps(platform: NodeJS.Platform): Promise<Steps> {
  const database = createMock<SoftwareDatabaseService>();
  const docker = createMock<SoftwareDockerService>();
  const gpg = createMock<SoftwareGpgService>();
  const helm = createMock<HelmService>();
  const infra = createMock<SoftwareInfraService>();
  const ollama = createMock<SoftwareOllamaService>();
  const python = createMock<SoftwarePythonService>();
  const reporter = createMock<ReporterService>();
  const sshSigning = createMock<SshSigningService>();
  const module = await Test.createTestingModule({
    providers: [
      SoftwareService,
      { provide: SoftwarePythonService, useValue: python },
      { provide: SoftwareOllamaService, useValue: ollama },
      { provide: SoftwareDockerService, useValue: docker },
      { provide: SoftwareGpgService, useValue: gpg },
      { provide: SoftwareInfraService, useValue: infra },
      { provide: SoftwareDatabaseService, useValue: database },
      { provide: HelmService, useValue: helm },
      { provide: SshSigningService, useValue: sshSigning },
      {
        provide: ProcessRunnerService,
        useValue: createFakeProcessRunner({ platform }).runner,
      },
      { provide: ReporterService, useValue: reporter },
      { provide: LoggerService, useValue: createMock<LoggerService>() },
    ],
  }).compile();

  return {
    database,
    docker,
    gpg,
    helm,
    infra,
    ollama,
    python,
    reporter,
    service: await module.resolve(SoftwareService),
    sshSigning,
  };
}

describe(SoftwareService, () => {
  let service: SoftwareService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SoftwareService,
        {
          provide: SoftwarePythonService,
          useValue: createMock<SoftwarePythonService>(),
        },
        {
          provide: SoftwareOllamaService,
          useValue: createMock<SoftwareOllamaService>(),
        },
        {
          provide: SoftwareDockerService,
          useValue: createMock<SoftwareDockerService>(),
        },
        {
          provide: SoftwareGpgService,
          useValue: createMock<SoftwareGpgService>(),
        },
        {
          provide: SoftwareInfraService,
          useValue: createMock<SoftwareInfraService>(),
        },
        {
          provide: SoftwareDatabaseService,
          useValue: createMock<SoftwareDatabaseService>(),
        },
        { provide: HelmService, useValue: createMock<HelmService>() },
        {
          provide: SshSigningService,
          useValue: createMock<SshSigningService>(),
        },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(SoftwareService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("installs everything through Homebrew on a Mac, then verifies SSH signatures", async () => {
    expect.hasAssertions();

    const steps = await createSteps("darwin");

    await steps.service.installSoftware();

    expect(steps.python.installPython).toHaveBeenCalledWith();
    expect(steps.ollama.installOllama).toHaveBeenCalledWith();
    expect(steps.docker.installDocker).toHaveBeenCalledWith();
    expect(steps.gpg.installGpgSigning).toHaveBeenCalledWith();
    expect(steps.infra.installInfrastructureTools).toHaveBeenCalledWith();
    expect(steps.database.installDatabaseTools).toHaveBeenCalledWith();
    expect(steps.sshSigning.configureSshSigning).toHaveBeenCalledWith();
    expect(steps.helm.installHelm).not.toHaveBeenCalled();
  });

  it("installs only Helm from its archive on Linux, then verifies SSH signatures", async () => {
    expect.hasAssertions();

    const steps = await createSteps("linux");

    await steps.service.installSoftware();

    expect(steps.helm.installHelm).toHaveBeenCalledWith();
    expect(steps.sshSigning.configureSshSigning).toHaveBeenCalledWith();
    expect(steps.python.installPython).not.toHaveBeenCalled();
    expect(steps.ollama.installOllama).not.toHaveBeenCalled();
    expect(steps.docker.installDocker).not.toHaveBeenCalled();
    expect(steps.gpg.installGpgSigning).not.toHaveBeenCalled();
    expect(steps.infra.installInfrastructureTools).not.toHaveBeenCalled();
    expect(steps.database.installDatabaseTools).not.toHaveBeenCalled();
  });

  it("warns and carries on to the SSH signatures when Helm cannot be installed", async () => {
    expect.hasAssertions();

    const steps = await createSteps("linux");

    steps.helm.installHelm.mockImplementation(() => {
      throw new Error("offline");
    });

    await steps.service.installSoftware();

    expect(steps.reporter.print).toHaveBeenCalledWith(
      expect.stringContaining("Helm was not installed (offline)"),
    );
    expect(steps.sshSigning.configureSshSigning).toHaveBeenCalledWith();
  });
});

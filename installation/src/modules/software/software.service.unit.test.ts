import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { SshSigningService } from "../ssh-signing/ssh-signing.service";

import { SoftwareDatabaseService } from "./software-database.service";
import { SoftwareDockerService } from "./software-docker.service";
import { SoftwareGpgService } from "./software-gpg.service";
import { SoftwareInfraService } from "./software-infra.service";
import { SoftwareLinuxService } from "./software-linux.service";
import { SoftwareOllamaService } from "./software-ollama.service";
import { SoftwarePythonService } from "./software-python.service";
import { SoftwareService } from "./software.service";

import type { DeepMocked } from "@golevelup/ts-vitest";

/** The steps a software install can run, as mocks, with the service built over them. */
interface Steps {
  database: DeepMocked<SoftwareDatabaseService>;
  docker: DeepMocked<SoftwareDockerService>;
  gpg: DeepMocked<SoftwareGpgService>;
  infra: DeepMocked<SoftwareInfraService>;
  linux: DeepMocked<SoftwareLinuxService>;
  ollama: DeepMocked<SoftwareOllamaService>;
  python: DeepMocked<SoftwarePythonService>;
  service: SoftwareService;
  sshSigning: DeepMocked<SshSigningService>;
}

/** Builds the service over a machine that runs the given operating system. */
async function createSteps(platform: NodeJS.Platform): Promise<Steps> {
  const database = createMock<SoftwareDatabaseService>();
  const docker = createMock<SoftwareDockerService>();
  const gpg = createMock<SoftwareGpgService>();
  const linux = createMock<SoftwareLinuxService>();
  const infra = createMock<SoftwareInfraService>();
  const ollama = createMock<SoftwareOllamaService>();
  const python = createMock<SoftwarePythonService>();
  const sshSigning = createMock<SshSigningService>();
  const { module } = await buildTestingModule(SoftwareService, {
    providers: [
      { provide: SoftwarePythonService, useValue: python },
      { provide: SoftwareOllamaService, useValue: ollama },
      { provide: SoftwareDockerService, useValue: docker },
      { provide: SoftwareGpgService, useValue: gpg },
      { provide: SoftwareInfraService, useValue: infra },
      { provide: SoftwareDatabaseService, useValue: database },
      { provide: SoftwareLinuxService, useValue: linux },
      { provide: SshSigningService, useValue: sshSigning },
      {
        provide: ProcessRunnerService,
        useValue: createFakeProcessRunner({ platform }).runner,
      },
    ],
  });

  return {
    database,
    docker,
    gpg,
    infra,
    linux,
    ollama,
    python,
    service: await module.resolve(SoftwareService),
    sshSigning,
  };
}

describe(SoftwareService, () => {
  const moduleOptions = {
    mocks: [
      SoftwarePythonService,
      SoftwareOllamaService,
      SoftwareDockerService,
      SoftwareGpgService,
      SoftwareInfraService,
      SoftwareDatabaseService,
      SoftwareLinuxService,
      SshSigningService,
      ProcessRunnerService,
    ],
  };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SoftwareService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(SoftwareService);
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
    expect(steps.linux.installLinuxTools).not.toHaveBeenCalled();
  });

  it("installs the Linux tools instead of the Homebrew ones, then verifies SSH signatures", async () => {
    expect.hasAssertions();

    const steps = await createSteps("linux");

    await steps.service.installSoftware();

    expect(steps.linux.installLinuxTools).toHaveBeenCalledWith();
    expect(steps.sshSigning.configureSshSigning).toHaveBeenCalledWith();
    expect(steps.python.installPython).not.toHaveBeenCalled();
    expect(steps.ollama.installOllama).not.toHaveBeenCalled();
    expect(steps.docker.installDocker).not.toHaveBeenCalled();
    expect(steps.gpg.installGpgSigning).not.toHaveBeenCalled();
    expect(steps.infra.installInfrastructureTools).not.toHaveBeenCalled();
    expect(steps.database.installDatabaseTools).not.toHaveBeenCalled();
  });
});

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { DependenciesService } from "../dependencies/dependencies.service";
import { EnvironmentFilesService } from "../environment-files/environment-files.service";
import { ReporterService } from "../reporter/reporter.service";
import { ShellConfigurationService } from "../shell-configuration/shell-configuration.service";
import { SoftwareService } from "../software/software.service";

import { SetupService } from "./setup.service";

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
          provide: ShellConfigurationService,
          useValue: createMock<ShellConfigurationService>(),
        },
        { provide: SoftwareService, useValue: createMock<SoftwareService>() },
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
});

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/logging";

import { SoftwareDatabaseService } from "./software-database.service";
import { SoftwareDockerService } from "./software-docker.service";
import { SoftwareGpgService } from "./software-gpg.service";
import { SoftwareInfraService } from "./software-infra.service";
import { SoftwareOllamaService } from "./software-ollama.service";
import { SoftwarePythonService } from "./software-python.service";
import { SoftwareService } from "./software.service";

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
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(SoftwareService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});

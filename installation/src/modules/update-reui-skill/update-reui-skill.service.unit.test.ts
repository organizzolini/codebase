import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { ReporterService } from "../reporter/reporter.service";

import { UpdateReuiSkillService } from "./update-reui-skill.service";

describe(UpdateReuiSkillService, () => {
  let service: UpdateReuiSkillService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpdateReuiSkillService,
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(UpdateReuiSkillService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});

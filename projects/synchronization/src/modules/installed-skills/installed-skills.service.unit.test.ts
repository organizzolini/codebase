import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/logging";

import { InstalledSkillsProcessService } from "./installed-skills-process.service";
import { InstalledSkillsService } from "./installed-skills.service";

// Behavior is tested through `InstalledSkillsCommand`, over this real service
// and a real workspace, which is the seam the spec agreed on.
describe(InstalledSkillsService, () => {
  let service: InstalledSkillsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        InstalledSkillsService,
        {
          provide: InstalledSkillsProcessService,
          useValue: createMock<InstalledSkillsProcessService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(InstalledSkillsService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });
});

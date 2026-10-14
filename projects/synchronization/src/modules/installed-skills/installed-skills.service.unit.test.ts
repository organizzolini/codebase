import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { InstalledSkillsService } from "./installed-skills.service";

describe(InstalledSkillsService, () => {
  let service: InstalledSkillsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [InstalledSkillsService],
    }).compile();

    service = await module.resolve(InstalledSkillsService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });
});

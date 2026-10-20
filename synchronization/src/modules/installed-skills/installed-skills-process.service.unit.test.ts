import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { InstalledSkillsProcessService } from "./installed-skills-process.service";

describe(InstalledSkillsProcessService, () => {
  let service: InstalledSkillsProcessService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [InstalledSkillsProcessService],
    }).compile();

    service = await module.resolve(InstalledSkillsProcessService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("reports the status a process exits with", () => {
    expect(
      service.run({
        args: ["--eval", "process.exit(3)"],
        executable: process.execPath,
      }),
    ).toStrictEqual({ available: true, status: 3 });
  });

  it("reports an executable that cannot start as unavailable", () => {
    expect(
      service.run({
        args: [],
        executable: "installed-skills-no-such-executable",
        streamOutput: true,
      }),
    ).toStrictEqual({ available: false, status: null });
  });
});

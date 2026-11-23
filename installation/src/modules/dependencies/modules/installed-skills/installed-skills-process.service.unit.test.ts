import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { InstalledSkillsProcessService } from "./installed-skills-process.service";

describe(InstalledSkillsProcessService, () => {
  let service: InstalledSkillsProcessService;

  beforeAll(async () => {
    const built = await buildTestingModule(InstalledSkillsProcessService);

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      InstalledSkillsProcessService,
    );

    expect(instance).toBeInstanceOf(InstalledSkillsProcessService);
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

import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { InstanceGroupService } from "./instance-group.service";

describe(InstanceGroupService, () => {
  let service: InstanceGroupService;

  beforeAll(async () => {
    const built = await buildTestingModule(InstanceGroupService);

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(InstanceGroupService);

    expect(instance).toBeInstanceOf(InstanceGroupService);
  });

  describe("isProjectScoped", () => {
    it.each([
      ["an untagged group", { patterns: ["packages/*"] }, false],
      ["a group tagged empty", { patterns: ["packages/*"], tags: [] }, false],
      ["a tagged group", { patterns: ["src/*"], tags: ["nestjs"] }, true],
      ["a group naming only tags", { tags: ["nestjs"] }, true],
    ])("reads %s as %s", (_description, group, expected) => {
      expect(service.isProjectScoped(group)).toBe(expected);
    });
  });
});

import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CharacteristicsResolver } from "./characteristics.resolver";
import { CharacteristicsService } from "./characteristics.service";

describe(CharacteristicsResolver, () => {
  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(CharacteristicsResolver, {
      mocks: [CharacteristicsService],
    });

    expect(instance).toBeInstanceOf(CharacteristicsResolver);
  });

  it("returns what the service reads", async () => {
    expect.hasAssertions();

    const { instance, mock } = await buildTestingModule(
      CharacteristicsResolver,
      { mocks: [CharacteristicsService] },
    );
    mock(CharacteristicsService).findAll.mockResolvedValue([]);

    await expect(instance.characteristics()).resolves.toStrictEqual([]);
  });
});

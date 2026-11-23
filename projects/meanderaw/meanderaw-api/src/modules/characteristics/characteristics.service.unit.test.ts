import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it, vi } from "vitest";

import {
  Characteristic,
  CharacteristicValueCount,
} from "@codebase/meanderaw-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CharacteristicsService } from "./characteristics.service";

describe(CharacteristicsService, () => {
  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(CharacteristicsService, {
      providers: [
        { provide: getRepositoryToken(Characteristic), useValue: {} },
        { provide: getRepositoryToken(CharacteristicValueCount), useValue: {} },
      ],
    });

    expect(instance).toBeInstanceOf(CharacteristicsService);
  });

  it("attaches each characteristic's counts to it", async () => {
    expect.hasAssertions();

    const find = vi.fn<() => Promise<unknown[]>>();
    find.mockResolvedValueOnce([
      {
        category: "path",
        description: "d",
        documentationUrl: null,
        formula: null,
        id: 7,
        isPattern: false,
        key: "k",
        meanderCount: 3,
        name: "n",
        valueType: "number",
      },
    ]);
    find.mockResolvedValueOnce([
      { characteristicId: 7, meanderCount: 3, value: 2 },
      { characteristicId: 8, meanderCount: 1, value: 2 },
    ]);
    const { instance } = await buildTestingModule(CharacteristicsService, {
      providers: [
        { provide: getRepositoryToken(Characteristic), useValue: { find } },
        {
          provide: getRepositoryToken(CharacteristicValueCount),
          useValue: { find },
        },
      ],
    });

    await expect(instance.findAll()).resolves.toMatchObject([
      { id: 7, valueCounts: [{ meanderCount: 3, value: 2 }] },
    ]);
  });
});

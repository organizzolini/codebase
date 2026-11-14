import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it } from "vitest";

import { Characteristic, Meander } from "@codebase/meanderaw-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeanderFilterService } from "../meanders/filters/meander-filter.service";

import { MeanderGroupsService } from "./meander-groups.service";

/** Builds the service over repositories that are never reached. */
async function buildService(): Promise<MeanderGroupsService> {
  const { instance } = await buildTestingModule(MeanderGroupsService, {
    mocks: [MeanderFilterService],
    providers: [
      { provide: getRepositoryToken(Characteristic), useValue: {} },
      { provide: getRepositoryToken(Meander), useValue: {} },
    ],
  });

  return instance;
}

describe(MeanderGroupsService, () => {
  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(MeanderGroupsService, {
      mocks: [MeanderFilterService],
      providers: [
        { provide: getRepositoryToken(Characteristic), useValue: {} },
        { provide: getRepositoryToken(Meander), useValue: {} },
      ],
    });

    expect(instance).toBeInstanceOf(MeanderGroupsService);
  });

  it("refuses no levels before it reads anything", async () => {
    expect.hasAssertions();

    const service = await buildService();

    await expect(service.group({ groupBy: [] })).rejects.toThrow(
      /too small|>=1|1 element/i,
    );
  });

  it("refuses more levels than the maximum before it reads anything", async () => {
    expect.hasAssertions();

    const service = await buildService();

    await expect(
      service.group({
        groupBy: Array.from({ length: 5 }, () => ({ field: "lattice" })),
      }),
    ).rejects.toThrow(/too big|<=4|4 element/i);
  });
});

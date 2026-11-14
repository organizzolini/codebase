import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it } from "vitest";

import { Characteristic, Meander, ShapeCount } from "@codebase/meanderaw-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeandersService } from "./meanders.service";

/** Builds the service over repositories that are never reached. */
async function buildService(): Promise<MeandersService> {
  const { instance } = await buildTestingModule(MeandersService, {
    providers: [
      { provide: getRepositoryToken(Meander), useValue: {} },
      { provide: getRepositoryToken(Characteristic), useValue: {} },
      { provide: getRepositoryToken(ShapeCount), useValue: {} },
    ],
  });

  return instance;
}

describe(MeandersService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(MeandersService, {
      providers: [
        { provide: getRepositoryToken(Meander), useValue: {} },
        { provide: getRepositoryToken(Characteristic), useValue: {} },
        { provide: getRepositoryToken(ShapeCount), useValue: {} },
      ],
    });

    expect(instance).toBeInstanceOf(MeandersService);
  });

  it("refuses a page size past the maximum before it reads anything", async () => {
    expect.hasAssertions();

    const service = await buildService();

    await expect(service.find({ first: 1000 })).rejects.toThrow(
      /too big|<=200|200/i,
    );
  });
});

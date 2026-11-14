import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it } from "vitest";

import { CodeService, DrawingService } from "@codebase/meanderaw-core";
import {
  Characteristic,
  Meander,
  MeanderCharacteristic,
} from "@codebase/meanderaw-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeanderAggregateService } from "./aggregates/meander-aggregate.service";
import { MeanderFilterService } from "./filters/meander-filter.service";
import { MeandersService } from "./meanders.service";

/** Builds the service over repositories that are never reached. */
async function buildService(): Promise<MeandersService> {
  const { instance } = await buildTestingModule(MeandersService, {
    mocks: [
      CodeService,
      DrawingService,
      MeanderAggregateService,
      MeanderFilterService,
    ],
    providers: [
      { provide: getRepositoryToken(Meander), useValue: {} },
      { provide: getRepositoryToken(Characteristic), useValue: {} },
      { provide: getRepositoryToken(MeanderCharacteristic), useValue: {} },
    ],
  });

  return instance;
}

describe(MeandersService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(MeandersService, {
      mocks: [
        CodeService,
        DrawingService,
        MeanderAggregateService,
        MeanderFilterService,
      ],
      providers: [
        { provide: getRepositoryToken(Meander), useValue: {} },
        { provide: getRepositoryToken(Characteristic), useValue: {} },
        { provide: getRepositoryToken(MeanderCharacteristic), useValue: {} },
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

  it("draws a meander by rendering its parsed Code", async () => {
    expect.hasAssertions();

    const { instance, mock } = await buildTestingModule(MeandersService, {
      mocks: [
        CodeService,
        DrawingService,
        MeanderAggregateService,
        MeanderFilterService,
      ],
      providers: [
        { provide: getRepositoryToken(Meander), useValue: {} },
        { provide: getRepositoryToken(Characteristic), useValue: {} },
        { provide: getRepositoryToken(MeanderCharacteristic), useValue: {} },
      ],
    });
    const parsed = { columns: 2, digits: "01", repeats: 1, rows: 1 };
    mock(CodeService).parse.mockReturnValue(parsed);
    mock(DrawingService).render.mockReturnValue("<svg/>");

    expect(
      instance.draw({
        code: "01",
        columns: 2,
        id: "i",
        isHardcoded: true,
        lattice: "0",
        repeats: 1,
        rows: 1,
        symmetricalCodes: [],
      }),
    ).toBe("<svg/>");
    expect(mock(CodeService).parse).toHaveBeenCalledWith("01", 1, 2);
    expect(mock(DrawingService).render).toHaveBeenCalledWith(parsed);
  });
});

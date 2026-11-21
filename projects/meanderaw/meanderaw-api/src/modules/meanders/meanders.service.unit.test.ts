import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it, vi } from "vitest";

import { CodeService, DrawingService } from "@codebase/meanderaw-core";
import {
  Characteristic,
  Meander,
  MeanderCharacteristic,
} from "@codebase/meanderaw-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeandersService } from "./meanders.service";
import { MeanderAggregateService } from "./modules/aggregates/meander-aggregate.service";
import { MeanderFilterService } from "./modules/filters/meander-filter.service";

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

  it("finds the values every meander holds in two reads, in the order of the ids", async () => {
    expect.hasAssertions();

    const catalogFind = vi.fn().mockResolvedValue([
      { id: 1, isPattern: true, key: "isChain", name: "Chain" },
      { id: 2, isPattern: false, key: "junctionCount", name: "Junctions" },
    ]);
    const bridgeFind = vi.fn().mockResolvedValue([
      { characteristicId: 2, meanderId: "b", value: 3 },
      { characteristicId: 1, meanderId: "a", value: 1 },
      { characteristicId: 2, meanderId: "a", value: 2 },
    ]);
    const { instance } = await buildTestingModule(MeandersService, {
      mocks: [
        CodeService,
        DrawingService,
        MeanderAggregateService,
        MeanderFilterService,
      ],
      providers: [
        { provide: getRepositoryToken(Meander), useValue: {} },
        {
          provide: getRepositoryToken(Characteristic),
          useValue: { find: catalogFind },
        },
        {
          provide: getRepositoryToken(MeanderCharacteristic),
          useValue: { find: bridgeFind },
        },
      ],
    });

    const values = await instance.findCharacteristicsFor(["a", "b", "c"]);

    expect(values).toStrictEqual([
      [
        { isPattern: true, key: "isChain", name: "Chain", value: 1 },
        { isPattern: false, key: "junctionCount", name: "Junctions", value: 2 },
      ],
      [{ isPattern: false, key: "junctionCount", name: "Junctions", value: 3 }],
      [],
    ]);
    expect(catalogFind).toHaveBeenCalledTimes(1);
    expect(bridgeFind).toHaveBeenCalledTimes(1);
  });

  it("draws the tile repeated as many times as asked, and refuses a count out of range", async () => {
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
    const meander = {
      code: "01",
      columns: 2,
      id: "i",
      isHardcoded: true,
      lattice: "0",
      repeats: 1,
      rows: 1,
      symmetricalCodes: [],
    };

    instance.draw(meander, 6);

    expect(mock(DrawingService).render).toHaveBeenCalledWith({
      ...parsed,
      repeats: 6,
    });
    expect(() => instance.draw(meander, 0)).toThrow(/from 1 to 24/u);
    expect(() => instance.draw(meander, 25)).toThrow(/from 1 to 24/u);
    expect(() => instance.draw(meander, 1.5)).toThrow(/from 1 to 24/u);
  });

  it("refuses an offset below 0 before it reads anything", async () => {
    expect.hasAssertions();

    const service = await buildService();

    await expect(service.find({ offset: -1 })).rejects.toThrow(/offset|>=0/i);
  });

  it("skips the offset before the page, and reports a page before it", async () => {
    expect.hasAssertions();

    const offset = vi.fn<(skip: number) => unknown>();
    const limit = vi.fn<(take: number) => unknown>();
    const builder: Record<string, unknown> = {};

    Object.assign(builder, {
      addOrderBy: vi.fn<() => unknown>().mockReturnValue(builder),
      getRawAndEntities: vi
        .fn<() => Promise<unknown>>()
        .mockResolvedValue({ entities: [], raw: [] }),
      limit: limit.mockReturnValue(builder),
      offset: offset.mockReturnValue(builder),
      orderBy: vi.fn<() => unknown>().mockReturnValue(builder),
    });

    const { instance, mock } = await buildTestingModule(MeandersService, {
      mocks: [
        CodeService,
        DrawingService,
        MeanderAggregateService,
        MeanderFilterService,
      ],
      providers: [
        {
          provide: getRepositoryToken(Meander),
          useValue: { createQueryBuilder: () => builder },
        },
        { provide: getRepositoryToken(Characteristic), useValue: {} },
        { provide: getRepositoryToken(MeanderCharacteristic), useValue: {} },
      ],
    });

    mock(MeanderAggregateService).total.mockResolvedValue(0);

    const skipped = await instance.find({ first: 24, offset: 48 });
    const first = await instance.find({ first: 24 });

    expect(offset).toHaveBeenNthCalledWith(1, 48);
    expect(offset).toHaveBeenNthCalledWith(2, 0);
    expect(limit).toHaveBeenCalledWith(25);
    expect(skipped.pageInfo.hasPreviousPage).toBe(true);
    expect(first.pageInfo.hasPreviousPage).toBe(false);
  });
});

import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it, vi } from "vitest";

import { Characteristic, Meander } from "@codebase/meanderaw-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeanderAggregateService } from "../meanders/modules/aggregates/meander-aggregate.service";
import { MeanderFilterService } from "../meanders/modules/filters/meander-filter.service";

import { MeanderGroupsService } from "./meander-groups.service";

import type { Mock } from "vitest";

/** Builds the service over repositories that are never reached. */
async function buildService(): Promise<MeanderGroupsService> {
  const { instance } = await buildTestingModule(MeanderGroupsService, {
    mocks: [MeanderAggregateService, MeanderFilterService],
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
      mocks: [MeanderAggregateService, MeanderFilterService],
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

  it("nests several shape and characteristic levels from the meanders themselves", async () => {
    expect.hasAssertions();

    const select = vi.fn<(expression: string, alias: string) => unknown>();
    const groupBy = vi.fn<(expression: string) => unknown>();
    const leftJoin = vi.fn<() => unknown>();
    const builder: Record<string, Mock> = {};

    Object.assign(builder, {
      addGroupBy: groupBy.mockReturnValue(builder),
      addSelect: select.mockReturnValue(builder),
      getRawMany: vi.fn<() => Promise<unknown[]>>().mockResolvedValue([
        { key0: 2, key1: 3, key2: 0, total: "4" },
        { key0: 2, key1: 3, key2: 1, total: "1" },
        { key0: 10, key1: 1, key2: 0, total: "2" },
      ]),
      leftJoin: leftJoin.mockReturnValue(builder),
      select: vi.fn<() => unknown>().mockReturnValue(builder),
    });

    const { instance } = await buildTestingModule(MeanderGroupsService, {
      mocks: [MeanderAggregateService, MeanderFilterService],
      providers: [
        {
          provide: getRepositoryToken(Characteristic),
          useValue: {
            findBy: vi
              .fn<() => Promise<unknown[]>>()
              .mockResolvedValue([
                { id: 7, key: "junctionCount", valueType: "number" },
              ]),
          },
        },
        {
          provide: getRepositoryToken(Meander),
          useValue: { createQueryBuilder: () => builder },
        },
      ],
    });

    await expect(
      instance.group({
        groupBy: [
          { field: "rows" },
          { field: "columns" },
          { field: "junctionCount" },
        ],
      }),
    ).resolves.toStrictEqual([
      {
        count: 5,
        field: "rows",
        groups: [
          {
            count: 5,
            field: "columns",
            groups: [
              { count: 4, field: "junctionCount", groups: [], value: "0" },
              { count: 1, field: "junctionCount", groups: [], value: "1" },
            ],
            value: "3",
          },
        ],
        value: "2",
      },
      {
        count: 2,
        field: "rows",
        groups: [
          {
            count: 2,
            field: "columns",
            groups: [
              { count: 2, field: "junctionCount", groups: [], value: "0" },
            ],
            value: "1",
          },
        ],
        value: "10",
      },
    ]);
    expect(select).toHaveBeenCalledWith("meander.rows", "key0");
    expect(select).toHaveBeenCalledWith("meander.columns", "key1");
    expect(select).toHaveBeenCalledWith("COALESCE(bridge2.value, 0)", "key2");
  });
});

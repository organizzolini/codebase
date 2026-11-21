import { getDataSourceToken, getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it, vi } from "vitest";

import {
  AggregateMarker,
  CharacteristicPairCount,
  CharacteristicValueCount,
  ShapeCount,
} from "@codebase/meanderaw-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeanderFilterPlanService } from "../filters/meander-filter-plan.service";
import { MeanderFilterOperator } from "../filters/meander-filter-rule.entities";

import { MeanderAggregateService } from "./meander-aggregate.service";

import type { CompiledMeanderFilter } from "../filters/meander-filter.types";
import type { Characteristic } from "@codebase/meanderaw-db";

type Tables = Map<unknown, readonly object[]>;

/** Two shapes holding ten meanders in all. */
const SHAPES = [
  { columns: 1, lattice: "0", meanderCount: 4, rows: 1 },
  { columns: 2, lattice: "1", meanderCount: 6, rows: 2 },
];

const JUNCTION = { id: 1, valueType: "number" } as Characteristic;
const CHAIN = { id: 2, valueType: "boolean" } as Characteristic;

/** Builds the service over fake tables read in a fake snapshot. */
async function buildService(
  tables: Tables,
): Promise<{ service: MeanderAggregateService; transaction: () => void }> {
  const transaction = vi.fn<() => void>();
  const rows = (entity: unknown): readonly object[] => tables.get(entity) ?? [];
  const manager = {
    findBy: async (
      entity: unknown,
      where: Record<string, unknown>,
    ): Promise<readonly object[]> =>
      await Promise.resolve(
        rows(entity).filter((row) =>
          Object.entries(where).every(
            ([key, value]) => (row as Record<string, unknown>)[key] === value,
          ),
        ),
      ),
    findOneBy: async (entity: unknown): Promise<null | object> =>
      await Promise.resolve(rows(entity)[0] ?? null),
    getRepository: (
      entity: unknown,
    ): { find: () => Promise<readonly object[]> } => ({
      find: async (): Promise<readonly object[]> =>
        await Promise.resolve(rows(entity)),
    }),
  };
  const { instance } = await buildTestingModule(MeanderAggregateService, {
    providers: [
      MeanderFilterPlanService,
      {
        provide: getRepositoryToken(CharacteristicValueCount),
        useValue: {},
      },
      {
        provide: getDataSourceToken(),
        useValue: {
          transaction: (_level: string, work: (m: unknown) => unknown) => {
            transaction();

            return work(manager);
          },
        },
      },
    ],
  });

  return { service: instance, transaction };
}

/** Tables as a rebuild leaves them: the marker, the shapes, and `extra`. */
function built(extra: [unknown, readonly object[]][] = []): Tables {
  return new Map<unknown, readonly object[]>([
    [AggregateMarker, [{ id: 1, meanderCount: 10 }]],
    [ShapeCount, SHAPES],
    ...extra,
  ]);
}

/** A compiled filter of one characteristic rule. */
function ruleFilter(
  characteristic: Characteristic,
  operator: MeanderFilterOperator,
  numbers: number[],
  flag: boolean | null = null,
): CompiledMeanderFilter {
  const field = characteristic === JUNCTION ? "junctionCount" : "isChain";

  return {
    catalog: new Map([[field, characteristic]]),
    hash: "h",
    parameters: {},
    tree: {
      combinator: "and",
      groups: [],
      rules: [{ field, flag, numbers, operator, text: null }],
    },
    where: "",
  };
}

const VALUES = [
  { characteristicId: 1, meanderCount: 3, value: 1 },
  { characteristicId: 1, meanderCount: 2, value: 2 },
  { characteristicId: 2, meanderCount: 4, value: 1 },
];

describe(MeanderAggregateService, () => {
  it("answers nothing without a marker, or one the shape totals contradict", async () => {
    expect.hasAssertions();

    const missing = await buildService(new Map([[ShapeCount, SHAPES]]));
    const contradicted = await buildService(
      new Map<unknown, readonly object[]>([
        [AggregateMarker, [{ id: 1, meanderCount: 11 }]],
        [ShapeCount, SHAPES],
      ]),
    );
    const empty = await buildService(
      new Map<unknown, readonly object[]>([
        [AggregateMarker, [{ id: 1, meanderCount: 0 }]],
      ]),
    );

    await expect(missing.service.total(null)).resolves.toBeNull();
    await expect(contradicted.service.total(null)).resolves.toBeNull();
    await expect(empty.service.total(null)).resolves.toBeNull();
  });

  it("opens no snapshot for a tree no table can answer", async () => {
    expect.hasAssertions();

    const { service, transaction } = await buildService(built());
    const or = ruleFilter(JUNCTION, MeanderFilterOperator.GT, [0]);

    await expect(
      service.total({
        ...or,
        tree: {
          ...or.tree,
          combinator: "or",
          rules: [...or.tree.rules, ...or.tree.rules],
        },
      }),
    ).resolves.toBeNull();
    expect(transaction).not.toHaveBeenCalled();
  });

  it("totals a characteristic rule from the stored rows, a missing row as 0", async () => {
    expect.hasAssertions();

    const { service } = await buildService(
      built([[CharacteristicValueCount, VALUES]]),
    );
    const total = async (
      operator: MeanderFilterOperator,
      numbers: number[],
    ): Promise<null | number> =>
      await service.total(ruleFilter(JUNCTION, operator, numbers));

    // Ten meanders, five hold the characteristic, five do not.
    await expect(total(MeanderFilterOperator.GT, [0])).resolves.toBe(5);
    await expect(total(MeanderFilterOperator.EQ, [0])).resolves.toBe(5);
    await expect(total(MeanderFilterOperator.LT, [2])).resolves.toBe(8);
    await expect(total(MeanderFilterOperator.NE, [1])).resolves.toBe(7);
  });

  it("counts meanders by each shape field from the shape rows", async () => {
    expect.hasAssertions();

    const { service } = await buildService(built());

    await expect(service.shapeCounts(null, "rows")).resolves.toStrictEqual(
      new Map([
        ["1", 4],
        ["2", 6],
      ]),
    );
    await expect(service.shapeCounts(null, "columns")).resolves.toStrictEqual(
      new Map([
        ["1", 4],
        ["2", 6],
      ]),
    );
    await expect(
      service.shapeCounts(null, "rowsColumns"),
    ).resolves.toStrictEqual(
      new Map([
        ["1x1", 4],
        ["2x2", 6],
      ]),
    );
  });

  it("refuses a total when the rows exceed the shapes", async () => {
    expect.hasAssertions();

    const { service } = await buildService(
      built([
        [
          CharacteristicValueCount,
          [{ characteristicId: 1, meanderCount: 11, value: 1 }],
        ],
      ]),
    );

    await expect(
      service.total(ruleFilter(JUNCTION, MeanderFilterOperator.EQ, [0])),
    ).resolves.toBeNull();
  });

  it("adds the 0 bucket to the value counts and to any 0 row stored", async () => {
    expect.hasAssertions();

    const plain = await buildService(
      built([[CharacteristicValueCount, VALUES]]),
    );
    const stored = await buildService(
      built([
        [
          CharacteristicValueCount,
          [...VALUES, { characteristicId: 1, meanderCount: 2, value: 0 }],
        ],
      ]),
    );

    await expect(
      plain.service.valueCounts(null, { id: 1 }),
    ).resolves.toStrictEqual(
      new Map([
        [0, 5],
        [1, 3],
        [2, 2],
      ]),
    );
    await expect(
      stored.service.valueCounts(null, { id: 1 }),
    ).resolves.toStrictEqual(
      new Map([
        [0, 5],
        [1, 3],
        [2, 2],
      ]),
    );
  });

  it("derives a pattern's 0 bucket from its own count minus the pair rows", async () => {
    expect.hasAssertions();

    const { service } = await buildService(
      built([
        [CharacteristicValueCount, VALUES],
        [
          CharacteristicPairCount,
          [
            {
              characteristicId: 2,
              meanderCount: 3,
              otherCharacteristicId: 1,
              otherValue: 1,
              value: 1,
            },
          ],
        ],
      ]),
    );
    const pattern = ruleFilter(CHAIN, MeanderFilterOperator.IS, [], true);
    const absent = ruleFilter(CHAIN, MeanderFilterOperator.IS_NOT, [], true);

    // Four meanders hold the pattern; three of them hold junctionCount 1.
    await expect(
      service.valueCounts(pattern, { id: 1 }),
    ).resolves.toStrictEqual(
      new Map([
        [0, 1],
        [1, 3],
      ]),
    );
    await expect(service.valueCounts(absent, { id: 1 })).resolves.toBeNull();
  });
});

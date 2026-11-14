import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it, vi } from "vitest";

import {
  CharacteristicPairCount,
  CharacteristicShapeCount,
  CharacteristicValueCount,
  ShapeCount,
} from "@codebase/meanderaw-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeanderFilterPlanService } from "../filters/meander-filter-plan.service";
import { MeanderFilterOperator } from "../filters/meander-filter-rule.entities";

import { MeanderAggregateService } from "./meander-aggregate.service";

import type { CompiledMeanderFilter } from "../filters/meander-filter.types";
import type { Characteristic } from "@codebase/meanderaw-db";

const SHAPES = [{ columns: 1, lattice: "0", meanderCount: 4, rows: 1 }];

/** Builds the service over a shape table holding `shapes` and no other counts. */
async function buildService(
  shapes: readonly object[],
): Promise<MeanderAggregateService> {
  const { instance } = await buildTestingModule(MeanderAggregateService, {
    providers: [
      MeanderFilterPlanService,
      {
        provide: getRepositoryToken(ShapeCount),
        useValue: { find: vi.fn().mockResolvedValue(shapes) },
      },
      {
        provide: getRepositoryToken(CharacteristicValueCount),
        useValue: { findBy: vi.fn().mockResolvedValue([]) },
      },
      { provide: getRepositoryToken(CharacteristicShapeCount), useValue: {} },
      { provide: getRepositoryToken(CharacteristicPairCount), useValue: {} },
    ],
  });

  return instance;
}

/** A compiled filter holding rules the way a parsed tree does. */
function filterOf(
  combinator: "and" | "or",
  fields: readonly string[],
): CompiledMeanderFilter {
  const catalog = new Map([
    ["isChain", { id: 2, valueType: "boolean" } as Characteristic],
    ["junctionCount", { id: 1, valueType: "number" } as Characteristic],
  ]);

  return {
    catalog,
    hash: "h",
    parameters: {},
    tree: {
      combinator,
      groups: [],
      rules: fields.map((field) => ({
        field,
        flag: true,
        numbers: [0],
        operator: MeanderFilterOperator.GT,
        text: null,
      })),
    },
    where: "",
  };
}

describe(MeanderAggregateService, () => {
  it("answers nothing before the tables have been built", async () => {
    expect.hasAssertions();

    const service = await buildService([]);

    await expect(service.total(null)).resolves.toBeNull();
    await expect(service.valueCounts(null, { id: 1 })).resolves.toBeNull();
    await expect(service.shapeCounts(null, "lattice")).resolves.toBeNull();
  });

  it("leaves trees no table can answer to the meanders", async () => {
    expect.hasAssertions();

    const service = await buildService(SHAPES);

    await expect(
      service.total(filterOf("or", ["junctionCount", "isChain"])),
    ).resolves.toBeNull();
    await expect(
      service.total(filterOf("and", ["junctionCount", "rows"])),
    ).resolves.toBeNull();
  });

  it("does not group a shape by a characteristic rule or a numeric pattern", async () => {
    expect.hasAssertions();

    const service = await buildService(SHAPES);

    await expect(
      service.shapeCounts(filterOf("and", ["isChain"]), "lattice"),
    ).resolves.toBeNull();
    await expect(
      service.valueCounts(filterOf("and", ["junctionCount"]), { id: 2 }),
    ).resolves.toBeNull();
  });
});

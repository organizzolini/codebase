import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { describe, expect, it } from "vitest";

import { Characteristic } from "@codebase/meanderaw-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeanderFilterPlanService } from "./meander-filter-plan.service";
import { MeanderFilterService } from "./meander-filter.service";

/** Builds the service over a catalog that holds `keys`, each a number. */
async function buildService(
  keys: readonly string[] = [],
): Promise<MeanderFilterService> {
  const { instance } = await buildTestingModule(MeanderFilterService, {
    mocks: [MeanderFilterPlanService],
    providers: [
      {
        provide: DataSource,
        useValue: {
          getMetadata: () => ({ tablePath: "public.meander_characteristics" }),
        },
      },
      {
        provide: getRepositoryToken(Characteristic),
        useValue: {
          findBy: () =>
            keys.map((key, index) => ({
              id: index + 1,
              key,
              valueType: "number",
            })),
        },
      },
    ],
  });

  return instance;
}

describe(MeanderFilterService, () => {
  it("compiles a rule on a shape field without reading the catalog", async () => {
    expect.hasAssertions();

    const service = await buildService();
    const compiled = await service.compile({
      combinator: "and",
      rules: [{ field: "rows", numbers: [2], operator: "gte" }],
    });

    expect(compiled.where).toContain(">=");
    expect(Object.values(compiled.parameters)).toStrictEqual([2]);
  });

  it("reads a missing characteristic value as 0 in a comparison", async () => {
    expect.hasAssertions();

    const service = await buildService(["junctionCount"]);
    const compiled = await service.compile({
      combinator: "or",
      rules: [{ field: "junctionCount", numbers: [3], operator: "lt" }],
    });

    expect(compiled.where).toContain("COALESCE");
  });

  it("refuses a tree past the caps before parsing it", async () => {
    expect.hasAssertions();

    const service = await buildService();
    const rules = Array.from({ length: 129 }, () => ({
      field: "rows",
      numbers: [1],
      operator: "eq",
    }));
    let deep: unknown = { combinator: "and", rules: rules.slice(0, 1) };

    for (let level = 0; level < 6; level += 1) {
      deep = { combinator: "and", groups: [deep] };
    }

    await expect(service.compile({ combinator: "and", rules })).rejects.toThrow(
      "128 rules and groups",
    );
    await expect(service.compile(deep)).rejects.toThrow("6 groups deep");
  });

  it("binds a hash that differs between trees and not between runs", async () => {
    expect.hasAssertions();

    const service = await buildService();
    const tree = (value: number): unknown => ({
      combinator: "and",
      rules: [{ field: "rows", numbers: [value], operator: "eq" }],
    });
    const first = await service.compile(tree(1));
    const again = await service.compile(tree(1));
    const other = await service.compile(tree(2));

    expect(again.hash).toBe(first.hash);
    expect(other.hash).not.toBe(first.hash);
  });

  it.each([
    [{ combinator: "xor" }, "combinator"],
    [{ combinator: "and", rules: [{ field: "", operator: "eq" }] }, "field"],
    [
      {
        combinator: "and",
        rules: [{ field: "rows", numbers: [1, 2, 3], operator: "eq" }],
      },
      "numbers",
    ],
    [
      {
        combinator: "and",
        rules: [{ field: "rows", numbers: [1], operator: "between" }],
      },
      "between takes two numbers",
    ],
    [
      {
        combinator: "and",
        rules: [{ field: "rows", numbers: [3, 1], operator: "between" }],
      },
      "the lower first",
    ],
    [
      { combinator: "and", rules: [{ field: "rows", operator: "is" }] },
      "is takes only a flag",
    ],
    [
      { combinator: "and", rules: [{ field: "rows", operator: "eq" }] },
      "eq takes exactly one number",
    ],
  ])("rejects the malformed tree %j", async (filter, fragment) => {
    expect.hasAssertions();

    const service = await buildService();

    await expect(service.compile(filter)).rejects.toThrow(fragment);
  });
});

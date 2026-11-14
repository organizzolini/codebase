import { getRepositoryToken } from "@nestjs/typeorm";
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
      "between needs two numbers",
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
      "needs a flag",
    ],
    [
      { combinator: "and", rules: [{ field: "rows", operator: "eq" }] },
      "needs one number or a text",
    ],
  ])("rejects the malformed tree %j", async (filter, mention) => {
    expect.hasAssertions();

    const service = await buildService();

    await expect(service.compile(filter)).rejects.toThrow(mention);
  });
});

import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it } from "vitest";

import { CharacteristicValueCount } from "@codebase/meanderaw-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeanderFilterPlanService } from "./meander-filter-plan.service";
import { MeanderFilterOperator } from "./meander-filter-rule.entities";

import type {
  MeanderFilterGroup,
  MeanderFilterRule,
} from "./meander-filter.types";
import type { Characteristic } from "@codebase/meanderaw-db";

/** Three characteristics, `common` held by 90 meanders and `rare` by 4. */
const CATALOG = new Map(
  ["common", "rare", "flag"].map((key, index) => [
    key,
    { id: index + 1, key } as Characteristic,
  ]),
);

const COUNTS = [
  { characteristicId: 1, meanderCount: 90, value: 1 },
  { characteristicId: 1, meanderCount: 5, value: 2 },
  { characteristicId: 2, meanderCount: 4, value: 1 },
  { characteristicId: 3, meanderCount: 50, value: 1 },
];

/** Builds the service over fixed value counts. */
async function buildService(): Promise<MeanderFilterPlanService> {
  const { instance } = await buildTestingModule(MeanderFilterPlanService, {
    providers: [
      {
        provide: getRepositoryToken(CharacteristicValueCount),
        useValue: { findBy: () => COUNTS },
      },
    ],
  });

  return instance;
}

/** A rule on a field, with the operator and numbers it compares. */
function rule(
  field: string,
  operator: MeanderFilterOperator,
  numbers: number[] = [],
  flag: boolean | null = null,
): MeanderFilterRule {
  return { field, flag, numbers, operator, text: null };
}

/** A flat AND group of rules. */
const all = (...rules: MeanderFilterRule[]): MeanderFilterGroup => ({
  combinator: "and",
  groups: [],
  rules,
});

describe(MeanderFilterPlanService, () => {
  it("starts from the rule that keeps the fewest meanders", async () => {
    expect.hasAssertions();

    const service = await buildService();
    const rare = rule("rare", MeanderFilterOperator.GTE, [1]);
    const common = rule("common", MeanderFilterOperator.GT, [0]);

    await expect(
      service.chooseDriver(all(common, rare), CATALOG),
    ).resolves.toBe(rare);
    await expect(
      service.chooseDriver(all(rare, common), CATALOG),
    ).resolves.toBe(rare);
  });

  it("counts only the stored values a rule holds for", async () => {
    expect.hasAssertions();

    const service = await buildService();
    const high = rule("common", MeanderFilterOperator.EQ, [2]);
    const flag = rule("flag", MeanderFilterOperator.IS, [], true);

    await expect(service.chooseDriver(all(flag, high), CATALOG)).resolves.toBe(
      high,
    );
  });

  it("never starts from a rule a missing row satisfies", async () => {
    expect.hasAssertions();

    const service = await buildService();

    for (const unsafe of [
      rule("rare", MeanderFilterOperator.LT, [3]),
      rule("rare", MeanderFilterOperator.EQ, [0]),
      rule("rare", MeanderFilterOperator.NE, [2]),
      rule("flag", MeanderFilterOperator.IS, [], false),
      rule("flag", MeanderFilterOperator.IS_NOT, [], true),
      rule("rare", MeanderFilterOperator.BETWEEN, [0, 1]),
      rule("rare", MeanderFilterOperator.LTE, [1]),
      rule("rare", MeanderFilterOperator.GTE, [0]),
    ]) {
      await expect(
        service.chooseDriver(all(unsafe), CATALOG),
      ).resolves.toBeNull();
    }
  });

  it("leaves shape rules, ORs and nested groups to probes", async () => {
    expect.hasAssertions();

    const service = await buildService();
    const rare = rule("rare", MeanderFilterOperator.GTE, [1]);

    await expect(
      service.chooseDriver(
        all(rule("rows", MeanderFilterOperator.GT, [1])),
        CATALOG,
      ),
    ).resolves.toBeNull();
    await expect(
      service.chooseDriver({ ...all(rare), combinator: "or" }, CATALOG),
    ).resolves.toBeNull();
    await expect(
      service.chooseDriver({ ...all(rare), groups: [all(rare)] }, CATALOG),
    ).resolves.toBeNull();
  });
});

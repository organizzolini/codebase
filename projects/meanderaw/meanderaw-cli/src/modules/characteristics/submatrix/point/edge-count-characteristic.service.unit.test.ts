import { beforeAll, describe, expect, it } from "vitest";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CharacteristicContextService } from "../../characteristic-context.service";

import { EdgeCountCharacteristicService } from "./edge-count-characteristic.service";
import { PointUtilitiesService } from "./point-utilities.service";

describe(EdgeCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: EdgeCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(EdgeCountCharacteristicService, {
      imports: [CodeModule, MatrixModule],
      providers: [CharacteristicContextService, PointUtilitiesService],
    });

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it.each([
    { code: { columns: 1, digits: "", repeats: 1, rows: 0 }, expected: 0 },
    { code: { columns: 1, digits: "0", repeats: 1, rows: 1 }, expected: 0 },
    { code: { columns: 2, digits: "21", repeats: 1, rows: 1 }, expected: 1 },
    { code: { columns: 2, digits: "2100", repeats: 1, rows: 2 }, expected: 1 },
    { code: { columns: 2, digits: "4080", repeats: 1, rows: 2 }, expected: 1 },
    { code: { columns: 2, digits: "4488", repeats: 1, rows: 2 }, expected: 1 },
    { code: { columns: 2, digits: "40a1", repeats: 1, rows: 2 }, expected: 2 },
    { code: { columns: 2, digits: "44a9", repeats: 1, rows: 2 }, expected: 3 },
    { code: { columns: 2, digits: "65a9", repeats: 1, rows: 2 }, expected: 4 },
    { code: { columns: 2, digits: "9a56", repeats: 1, rows: 2 }, expected: 4 },
    { code: { columns: 1, digits: "7", repeats: 1, rows: 1 }, expected: 1.5 },
    { code: { columns: 1, digits: "f", repeats: 1, rows: 1 }, expected: 2 },
  ])("computes $expected for $code.digits", ({ code, expected }) => {
    expect(service.compute(contextService.create(code))).toBe(expected);
  });
});

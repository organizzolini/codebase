import { beforeAll, describe, expect, it } from "vitest";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { DoubleVerticalEdgeCountCharacteristicService } from "./double-vertical-edge-count-characteristic.service";

describe(DoubleVerticalEdgeCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: DoubleVerticalEdgeCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      DoubleVerticalEdgeCountCharacteristicService,
      {
        imports: [CodeModule, MatrixModule],
        providers: [CharacteristicContextService, SubmatrixUtilitiesService],
      },
    );

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it("counts points whose ink runs only north and south", () => {
    expect(service.compute(contextService.create("01x03ycc0"))).toBe(2);
  });

  it("ignores forks and crosses that also run north and south", () => {
    expect(service.compute(contextService.create("04x01yc0de"))).toBe(1);
  });

  it("ignores horizontal points, corners, and bare points", () => {
    expect(service.compute(contextService.create("04x01y3a50"))).toBe(0);
  });
});

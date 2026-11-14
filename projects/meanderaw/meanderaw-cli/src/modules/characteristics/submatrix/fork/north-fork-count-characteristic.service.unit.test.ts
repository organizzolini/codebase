import { beforeAll, describe, expect, it } from "vitest";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { NorthForkCountCharacteristicService } from "./north-fork-count-characteristic.service";

describe(NorthForkCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: NorthForkCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      NorthForkCountCharacteristicService,
      {
        imports: [CodeModule, MatrixModule],
        providers: [CharacteristicContextService, SubmatrixUtilitiesService],
      },
    );

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it("counts forks whose ink leaves by north, east, and west only", () => {
    expect(service.compute(contextService.create("05x01yb0b30"))).toBe(2);
  });

  it("counts nothing for the other three fork orientations or a cross", () => {
    expect(service.compute(contextService.create("04x01y7edf"))).toBe(0);
  });
});

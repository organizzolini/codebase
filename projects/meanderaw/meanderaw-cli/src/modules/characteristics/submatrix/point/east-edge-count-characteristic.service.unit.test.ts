import { beforeAll, describe, expect, it } from "vitest";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { EastEdgeCountCharacteristicService } from "./east-edge-count-characteristic.service";

describe(EastEdgeCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: EastEdgeCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(EastEdgeCountCharacteristicService, {
      imports: [CodeModule, MatrixModule],
      providers: [CharacteristicContextService, SubmatrixUtilitiesService],
    });

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it("counts every point with an east arm, whether it carries one, two, three, or four arms", () => {
    expect(service.compute(contextService.create("06x01y23ef15"))).toBe(4);
  });

  it("ignores points whose arms run only north, south, or west", () => {
    expect(service.compute(contextService.create("04x01y1dc4"))).toBe(0);
  });

  it("counts across every row of a closed rectangle", () => {
    expect(service.compute(contextService.create("04x02y6335a339"))).toBe(6);
  });
});

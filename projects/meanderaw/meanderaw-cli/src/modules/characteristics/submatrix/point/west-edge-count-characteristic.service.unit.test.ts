import { beforeAll, describe, expect, it } from "vitest";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { WestEdgeCountCharacteristicService } from "./west-edge-count-characteristic.service";

describe(WestEdgeCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: WestEdgeCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(WestEdgeCountCharacteristicService, {
      imports: [CodeModule, MatrixModule],
      providers: [CharacteristicContextService, SubmatrixUtilitiesService],
    });

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it("counts every point with a west arm, whether it carries one, two, three, or four arms", () => {
    expect(service.compute(contextService.create("06x01y13df2e"))).toBe(4);
  });

  it("ignores points whose arms run only north, south, or east", () => {
    expect(service.compute(contextService.create("04x01y2ec8"))).toBe(0);
  });

  it("counts across every row of a closed rectangle", () => {
    expect(service.compute(contextService.create("04x02y6335a339"))).toBe(6);
  });
});

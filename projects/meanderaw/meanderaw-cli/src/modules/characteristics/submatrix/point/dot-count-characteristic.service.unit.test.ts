import { beforeAll, describe, expect, it } from "vitest";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { DotCountCharacteristicService } from "./dot-count-characteristic.service";

describe(DotCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: DotCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(DotCountCharacteristicService, {
      imports: [CodeModule, MatrixModule],
      providers: [CharacteristicContextService, SubmatrixUtilitiesService],
    });

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it("counts every bare point", () => {
    expect(service.compute(contextService.create("04x01y0300"))).toBe(3);
  });

  it("counts nothing when every point carries ink", () => {
    expect(service.compute(contextService.create("03x01y3a5"))).toBe(0);
  });

  it("counts a lone bare point", () => {
    expect(service.compute(contextService.create("01x01y0"))).toBe(1);
  });
});

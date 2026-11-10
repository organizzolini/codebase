import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CodeModule } from "../../../code/code.module";
import { MatrixModule } from "../../../matrix/matrix.module";
import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { EastForkCountCharacteristicService } from "./east-fork-count-characteristic.service";

describe(EastForkCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: EastForkCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(EastForkCountCharacteristicService, {
      imports: [CodeModule, MatrixModule],
      providers: [CharacteristicContextService, SubmatrixUtilitiesService],
    });

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it("counts forks whose ink leaves by north, south, and east only", () => {
    expect(service.compute(contextService.create("05x01ye0ec0"))).toBe(2);
  });

  it("counts nothing for the other three fork orientations or a cross", () => {
    expect(service.compute(contextService.create("04x01yb7df"))).toBe(0);
  });
});

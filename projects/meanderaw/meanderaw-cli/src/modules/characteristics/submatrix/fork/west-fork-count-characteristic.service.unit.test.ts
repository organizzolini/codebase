import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CodeModule } from "../../../code/code.module";
import { MatrixModule } from "../../../matrix/matrix.module";
import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { WestForkCountCharacteristicService } from "./west-fork-count-characteristic.service";

describe(WestForkCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: WestForkCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(WestForkCountCharacteristicService, {
      imports: [CodeModule, MatrixModule],
      providers: [CharacteristicContextService, SubmatrixUtilitiesService],
    });

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it("counts forks whose ink leaves by north, south, and west only", () => {
    expect(service.compute(contextService.create("05x01yd0dc0"))).toBe(2);
  });

  it("counts nothing for the other three fork orientations or a cross", () => {
    expect(service.compute(contextService.create("04x01yb7ef"))).toBe(0);
  });
});

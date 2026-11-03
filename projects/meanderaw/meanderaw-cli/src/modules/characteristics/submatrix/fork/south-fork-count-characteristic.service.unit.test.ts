import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CodeModule } from "../../../code/code.module";
import { MatrixModule } from "../../../matrix/matrix.module";
import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { SouthForkCountCharacteristicService } from "./south-fork-count-characteristic.service";

describe(SouthForkCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: SouthForkCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      SouthForkCountCharacteristicService,
      {
        imports: [CodeModule, MatrixModule],
        providers: [CharacteristicContextService, SubmatrixUtilitiesService],
      },
    );

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it("counts forks whose ink leaves by south, east, and west only", () => {
    expect(service.compute(contextService.create("05x01y70730"))).toBe(2);
  });

  it("counts nothing for the other three fork orientations or a cross", () => {
    expect(service.compute(contextService.create("05x01yb3edf"))).toBe(0);
  });
});

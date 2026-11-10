import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CodeModule } from "../../../code/code.module";
import { MatrixModule } from "../../../matrix/matrix.module";
import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { NorthEastCornerCountCharacteristicService } from "./north-east-corner-count-characteristic.service";

describe(NorthEastCornerCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: NorthEastCornerCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      NorthEastCornerCountCharacteristicService,
      {
        imports: [CodeModule, MatrixModule],
        providers: [CharacteristicContextService, SubmatrixUtilitiesService],
      },
    );

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it("counts corners whose ink leaves by north and east only", () => {
    expect(service.compute(contextService.create("03x01ya0a"))).toBe(2);
  });

  it("counts nothing for the other three corner orientations", () => {
    expect(service.compute(contextService.create("03x01y965"))).toBe(0);
  });

  it("ignores forks and crosses that carry both arms", () => {
    expect(service.compute(contextService.create("04x01yf3eb"))).toBe(0);
  });
});

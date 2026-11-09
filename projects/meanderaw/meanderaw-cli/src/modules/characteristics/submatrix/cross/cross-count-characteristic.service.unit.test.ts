import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CodeModule } from "../../../code/code.module";
import { MatrixModule } from "../../../matrix/matrix.module";
import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { CrossCountCharacteristicService } from "./cross-count-characteristic.service";

describe(CrossCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: CrossCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(CrossCountCharacteristicService, {
      imports: [CodeModule, MatrixModule],
      providers: [CharacteristicContextService, SubmatrixUtilitiesService],
    });

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it("counts points whose ink leaves by all four arms", () => {
    expect(service.compute(contextService.create("04x01yf0f3"))).toBe(2);
  });

  it("ignores forks, which carry only three arms", () => {
    expect(service.compute(contextService.create("05x01yb7ed0"))).toBe(0);
  });
});

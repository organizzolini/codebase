import { beforeAll, describe, expect, it } from "vitest";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { EastForkCountCharacteristicService } from "./east-fork-count-characteristic.service";
import { ForkCountCharacteristicService } from "./fork-count-characteristic.service";
import { NorthForkCountCharacteristicService } from "./north-fork-count-characteristic.service";
import { SouthForkCountCharacteristicService } from "./south-fork-count-characteristic.service";
import { WestForkCountCharacteristicService } from "./west-fork-count-characteristic.service";

import type { CharacteristicContext } from "../../characteristics.types";

describe(ForkCountCharacteristicService, () => {
  describe("with the real directional fork services", () => {
    let contextService: CharacteristicContextService;
    let service: ForkCountCharacteristicService;

    beforeAll(async () => {
      const built = await buildTestingModule(ForkCountCharacteristicService, {
        imports: [CodeModule, MatrixModule],
        providers: [
          CharacteristicContextService,
          SubmatrixUtilitiesService,
          NorthForkCountCharacteristicService,
          SouthForkCountCharacteristicService,
          EastForkCountCharacteristicService,
          WestForkCountCharacteristicService,
        ],
      });

      contextService = await built.module.resolve(CharacteristicContextService);
      service = built.instance;
    });

    it("counts every fork orientation", () => {
      expect(service.compute(contextService.create("05x01yb7ed0"))).toBe(4);
    });

    it("ignores straight edges, corners, crosses, and bare points", () => {
      expect(service.compute(contextService.create("05x01y3caf0"))).toBe(0);
    });
  });

  describe("with mocked directional fork services", () => {
    const context: CharacteristicContext = {
      code: { columns: 1, digits: "0", repeats: 1, rows: 1 },
      columns: 1,
      matrix: [[{ east: false, north: false, south: false, west: false }]],
      rows: 1,
    };
    let service: ForkCountCharacteristicService;

    beforeAll(async () => {
      const built = await buildTestingModule(ForkCountCharacteristicService, {
        providers: [
          {
            provide: NorthForkCountCharacteristicService,
            useValue: { compute: (): number => 1 },
          },
          {
            provide: SouthForkCountCharacteristicService,
            useValue: { compute: (): number => 2 },
          },
          {
            provide: EastForkCountCharacteristicService,
            useValue: { compute: (): number => 4 },
          },
          {
            provide: WestForkCountCharacteristicService,
            useValue: { compute: (): number => 8 },
          },
        ],
      });

      service = built.instance;
    });

    it("sums the four directional fork counts", () => {
      expect(service.compute(context)).toBe(15);
    });
  });
});

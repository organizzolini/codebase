import { beforeAll, describe, expect, it } from "vitest";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CharacteristicContextService } from "../../characteristic-context.service";
import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import { CornerCountCharacteristicService } from "./corner-count-characteristic.service";
import { NorthEastCornerCountCharacteristicService } from "./north-east-corner-count-characteristic.service";
import { NorthWestCornerCountCharacteristicService } from "./north-west-corner-count-characteristic.service";
import { SouthEastCornerCountCharacteristicService } from "./south-east-corner-count-characteristic.service";
import { SouthWestCornerCountCharacteristicService } from "./south-west-corner-count-characteristic.service";

import type { CharacteristicContext } from "../../characteristics.types";

describe(CornerCountCharacteristicService, () => {
  describe("with the real directional corner services", () => {
    let contextService: CharacteristicContextService;
    let service: CornerCountCharacteristicService;

    beforeAll(async () => {
      const built = await buildTestingModule(CornerCountCharacteristicService, {
        imports: [CodeModule, MatrixModule],
        providers: [
          CharacteristicContextService,
          SubmatrixUtilitiesService,
          NorthEastCornerCountCharacteristicService,
          NorthWestCornerCountCharacteristicService,
          SouthEastCornerCountCharacteristicService,
          SouthWestCornerCountCharacteristicService,
        ],
      });

      contextService = await built.module.resolve(CharacteristicContextService);
      service = built.instance;
    });

    it("counts every corner orientation", () => {
      expect(service.compute(contextService.create("05x01ya9650"))).toBe(4);
    });

    it("ignores straight edges, forks, crosses, and bare points", () => {
      expect(service.compute(contextService.create("05x01y3c7f0"))).toBe(0);
    });
  });

  describe("with mocked directional corner services", () => {
    const context: CharacteristicContext = {
      code: { columns: 1, digits: "0", repeats: 1, rows: 1 },
      columns: 1,
      matrix: [[{ east: false, north: false, south: false, west: false }]],
      rows: 1,
    };
    let service: CornerCountCharacteristicService;

    beforeAll(async () => {
      const built = await buildTestingModule(CornerCountCharacteristicService, {
        providers: [
          {
            provide: NorthEastCornerCountCharacteristicService,
            useValue: { compute: (): number => 1 },
          },
          {
            provide: NorthWestCornerCountCharacteristicService,
            useValue: { compute: (): number => 2 },
          },
          {
            provide: SouthEastCornerCountCharacteristicService,
            useValue: { compute: (): number => 4 },
          },
          {
            provide: SouthWestCornerCountCharacteristicService,
            useValue: { compute: (): number => 8 },
          },
        ],
      });

      service = built.instance;
    });

    it("sums the four directional corner counts", () => {
      expect(service.compute(context)).toBe(15);
    });
  });
});

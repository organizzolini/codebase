import { beforeAll, describe, expect, it } from "vitest";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphModule } from "../../../graph/graph.module";
import { CharacteristicContextService } from "../../characteristic-context.service";
import { ConnectivityService } from "../../connectivity/connectivity.service";

import { TileCrossingComponentDeltaCountCharacteristicService } from "./tile-crossing-component-delta-count-characteristic.service";

describe(TileCrossingComponentDeltaCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: TileCrossingComponentDeltaCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      TileCrossingComponentDeltaCountCharacteristicService,
      {
        imports: [CodeModule, GraphModule, MatrixModule],
        providers: [CharacteristicContextService, ConnectivityService],
      },
    );

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it.each([
    { code: "02x02y65a9", expected: 0, shape: "a closed loop inside the tile" },
    {
      code: "02x02y56a9",
      expected: 0,
      shape: "a zigzag whose only loop closes across the tile boundary",
    },
    {
      code: "03x01y102",
      expected: 1,
      shape: "two stubs joined only across the tile boundary",
    },
    {
      code: "01x03y303",
      expected: 0,
      shape:
        "two rules that each close onto themselves across the tile boundary",
    },
  ])(
    "counts $expected components merged by the tile boundary in $shape",
    ({ code, expected }) => {
      expect(service.compute(contextService.create(code))).toBe(expected);
    },
  );
});

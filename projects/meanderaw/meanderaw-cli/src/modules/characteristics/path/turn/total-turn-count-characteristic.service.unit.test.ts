import { beforeAll, describe, expect, it } from "vitest";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphModule } from "../../../graph/graph.module";
import { CharacteristicContextService } from "../../characteristic-context.service";
import { ConnectivityService } from "../../connectivity/connectivity.service";
import { PathUtilitiesService } from "../path-utilities.service";

import { TotalTurnCountCharacteristicService } from "./total-turn-count-characteristic.service";

describe(TotalTurnCountCharacteristicService, () => {
  let contextService: CharacteristicContextService;
  let service: TotalTurnCountCharacteristicService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      TotalTurnCountCharacteristicService,
      {
        imports: [CodeModule, GraphModule, MatrixModule],
        providers: [
          CharacteristicContextService,
          ConnectivityService,
          PathUtilitiesService,
        ],
      },
    );

    contextService = await built.module.resolve(CharacteristicContextService);
    service = built.instance;
  });

  it.each([
    { code: "02x02y65a9", expected: 4, shape: "a closed unit square loop" },
    { code: "02x02y6588", expected: 2, shape: "a hairpin U-turn" },
    {
      code: "03x02y2500a1",
      expected: 2,
      shape: "a step that turns one way and then the other",
    },
    {
      code: "02x02y56a9",
      expected: 4,
      shape: "a square wave closing across the tile boundary",
    },
    {
      code: "03x02y675888",
      expected: 2,
      shape: "a fork whose two arms each bend down",
    },
    {
      code: "03x03y635c29a31",
      expected: 4,
      shape: "a spiral turning left four times",
    },
    {
      code: "03x02y650ab1",
      expected: 3,
      shape:
        "a loop hanging from a junction, which ends the strand at both sides",
    },
    {
      code: "01x03y303",
      expected: 0,
      shape: "two rules closing onto themselves across the tile boundary",
    },
    { code: "01x03y000", expected: 0, shape: "three isolated dots" },
  ])("counts $expected turns along $shape", ({ code, expected }) => {
    expect(service.compute(contextService.create(code))).toBe(expected);
  });
});

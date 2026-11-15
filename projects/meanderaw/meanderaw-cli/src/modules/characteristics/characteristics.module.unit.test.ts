import { MODULE_METADATA } from "@nestjs/common/constants";
import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CodeModule } from "../code/code.module";
import { MatrixModule } from "../matrix/matrix.module";

import { CharacteristicContextService } from "./characteristic-context.service";
import {
  BOOLEAN_CHARACTERISTIC_KEY_SET,
  CHARACTERISTIC_KEYS,
  LETTER_CHARACTERISTIC_KEYS,
} from "./characteristics.constants";
import { CharacteristicsModule } from "./characteristics.module";
import { IsArcadeCharacteristicService } from "./modules/compound/modules/pattern/is-arcade-characteristic.service";
import { IsBarsCharacteristicService } from "./modules/compound/modules/pattern/is-bars-characteristic.service";
import { IsBoxesCharacteristicService } from "./modules/compound/modules/pattern/is-boxes-characteristic.service";
import { IsChainCharacteristicService } from "./modules/compound/modules/pattern/is-chain-characteristic.service";
import { IsClaspsCharacteristicService } from "./modules/compound/modules/pattern/is-clasps-characteristic.service";
import { IsCombCharacteristicService } from "./modules/compound/modules/pattern/is-comb-characteristic.service";
import { IsCrossCharacteristicService } from "./modules/compound/modules/pattern/is-cross-characteristic.service";
import { IsDotsCharacteristicService } from "./modules/compound/modules/pattern/is-dots-characteristic.service";
import { IsDoubleChainCharacteristicService } from "./modules/compound/modules/pattern/is-double-chain-characteristic.service";
import { IsForkCharacteristicService } from "./modules/compound/modules/pattern/is-fork-characteristic.service";
import { IsLinesCharacteristicService } from "./modules/compound/modules/pattern/is-lines-characteristic.service";
import { IsMeshCharacteristicService } from "./modules/compound/modules/pattern/is-mesh-characteristic.service";
import { IsParallelCharacteristicService } from "./modules/compound/modules/pattern/is-parallel-characteristic.service";
import { IsPureTreeCharacteristicService } from "./modules/compound/modules/pattern/is-pure-tree-characteristic.service";
import { IsSnakeCharacteristicService } from "./modules/compound/modules/pattern/is-snake-characteristic.service";
import { IsSwirlCharacteristicService } from "./modules/compound/modules/pattern/is-swirl-characteristic.service";
import { IsWaterfallsCharacteristicService } from "./modules/compound/modules/pattern/is-waterfalls-characteristic.service";
import { IsWhirlCharacteristicService } from "./modules/compound/modules/pattern/is-whirl-characteristic.service";
import { IsClosedLoopCharacteristicService } from "./modules/compound/modules/structure/is-closed-loop-characteristic.service";
import { IsSingleArcCharacteristicService } from "./modules/compound/modules/structure/is-single-arc-characteristic.service";
import { EndsAreLatticeNeighborsCharacteristicService } from "./modules/path/modules/end/ends-are-lattice-neighbors-characteristic.service";
import { EndsOnBorderRulesCharacteristicService } from "./modules/path/modules/end/ends-on-border-rules-characteristic.service";
import { TileCrossingComponentDeltaCountCharacteristicService } from "./modules/path/modules/tile-crossing/tile-crossing-component-delta-count-characteristic.service";
import { TileCrossingCountCharacteristicService } from "./modules/path/modules/tile-crossing/tile-crossing-count-characteristic.service";
import { TileCrossingCycleCountCharacteristicService } from "./modules/path/modules/tile-crossing/tile-crossing-cycle-count-characteristic.service";
import { BettiNumber0CountCharacteristicService } from "./modules/path/modules/topology/betti-number-0-count-characteristic.service";
import { BettiNumber1CountCharacteristicService } from "./modules/path/modules/topology/betti-number-1-count-characteristic.service";
import { FreeEndCountCharacteristicService } from "./modules/path/modules/topology/free-end-count-characteristic.service";
import { BottomBorderTouchCountCharacteristicService } from "./modules/path/modules/turn/bottom-border-touch-count-characteristic.service";
import { InflectionCountCharacteristicService } from "./modules/path/modules/turn/inflection-count-characteristic.service";
import { MaxMonotonicTurnLengthCharacteristicService } from "./modules/path/modules/turn/max-monotonic-turn-length-characteristic.service";
import { ReversesAtItsTightestTurnCharacteristicService } from "./modules/path/modules/turn/reverses-at-its-tightest-turn-characteristic.service";
import { TightestTurnCountCharacteristicService } from "./modules/path/modules/turn/tightest-turn-count-characteristic.service";
import { TopBorderTouchCountCharacteristicService } from "./modules/path/modules/turn/top-border-touch-count-characteristic.service";
import { TotalTurnCountCharacteristicService } from "./modules/path/modules/turn/total-turn-count-characteristic.service";
import { CornerCountCharacteristicService } from "./modules/submatrix/modules/corner/corner-count-characteristic.service";
import { NorthEastCornerCountCharacteristicService } from "./modules/submatrix/modules/corner/north-east-corner-count-characteristic.service";
import { NorthWestCornerCountCharacteristicService } from "./modules/submatrix/modules/corner/north-west-corner-count-characteristic.service";
import { SouthEastCornerCountCharacteristicService } from "./modules/submatrix/modules/corner/south-east-corner-count-characteristic.service";
import { SouthWestCornerCountCharacteristicService } from "./modules/submatrix/modules/corner/south-west-corner-count-characteristic.service";
import { CrossCountCharacteristicService } from "./modules/submatrix/modules/cross/cross-count-characteristic.service";
import { EmbeddedUCountCharacteristicService } from "./modules/submatrix/modules/embedded/embedded-u-count-characteristic.service";
import { EastForkCountCharacteristicService } from "./modules/submatrix/modules/fork/east-fork-count-characteristic.service";
import { ForkCountCharacteristicService } from "./modules/submatrix/modules/fork/fork-count-characteristic.service";
import { NorthForkCountCharacteristicService } from "./modules/submatrix/modules/fork/north-fork-count-characteristic.service";
import { SouthForkCountCharacteristicService } from "./modules/submatrix/modules/fork/south-fork-count-characteristic.service";
import { WestForkCountCharacteristicService } from "./modules/submatrix/modules/fork/west-fork-count-characteristic.service";
import { LetterCharacteristicsModule } from "./modules/submatrix/modules/letter/letter-characteristics.module";
import {
  LETTER_ORIENTATION_NAMES,
  LETTER_SCRIPTS,
} from "./modules/submatrix/modules/letter/letter.constants";
import { DensityCharacteristicService } from "./modules/submatrix/modules/point/density-characteristic.service";
import { DotCountCharacteristicService } from "./modules/submatrix/modules/point/dot-count-characteristic.service";
import { DoubleHorizontalEdgeCountCharacteristicService } from "./modules/submatrix/modules/point/double-horizontal-edge-count-characteristic.service";
import { DoubleVerticalEdgeCountCharacteristicService } from "./modules/submatrix/modules/point/double-vertical-edge-count-characteristic.service";
import { EastEdgeCountCharacteristicService } from "./modules/submatrix/modules/point/east-edge-count-characteristic.service";
import { EdgeCountCharacteristicService } from "./modules/submatrix/modules/point/edge-count-characteristic.service";
import { InkPointCountCharacteristicService } from "./modules/submatrix/modules/point/ink-point-count-characteristic.service";
import { NorthEdgeCountCharacteristicService } from "./modules/submatrix/modules/point/north-edge-count-characteristic.service";
import { SouthEdgeCountCharacteristicService } from "./modules/submatrix/modules/point/south-edge-count-characteristic.service";
import { WestEdgeCountCharacteristicService } from "./modules/submatrix/modules/point/west-edge-count-characteristic.service";
import { HorizontalRectangleCountCharacteristicService } from "./modules/submatrix/modules/rectangle/horizontal-rectangle-count-characteristic.service";
import { VerticalRectangleCountCharacteristicService } from "./modules/submatrix/modules/rectangle/vertical-rectangle-count-characteristic.service";
import { LongestHorizontalRunLengthCharacteristicService } from "./modules/submatrix/modules/run/longest-horizontal-run-length-characteristic.service";
import { LongestVerticalRunLengthCharacteristicService } from "./modules/submatrix/modules/run/longest-vertical-run-length-characteristic.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
  SubmatrixWindow,
} from "./characteristics.types";
import type { Type } from "@nestjs/common";

/** Whether a module export is a letter service, which its class name marks, so the letter module's exports can be read without a cast. */
function isLetterService(
  value: unknown,
): value is Type<CharacteristicEvaluatorGroup<number>> {
  return (
    typeof value === "function" &&
    value.name.endsWith("LetterCharacteristicsService")
  );
}

/**
 * The letter module's exports list, read from its `@Module` metadata. Throws when
 * missing, so a letter module that drops it fails the tests.
 */
function letterModuleExports(): readonly unknown[] {
  const exported: unknown = Reflect.getMetadata(
    MODULE_METADATA.EXPORTS,
    LetterCharacteristicsModule,
  );
  if (!Array.isArray(exported)) {
    throw new TypeError("LetterCharacteristicsModule declares no exports list");
  }

  return exported;
}

/** Every letter service `CharacteristicsModule` must provide. */
const LETTER_SERVICES: readonly Type<CharacteristicEvaluatorGroup<number>>[] =
  letterModuleExports().filter((value) => isLetterService(value));

/** Every standalone evaluator a consumer must be able to inject. */
const CHARACTERISTIC_SERVICES: readonly Type<CharacteristicEvaluator>[] = [
  BettiNumber0CountCharacteristicService,
  BettiNumber1CountCharacteristicService,
  BottomBorderTouchCountCharacteristicService,
  CornerCountCharacteristicService,
  CrossCountCharacteristicService,
  DensityCharacteristicService,
  DotCountCharacteristicService,
  DoubleHorizontalEdgeCountCharacteristicService,
  DoubleVerticalEdgeCountCharacteristicService,
  EastEdgeCountCharacteristicService,
  EastForkCountCharacteristicService,
  EdgeCountCharacteristicService,
  EmbeddedUCountCharacteristicService,
  EndsAreLatticeNeighborsCharacteristicService,
  EndsOnBorderRulesCharacteristicService,
  ForkCountCharacteristicService,
  FreeEndCountCharacteristicService,
  HorizontalRectangleCountCharacteristicService,
  InflectionCountCharacteristicService,
  InkPointCountCharacteristicService,
  IsArcadeCharacteristicService,
  IsBarsCharacteristicService,
  IsBoxesCharacteristicService,
  IsChainCharacteristicService,
  IsClaspsCharacteristicService,
  IsClosedLoopCharacteristicService,
  IsCombCharacteristicService,
  IsCrossCharacteristicService,
  IsDotsCharacteristicService,
  IsDoubleChainCharacteristicService,
  IsForkCharacteristicService,
  IsLinesCharacteristicService,
  IsMeshCharacteristicService,
  IsParallelCharacteristicService,
  IsPureTreeCharacteristicService,
  IsSingleArcCharacteristicService,
  IsSnakeCharacteristicService,
  IsSwirlCharacteristicService,
  IsWaterfallsCharacteristicService,
  IsWhirlCharacteristicService,
  LongestHorizontalRunLengthCharacteristicService,
  LongestVerticalRunLengthCharacteristicService,
  MaxMonotonicTurnLengthCharacteristicService,
  NorthEastCornerCountCharacteristicService,
  NorthEdgeCountCharacteristicService,
  NorthForkCountCharacteristicService,
  NorthWestCornerCountCharacteristicService,
  ReversesAtItsTightestTurnCharacteristicService,
  SouthEastCornerCountCharacteristicService,
  SouthEdgeCountCharacteristicService,
  SouthForkCountCharacteristicService,
  SouthWestCornerCountCharacteristicService,
  TightestTurnCountCharacteristicService,
  TileCrossingComponentDeltaCountCharacteristicService,
  TileCrossingCountCharacteristicService,
  TileCrossingCycleCountCharacteristicService,
  TopBorderTouchCountCharacteristicService,
  TotalTurnCountCharacteristicService,
  VerticalRectangleCountCharacteristicService,
  WestEdgeCountCharacteristicService,
  WestForkCountCharacteristicService,
];

/** A letter class name gives its key stem and script. */
const LETTER_SERVICE_NAME = new RegExp(
  String.raw`^(?<stem>\w+?)(?<script>${Object.keys(LETTER_SCRIPTS).join("|")})LetterCharacteristicsService$`,
  "u",
);

/** The lattice-point window each non-letter submatrix evaluator reads. */
const WINDOWS: Readonly<Record<string, SubmatrixWindow>> = {
  cornerCount: { columns: 1, rows: 1 },
  crossCount: { columns: 1, rows: 1 },
  density: { columns: 1, rows: 1 },
  dotCount: { columns: 1, rows: 1 },
  doubleHorizontalEdgeCount: { columns: 1, rows: 1 },
  doubleVerticalEdgeCount: { columns: 1, rows: 1 },
  eastEdgeCount: { columns: 1, rows: 1 },
  eastForkCount: { columns: 1, rows: 1 },
  edgeCount: { columns: 1, rows: 1 },
  embeddedUCount: { columns: 2, rows: 2 },
  forkCount: { columns: 1, rows: 1 },
  horizontalRectangleCount: { columns: 3, rows: 2, variable: true },
  inkPointCount: { columns: 1, rows: 1 },
  longestHorizontalRunLength: { columns: 2, rows: 1, variable: true },
  longestVerticalRunLength: { columns: 1, rows: 2, variable: true },
  northEastCornerCount: { columns: 1, rows: 1 },
  northEdgeCount: { columns: 1, rows: 1 },
  northForkCount: { columns: 1, rows: 1 },
  northWestCornerCount: { columns: 1, rows: 1 },
  southEastCornerCount: { columns: 1, rows: 1 },
  southEdgeCount: { columns: 1, rows: 1 },
  southForkCount: { columns: 1, rows: 1 },
  southWestCornerCount: { columns: 1, rows: 1 },
  verticalRectangleCount: { columns: 2, rows: 3, variable: true },
  westEdgeCount: { columns: 1, rows: 1 },
  westForkCount: { columns: 1, rows: 1 },
};

/** The token consumers gather every evaluator under; only exports resolve. */
const EVALUATORS = Symbol("EVALUATORS");

/** The token a consumer gathers every letter service under. */
const LETTERS = Symbol("LETTERS");

/** The metadata key a service's class name promises: `DotCountCharacteristicService` fills `dotCount`. */
function expectedKey(service: Type<CharacteristicEvaluator>): string {
  const stem = service.name.replace(/CharacteristicService$/u, "");

  return stem.charAt(0).toLowerCase() + stem.slice(1);
}

/**
 * The metadata keys a letter service's class name promises, in key-list order.
 * Forms are read off the key list, not pinned here.
 */
function expectedLetterKeys(
  service: Type<CharacteristicEvaluatorGroup<number>>,
): readonly string[] {
  const { script = "", stem = "" } =
    LETTER_SERVICE_NAME.exec(service.name)?.groups ?? {};
  const letter = stem.charAt(0).toLowerCase() + stem.slice(1);
  const pattern = new RegExp(
    `^${letter}(?:Final|Initial|Isolated|Medial)?(?:${LETTER_ORIENTATION_NAMES.join("|")})${script}Count$`,
    "u",
  );

  return LETTER_CHARACTERISTIC_KEYS.filter((key) => pattern.test(key));
}

describe(CharacteristicsModule, () => {
  let evaluators: readonly CharacteristicEvaluator[];
  let letters: readonly CharacteristicEvaluatorGroup<number>[];

  beforeAll(async () => {
    const { module } = await buildTestingModule(CharacteristicContextService, {
      imports: [CodeModule, MatrixModule, CharacteristicsModule],
      providers: [
        {
          inject: [...CHARACTERISTIC_SERVICES],
          provide: EVALUATORS,
          useFactory: (
            ...injected: CharacteristicEvaluator[]
          ): CharacteristicEvaluator[] => injected,
        },
        {
          inject: [...LETTER_SERVICES],
          provide: LETTERS,
          useFactory: (
            ...injected: CharacteristicEvaluatorGroup<number>[]
          ): CharacteristicEvaluatorGroup<number>[] => injected,
        },
      ],
    });

    letters = module.get<CharacteristicEvaluatorGroup<number>[]>(LETTERS);
    evaluators = [
      ...module.get<CharacteristicEvaluator[]>(EVALUATORS),
      ...letters.flatMap((letter) => letter.evaluators),
    ];
  });

  describe.each(
    CHARACTERISTIC_SERVICES.map((service, index) => ({
      index,
      name: service.name,
      service,
    })),
  )("$name", ({ index, service }) => {
    it("is exported to a consumer that imports the module", () => {
      expect(evaluators[index]).toBeInstanceOf(service);
    });

    it("names its metadata key after its class", () => {
      expect(evaluators[index]?.metadata.key).toBe(expectedKey(service));
    });

    it("describes itself with a display name, a description, and a known category", () => {
      const metadata = evaluators[index]?.metadata;

      expect(metadata?.name).not.toBe("");
      expect(metadata?.description).not.toBe("");
      expect(["compound", "path", "submatrix"]).toContain(metadata?.category);
    });

    it("declares a submatrix window exactly when its category is submatrix", () => {
      const metadata = evaluators[index]?.metadata;

      expect(metadata?.submatrix !== undefined).toBe(
        metadata?.category === "submatrix",
      );
    });
  });

  describe.each(
    LETTER_SERVICES.map((service, index) => ({
      index,
      name: service.name,
      service,
    })),
  )("$name", ({ index, service }) => {
    it("is exported to a consumer that imports the module", () => {
      expect(letters[index]).toBeInstanceOf(service);
    });

    it("keys its orientation evaluators after its class", () => {
      expect(
        letters[index]?.evaluators.map(({ metadata }) => metadata.key),
      ).toStrictEqual(expectedLetterKeys(service));
    });

    it("describes every orientation with a display name, a description, and the submatrix category", () => {
      const described = letters[index]?.evaluators.map(
        ({ metadata }) =>
          metadata.name !== "" &&
          metadata.description !== "" &&
          metadata.category === "submatrix",
      );

      expect(described).toStrictEqual(
        expectedLetterKeys(service).map(() => true),
      );
    });
  });

  it("derives every letter key from exactly one letter service's class name", () => {
    expect(
      LETTER_SERVICES.flatMap((service) =>
        expectedLetterKeys(service),
      ).toSorted(),
    ).toStrictEqual([...LETTER_CHARACTERISTIC_KEYS].toSorted());
  });

  it("gives every characteristic evaluator a unique metadata key", () => {
    const keys = evaluators.map((evaluator) => evaluator.metadata.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("covers exactly the characteristic key list, in both directions", () => {
    const keys = evaluators.map((evaluator) => evaluator.metadata.key);

    expect(keys.toSorted()).toStrictEqual([...CHARACTERISTIC_KEYS].toSorted());
  });

  it("sizes every declared submatrix window in whole lattice points", () => {
    const windows = evaluators.flatMap(({ metadata }) =>
      metadata.submatrix === undefined ? [] : [metadata.submatrix],
    );

    expect(
      windows.filter(
        ({ columns, rows }) =>
          !Number.isInteger(columns) ||
          !Number.isInteger(rows) ||
          columns < 1 ||
          rows < 1,
      ),
    ).toStrictEqual([]);
  });

  it("declares the window each non-letter submatrix evaluator reads", () => {
    const letterKeys: ReadonlySet<string> = new Set(LETTER_CHARACTERISTIC_KEYS);
    const declared = Object.fromEntries(
      evaluators
        .filter(({ metadata }) => !letterKeys.has(metadata.key))
        .flatMap(({ metadata }) =>
          metadata.submatrix === undefined
            ? []
            : [[metadata.key, metadata.submatrix]],
        ),
    );

    expect(declared).toStrictEqual(WINDOWS);
  });

  it("declares the value type each key's list promises", () => {
    const declared = evaluators.map(({ metadata }) => [
      metadata.key,
      metadata.valueType,
    ]);
    const promised = evaluators.map(({ metadata }) => [
      metadata.key,
      BOOLEAN_CHARACTERISTIC_KEY_SET.has(metadata.key) ? "boolean" : "number",
    ]);

    expect(declared).toStrictEqual(promised);
  });
});

import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { SubmatrixUtilitiesService } from "../../submatrix-utilities.service";

import { LetterCharacteristicsModule } from "./letter-characteristics.module";
import { LetterUtilitiesService } from "./letter-utilities.service";
import { LETTER_ORIENTATION_NAMES, LETTER_SCRIPTS } from "./letter.constants";
import { AinArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/ain-arabic-letter-characteristics.service";
import { AlefArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/alef-arabic-letter-characteristics.service";
import { BehArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/beh-arabic-letter-characteristics.service";
import { DalArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/dal-arabic-letter-characteristics.service";
import { FehArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/feh-arabic-letter-characteristics.service";
import { HahArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/hah-arabic-letter-characteristics.service";
import { HehArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/heh-arabic-letter-characteristics.service";
import { KafArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/kaf-arabic-letter-characteristics.service";
import { LamArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/lam-arabic-letter-characteristics.service";
import { MeemArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/meem-arabic-letter-characteristics.service";
import { NoonArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/noon-arabic-letter-characteristics.service";
import { QafArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/qaf-arabic-letter-characteristics.service";
import { RehArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/reh-arabic-letter-characteristics.service";
import { SadArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/sad-arabic-letter-characteristics.service";
import { SeenArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/seen-arabic-letter-characteristics.service";
import { TahArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/tah-arabic-letter-characteristics.service";
import { WawArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/waw-arabic-letter-characteristics.service";
import { YehArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/yeh-arabic-letter-characteristics.service";
import { DeltaGreekLetterCharacteristicsService } from "./modules/greek-delta-to-omega/delta-greek-letter-characteristics.service";
import { KappaGreekLetterCharacteristicsService } from "./modules/greek-delta-to-omega/kappa-greek-letter-characteristics.service";
import { LambdaGreekLetterCharacteristicsService } from "./modules/greek-delta-to-omega/lambda-greek-letter-characteristics.service";
import { OmegaGreekLetterCharacteristicsService } from "./modules/greek-delta-to-omega/omega-greek-letter-characteristics.service";
import { PhiGreekLetterCharacteristicsService } from "./modules/greek-phi-to-sigma/phi-greek-letter-characteristics.service";
import { PsiGreekLetterCharacteristicsService } from "./modules/greek-phi-to-sigma/psi-greek-letter-characteristics.service";
import { RhoGreekLetterCharacteristicsService } from "./modules/greek-phi-to-sigma/rho-greek-letter-characteristics.service";
import { SigmaGreekLetterCharacteristicsService } from "./modules/greek-phi-to-sigma/sigma-greek-letter-characteristics.service";
import { KieukHangulLetterCharacteristicsService } from "./modules/hangul/kieuk-hangul-letter-characteristics.service";
import { PieupHangulLetterCharacteristicsService } from "./modules/hangul/pieup-hangul-letter-characteristics.service";
import { YaHangulLetterCharacteristicsService } from "./modules/hangul/ya-hangul-letter-characteristics.service";
import { YeoHangulLetterCharacteristicsService } from "./modules/hangul/yeo-hangul-letter-characteristics.service";
import { YoHangulLetterCharacteristicsService } from "./modules/hangul/yo-hangul-letter-characteristics.service";
import { YuHangulLetterCharacteristicsService } from "./modules/hangul/yu-hangul-letter-characteristics.service";
import { AoHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/ao-hanzi-letter-characteristics.service";
import { GanHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/gan-hanzi-letter-characteristics.service";
import { JiaHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/jia-hanzi-letter-characteristics.service";
import { JingHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/jing-hanzi-letter-characteristics.service";
import { MuHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/mu-hanzi-letter-characteristics.service";
import { ShangHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/shang-hanzi-letter-characteristics.service";
import { ShenHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/shen-hanzi-letter-characteristics.service";
import { TianHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/tian-hanzi-letter-characteristics.service";
import { TuHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/tu-hanzi-letter-characteristics.service";
import { TuSoilHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/tu-soil-hanzi-letter-characteristics.service";
import { WangHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/wang-hanzi-letter-characteristics.service";
import { YouHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/you-hanzi-letter-characteristics.service";
import { DaletHebrewLetterCharacteristicsService } from "./modules/hebrew-katakana/dalet-hebrew-letter-characteristics.service";
import { LamedHebrewLetterCharacteristicsService } from "./modules/hebrew-katakana/lamed-hebrew-letter-characteristics.service";
import { TavHebrewLetterCharacteristicsService } from "./modules/hebrew-katakana/tav-hebrew-letter-characteristics.service";
import { YuKatakanaLetterCharacteristicsService } from "./modules/hebrew-katakana/yu-katakana-letter-characteristics.service";
import { ALatinLetterCharacteristicsService } from "./modules/latin-a-to-h/a-latin-letter-characteristics.service";
import { BLatinLetterCharacteristicsService } from "./modules/latin-a-to-h/b-latin-letter-characteristics.service";
import { CLatinLetterCharacteristicsService } from "./modules/latin-a-to-h/c-latin-letter-characteristics.service";
import { ELatinLetterCharacteristicsService } from "./modules/latin-a-to-h/e-latin-letter-characteristics.service";
import { FLatinLetterCharacteristicsService } from "./modules/latin-a-to-h/f-latin-letter-characteristics.service";
import { HLatinLetterCharacteristicsService } from "./modules/latin-a-to-h/h-latin-letter-characteristics.service";
import { ILatinLetterCharacteristicsService } from "./modules/latin-i-to-s/i-latin-letter-characteristics.service";
import { LLatinLetterCharacteristicsService } from "./modules/latin-i-to-s/l-latin-letter-characteristics.service";
import { MLatinLetterCharacteristicsService } from "./modules/latin-i-to-s/m-latin-letter-characteristics.service";
import { NLatinLetterCharacteristicsService } from "./modules/latin-i-to-s/n-latin-letter-characteristics.service";
import { OLatinLetterCharacteristicsService } from "./modules/latin-i-to-s/o-latin-letter-characteristics.service";
import { SLatinLetterCharacteristicsService } from "./modules/latin-i-to-s/s-latin-letter-characteristics.service";
import { TLatinLetterCharacteristicsService } from "./modules/latin-t-to-z/t-latin-letter-characteristics.service";
import { ULatinLetterCharacteristicsService } from "./modules/latin-t-to-z/u-latin-letter-characteristics.service";
import { WLatinLetterCharacteristicsService } from "./modules/latin-t-to-z/w-latin-letter-characteristics.service";
import { XLatinLetterCharacteristicsService } from "./modules/latin-t-to-z/x-latin-letter-characteristics.service";
import { YLatinLetterCharacteristicsService } from "./modules/latin-t-to-z/y-latin-letter-characteristics.service";
import { ZLatinLetterCharacteristicsService } from "./modules/latin-t-to-z/z-latin-letter-characteristics.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../../../characteristics.types";
import type { LetterScript } from "./letter.types";
import type { Type } from "@nestjs/common";

/** Every letter service the module provides. */
const LETTERS: readonly Type<CharacteristicEvaluatorGroup<number>>[] = [
  ALatinLetterCharacteristicsService,
  AinArabicLetterCharacteristicsService,
  AlefArabicLetterCharacteristicsService,
  AoHanziLetterCharacteristicsService,
  BLatinLetterCharacteristicsService,
  BehArabicLetterCharacteristicsService,
  CLatinLetterCharacteristicsService,
  DalArabicLetterCharacteristicsService,
  DaletHebrewLetterCharacteristicsService,
  DeltaGreekLetterCharacteristicsService,
  ELatinLetterCharacteristicsService,
  FLatinLetterCharacteristicsService,
  FehArabicLetterCharacteristicsService,
  GanHanziLetterCharacteristicsService,
  HLatinLetterCharacteristicsService,
  HahArabicLetterCharacteristicsService,
  HehArabicLetterCharacteristicsService,
  ILatinLetterCharacteristicsService,
  JiaHanziLetterCharacteristicsService,
  JingHanziLetterCharacteristicsService,
  KafArabicLetterCharacteristicsService,
  KappaGreekLetterCharacteristicsService,
  KieukHangulLetterCharacteristicsService,
  LLatinLetterCharacteristicsService,
  LamArabicLetterCharacteristicsService,
  LambdaGreekLetterCharacteristicsService,
  LamedHebrewLetterCharacteristicsService,
  MLatinLetterCharacteristicsService,
  MeemArabicLetterCharacteristicsService,
  MuHanziLetterCharacteristicsService,
  NLatinLetterCharacteristicsService,
  NoonArabicLetterCharacteristicsService,
  OLatinLetterCharacteristicsService,
  OmegaGreekLetterCharacteristicsService,
  PhiGreekLetterCharacteristicsService,
  PieupHangulLetterCharacteristicsService,
  PsiGreekLetterCharacteristicsService,
  QafArabicLetterCharacteristicsService,
  RehArabicLetterCharacteristicsService,
  RhoGreekLetterCharacteristicsService,
  SLatinLetterCharacteristicsService,
  SadArabicLetterCharacteristicsService,
  SeenArabicLetterCharacteristicsService,
  ShangHanziLetterCharacteristicsService,
  ShenHanziLetterCharacteristicsService,
  SigmaGreekLetterCharacteristicsService,
  TLatinLetterCharacteristicsService,
  TahArabicLetterCharacteristicsService,
  TavHebrewLetterCharacteristicsService,
  TianHanziLetterCharacteristicsService,
  TuHanziLetterCharacteristicsService,
  TuSoilHanziLetterCharacteristicsService,
  ULatinLetterCharacteristicsService,
  WLatinLetterCharacteristicsService,
  WangHanziLetterCharacteristicsService,
  WawArabicLetterCharacteristicsService,
  XLatinLetterCharacteristicsService,
  YLatinLetterCharacteristicsService,
  YaHangulLetterCharacteristicsService,
  YehArabicLetterCharacteristicsService,
  YeoHangulLetterCharacteristicsService,
  YoHangulLetterCharacteristicsService,
  YouHanziLetterCharacteristicsService,
  YuHangulLetterCharacteristicsService,
  YuKatakanaLetterCharacteristicsService,
  ZLatinLetterCharacteristicsService,
];

/** Token a consumer gathers exported letter services under. */
const GROUPS = Symbol("GROUPS");

/** Script a letter key names, read from its end. */
const SCRIPT = new RegExp(
  `(${Object.keys(LETTER_SCRIPTS).join("|")})Count$`,
  "u",
);

/** Key's orientation and script, leaving the letter and form. */
const ORIENTATION = new RegExp(
  `(?:${LETTER_ORIENTATION_NAMES.join("|")})(?:${Object.keys(LETTER_SCRIPTS).join("|")})Count$`,
  "u",
);

/** Whether a string names a letter script, so a key's script can be looked up without a cast. */
function isLetterScript(value: string | undefined): value is LetterScript {
  return value !== undefined && Object.hasOwn(LETTER_SCRIPTS, value);
}

/**
 * The glyph a letter formula typesets, with blank border rows and columns trimmed, so a padded template reads as the glyph it pads.
 */
function trimmedGlyph(formula: string): string {
  const blank = String.raw`\cdot`;
  const matrix = /\\begin\{matrix\} (.*) \\end\{matrix\}/u.exec(formula)?.[1];
  const rows = (matrix ?? "")
    .split(String.raw` \\ `)
    .map((row) => row.split(" & "));
  const inkedRows = rows.flatMap((cells, row) =>
    cells.some((cell) => cell !== blank) ? [row] : [],
  );
  const inkedColumns = rows.flatMap((cells) =>
    cells.flatMap((cell, column) => (cell === blank ? [] : [column])),
  );
  const left = Math.min(...inkedColumns);
  const right = Math.max(...inkedColumns);

  return rows
    .slice(Math.min(...inkedRows), Math.max(...inkedRows) + 1)
    .map((cells) => cells.slice(left, right + 1).join(" & "))
    .join(String.raw` \\ `);
}

/** Code digit arm: its bit, neighbor step, and return bit. */
const ARMS = [
  { back: 4, bit: 8, column: 0, row: -1 },
  { back: 8, bit: 4, column: 0, row: 1 },
  { back: 1, bit: 2, column: 1, row: 0 },
  { back: 2, bit: 1, column: -1, row: 0 },
] as const;

/** The arms of the point at `(row, column)`, or none for a blank or a point off the glyph's edge. */
function armsAt(
  digits: readonly (readonly number[])[],
  row: number,
  column: number,
): number {
  return Math.max(0, digits[row]?.[column] ?? 0);
}

/** A trimmed glyph read back into its Code digits, row by row, with each blank as -1. */
function glyphDigits(glyph: string): number[][] {
  return glyph
    .split(String.raw` \\ `)
    .map((row) =>
      row
        .split(" & ")
        .map((cell) =>
          cell === String.raw`\cdot` ? -1 : Number.parseInt(cell, 16),
        ),
    );
}

/** The neighbors a point's arms reach that carry each arm back. */
function joinedNeighbors(
  digits: readonly (readonly number[])[],
  row: number,
  column: number,
): { column: number; row: number }[] {
  return ARMS.filter(
    (arm) =>
      (armsAt(digits, row, column) & arm.bit) !== 0 &&
      (armsAt(digits, row + arm.row, column + arm.column) & arm.back) !== 0,
  ).map((arm) => ({ column: column + arm.column, row: row + arm.row }));
}

/**
 * What is wrong with a glyph as ink: an arm with no inked neighbor carrying it back, or ink split into several pieces.
 */
function malformations(glyph: string): string[] {
  const digits = glyphDigits(glyph);
  const inked = digits.flatMap((cells, row) =>
    cells.flatMap((digit, column) => (digit < 0 ? [] : [{ column, row }])),
  );
  const unanswered = inked.flatMap(({ column, row }) => {
    const arms = ARMS.filter(
      ({ bit }) => (armsAt(digits, row, column) & bit) !== 0,
    ).length;
    return joinedNeighbors(digits, row, column).length === arms
      ? []
      : [`arm not carried back at row ${row}, column ${column}`];
  });
  const reached = new Set<string>();
  const frontier = inked.slice(0, 1);
  for (let next = frontier.pop(); next !== undefined; next = frontier.pop()) {
    const cell = `${next.row},${next.column}`;
    if (!reached.has(cell)) {
      reached.add(cell);
      frontier.push(...joinedNeighbors(digits, next.row, next.column));
    }
  }

  return reached.size === inked.length
    ? unanswered
    : [...unanswered, "ink in more than one piece"];
}

describe(LetterCharacteristicsModule, () => {
  let groups: readonly CharacteristicEvaluatorGroup<number>[];
  let utilities: LetterUtilitiesService;

  /** A letter's base evaluators, one per positional form: each form's unturned orientation at its script's base corner. */
  function bases(
    evaluators: readonly CharacteristicEvaluator<number>[],
  ): readonly CharacteristicEvaluator<number>[] {
    return evaluators.filter(({ metadata }) => {
      const script = SCRIPT.exec(metadata.key)?.[1];

      return (
        isLetterScript(script) &&
        metadata.key.endsWith(`${utilities.baseCorner(script)}${script}Count`)
      );
    });
  }

  beforeAll(async () => {
    const { module } = await buildTestingModule(SubmatrixUtilitiesService, {
      imports: [LetterCharacteristicsModule],
      providers: [
        {
          inject: [...LETTERS],
          provide: GROUPS,
          useFactory: (
            ...injected: CharacteristicEvaluatorGroup<number>[]
          ): CharacteristicEvaluatorGroup<number>[] => injected,
        },
      ],
    });

    groups = module.get<CharacteristicEvaluatorGroup<number>[]>(GROUPS);
    utilities = module.get(LetterUtilitiesService);
  });

  it.each(
    LETTERS.map((service, index) => ({ index, name: service.name, service })),
  )(
    "exports $name to a consumer, with sixteen orientation evaluators per form",
    ({ index, service }) => {
      expect(groups[index]).toBeInstanceOf(service);

      const keys = (groups[index]?.evaluators ?? []).map(
        ({ metadata }) => metadata.key,
      );
      const forms = new Set(keys.map((key) => key.replace(ORIENTATION, "")));

      expect(keys).toHaveLength(LETTER_ORIENTATION_NAMES.length * forms.size);
    },
  );

  it("reads a template padded with blank rows and columns as the glyph it pads", () => {
    const submatrix = new SubmatrixUtilitiesService();

    expect(
      trimmedGlyph(submatrix.glyphFormula(["....", ".25.", ".29.", "...."])),
    ).toBe(trimmedGlyph(submatrix.glyphFormula(["25", "29"])));
  });

  it("finds a base orientation for every letter", () => {
    expect(
      groups.map(({ evaluators }) => bases(evaluators).length > 0),
    ).toStrictEqual(groups.map(() => true));
  });

  it("gives every letter and form its own base shape, so no two share an upright glyph", () => {
    const shapes = groups.flatMap(({ evaluators }) =>
      bases(evaluators).map(({ metadata }) =>
        trimmedGlyph(metadata.formula ?? ""),
      ),
    );

    expect(new Set(shapes).size).toBe(shapes.length);
  });

  it("draws every letter's base as one piece of ink whose every arm meets a neighbor's arm", () => {
    const malformed = groups.flatMap(({ evaluators }) =>
      bases(evaluators).flatMap(({ metadata }) => {
        const problems = malformations(trimmedGlyph(metadata.formula ?? ""));
        return problems.length === 0 ? [] : [{ key: metadata.key, problems }];
      }),
    );

    expect(malformed).toStrictEqual([]);
  });
});

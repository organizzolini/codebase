// 🏷️ Types

import type { CodeObject } from "../code/code.types";
import type { Matrix } from "../matrix/matrix.types";
import type {
  BOOLEAN_CHARACTERISTIC_KEYS,
  CHARACTERISTIC_KEYS,
  LETTER_CHARACTERISTIC_KEYS,
  NUMERIC_CHARACTERISTIC_KEYS,
  PATTERN_CHARACTERISTIC_KEYS,
  STORED_BOOLEAN_KEYS,
} from "./characteristics.constants";

/** The key of a boolean characteristic, see {@link BOOLEAN_CHARACTERISTIC_KEYS}. */
export type BooleanCharacteristicKey =
  (typeof BOOLEAN_CHARACTERISTIC_KEYS)[number];

/** A discovered evaluator, with `compute` and `metadata` naming its key. */
export interface CandidateEvaluator {
  compute(context: CharacteristicContext): unknown;
  readonly metadata: {
    readonly key: string;
    readonly valueType: unknown;
  };
}

/** Where a characteristic is measured: `submatrix`, `path`, or `compound`. */
export type CharacteristicCategory = "compound" | "path" | "submatrix";

/** Shared per-meander input every evaluator reads, prepared once. */
export interface CharacteristicContext {
  readonly code: CodeObject;
  readonly columns: number;
  readonly matrix: Matrix;
  readonly rows: number;
}

/** A characteristic's metadata, plus a pure computation of its value. */
export interface CharacteristicEvaluator<
  T extends CharacteristicValue = CharacteristicValue,
> {
  compute(context: CharacteristicContext): T;
  readonly metadata: CharacteristicMetadata<T>;
}

/** A provider of several evaluators, like one letter's orientations. */
export interface CharacteristicEvaluatorGroup<
  T extends CharacteristicValue = CharacteristicValue,
> {
  readonly evaluators: readonly CharacteristicEvaluator<T>[];
}

/** The key of any registered characteristic: see {@link CHARACTERISTIC_KEYS}. */
export type CharacteristicKey = (typeof CHARACTERISTIC_KEYS)[number];

/** Keys a characteristic yielding `T` may carry, derived from `T`. */
export type CharacteristicKeyOf<T extends CharacteristicValue> =
  T extends boolean ? BooleanCharacteristicKey : NumericCharacteristicKey;

/** A characteristic's catalog entry. Only `submatrix` entries declare a window. */
export type CharacteristicMetadata<
  T extends CharacteristicValue = CharacteristicValue,
> =
  | (CharacteristicMetadataFields<T> & {
      readonly category: "submatrix";
      readonly submatrix: SubmatrixWindow;
    })
  | (CharacteristicMetadataFields<T> & {
      readonly category: Exclude<CharacteristicCategory, "submatrix">;
      readonly submatrix?: never;
    });

/** The {@link CharacteristicMetadata} fields every category shares. */
export interface CharacteristicMetadataFields<
  T extends CharacteristicValue = CharacteristicValue,
> {
  readonly description: string;
  readonly documentationUrl?: string;
  readonly formula?: string;
  readonly key: CharacteristicKeyOf<T>;
  readonly name: string;
  readonly valueType: CharacteristicValueType<T>;
}

/** A meander's numeric and boolean values, one per key. */
export type Characteristics = NumericCharacteristicRecord &
  Readonly<Record<BooleanCharacteristicKey, boolean>>;

/** Every value a characteristic may yield. */
export type CharacteristicValue = boolean | number;

/** A value's runtime type name, derived so metadata cannot drift. */
export type CharacteristicValueType<T extends CharacteristicValue> =
  T extends boolean ? "boolean" : "number";

/** The key of a letter glyph count: see {@link LETTER_CHARACTERISTIC_KEYS}. */
export type LetterCharacteristicKey =
  (typeof LETTER_CHARACTERISTIC_KEYS)[number];

/** The key of a numeric characteristic, see {@link NUMERIC_CHARACTERISTIC_KEYS}. */
export type NumericCharacteristicKey =
  (typeof NUMERIC_CHARACTERISTIC_KEYS)[number];

/** The numeric half of a {@link Characteristics} record, letters included. */
export type NumericCharacteristicRecord = Readonly<
  Record<NumericCharacteristicKey, number>
>;

/** The key of a pattern characteristic: see {@link PATTERN_CHARACTERISTIC_KEYS}. */
export type PatternCharacteristicKey =
  (typeof PATTERN_CHARACTERISTIC_KEYS)[number];

/** A boolean key a stored row may hold `true` under. */
export type StoredBooleanKey = (typeof STORED_BOOLEAN_KEYS)[number];

/** A meander's stored characteristics, by key. */
export type StoredCharacteristics = Readonly<
  Partial<Record<NumericCharacteristicKey, number>> &
    Partial<Record<StoredBooleanKey, true>>
>;

/** The lattice-point window a `submatrix` characteristic reads, sized to its glyph. */
export interface SubmatrixWindow {
  readonly columns: number;
  readonly rows: number;
  readonly variable?: true;
}

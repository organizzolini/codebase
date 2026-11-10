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

/** The key of a characteristic whose value is a boolean: see {@link BOOLEAN_CHARACTERISTIC_KEYS}. */
export type BooleanCharacteristicKey =
  (typeof BOOLEAN_CHARACTERISTIC_KEYS)[number];

/**
 * A discovered provider shaped like an evaluator: a `compute` method and `metadata` naming its key and value type.
 */
export interface CandidateEvaluator {
  compute(context: CharacteristicContext): unknown;
  readonly metadata: {
    readonly key: string;
    readonly valueType: unknown;
  };
}

/**
 * The tier a characteristic is measured in: `submatrix` reads a grid window,
 * `path` walks the ink as a graph, `compound` combines other values.
 */
export type CharacteristicCategory = "compound" | "path" | "submatrix";

/**
 * Everything an evaluator may read about one meander, prepared once and shared, so no
 * evaluator depends on another having run first.
 */
export interface CharacteristicContext {
  readonly code: CodeObject;
  readonly columns: number;
  readonly matrix: Matrix;
  readonly rows: number;
}

/**
 * One characteristic as a self-describing service: its metadata and the pure computation of its value from a context.
 */
export interface CharacteristicEvaluator<
  T extends CharacteristicValue = CharacteristicValue,
> {
  compute(context: CharacteristicContext): T;
  readonly metadata: CharacteristicMetadata<T>;
}

/**
 * A provider holding several evaluators rather than being one, such as a letter service whose sixteen orientations are each an evaluator.
 */
export interface CharacteristicEvaluatorGroup<
  T extends CharacteristicValue = CharacteristicValue,
> {
  readonly evaluators: readonly CharacteristicEvaluator<T>[];
}

/** The key of any registered characteristic: see {@link CHARACTERISTIC_KEYS}. */
export type CharacteristicKey = (typeof CHARACTERISTIC_KEYS)[number];

/** The key a characteristic yielding `T` may carry, derived from the value type so a numeric evaluator cannot claim a boolean key. */
export type CharacteristicKeyOf<T extends CharacteristicValue> =
  T extends boolean ? BooleanCharacteristicKey : NumericCharacteristicKey;

/**
 * A characteristic's catalog entry: key, name, description, tier, and value type.
 * A `submatrix` one declares its window; `path` and `compound` ones must not.
 */
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

/**
 * Every Characteristic of one meander as one record: a number under each
 * numeric key, a boolean under each boolean key.
 */
export type Characteristics = NumericCharacteristicRecord &
  Readonly<Record<BooleanCharacteristicKey, boolean>>;

/** Every value a characteristic may yield. */
export type CharacteristicValue = boolean | number;

/** The name of a characteristic value's runtime type, derived from the value type itself so metadata cannot disagree with `compute`. */
export type CharacteristicValueType<T extends CharacteristicValue> =
  T extends boolean ? "boolean" : "number";

/** The key of a letter glyph count: see {@link LETTER_CHARACTERISTIC_KEYS}. */
export type LetterCharacteristicKey =
  (typeof LETTER_CHARACTERISTIC_KEYS)[number];

/** The key of a characteristic whose value is a number: see {@link NUMERIC_CHARACTERISTIC_KEYS}. */
export type NumericCharacteristicKey =
  (typeof NUMERIC_CHARACTERISTIC_KEYS)[number];

/**
 * The numeric half of a {@link Characteristics} record: a number under each
 * numeric key, letters included.
 */
export type NumericCharacteristicRecord = Readonly<
  Record<NumericCharacteristicKey, number>
>;

/** The key of a pattern characteristic: see {@link PATTERN_CHARACTERISTIC_KEYS}. */
export type PatternCharacteristicKey =
  (typeof PATTERN_CHARACTERISTIC_KEYS)[number];

/** A key a stored row's `characteristics` map may hold `true` under: see {@link STORED_BOOLEAN_KEYS}. */
export type StoredBooleanKey = (typeof STORED_BOOLEAN_KEYS)[number];

/**
 * A meander row's `characteristics` map. A missing key means zero or `false`,
 * so raw SQL reads one as `COALESCE((characteristics ->> 'key')::numeric, 0)`.
 */
export type StoredCharacteristics = Readonly<
  Partial<Record<NumericCharacteristicKey, number>> &
    Partial<Record<StoredBooleanKey, true>>
>;

/**
 * The lattice-point window a `submatrix` characteristic reads: a glyph's template size, 1×1 for a point scan, or the smallest match for a `variable` scan.
 */
export interface SubmatrixWindow {
  readonly columns: number;
  readonly rows: number;
  readonly variable?: true;
}

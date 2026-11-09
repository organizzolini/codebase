import { Inject, Injectable } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";

import { CodeService } from "../code/code.service";

import { CharacteristicContextService } from "./characteristic-context.service";
import {
  BOOLEAN_CHARACTERISTIC_KEY_SET,
  BOOLEAN_CHARACTERISTIC_KEYS,
  CHARACTERISTIC_KEY_SET,
  CHARACTERISTIC_KEYS,
  CharacteristicRegistryError,
  NUMERIC_CHARACTERISTIC_KEYS,
} from "./characteristics.constants";
import { TileCrossingComponentDeltaCountCharacteristicService } from "./path/tile-crossing/tile-crossing-component-delta-count-characteristic.service";

import type { Code, CodeObject } from "../code/code.types";
import type {
  BooleanCharacteristicKey,
  CandidateEvaluator,
  CharacteristicContext,
  CharacteristicEvaluator,
  CharacteristicKey,
  CharacteristicMetadata,
  Characteristics,
  CharacteristicValue,
  CharacteristicValueType,
  NumericCharacteristicRecord,
  StoredCharacteristics,
} from "./characteristics.types";
import type { OnApplicationBootstrap } from "@nestjs/common";

/**
 * Orchestrates every registered characteristic evaluator. Discovers them through Nest's
 * `DiscoveryService`, checks them against the key lists in `characteristics.constants`
 * at boot, and fills one {@link Characteristics} record per Code from a shared context.
 *
 * It also reduces a record to the sparse map a meander row stores, and answers two
 * questions about a Code as filed, not its repeating unit.
 */
@Injectable()
export class CharacteristicsService implements OnApplicationBootstrap {
  // 🏗 Dependency Injection

  constructor(
    @Inject(CodeService)
    private readonly codeService: CodeService,
    @Inject(CharacteristicContextService)
    private readonly contextService: CharacteristicContextService,
    @Inject(DiscoveryService)
    private readonly discoveryService: DiscoveryService,
    @Inject(TileCrossingComponentDeltaCountCharacteristicService)
    private readonly tileCrossingComponentDeltaCountService: TileCrossingComponentDeltaCountCharacteristicService,
  ) {}

  // 🔐 Private Fields

  /**
   * Every evaluator in key-list order, discovered and checked once. Boot reaches this
   * through {@link onApplicationBootstrap}; the `??=` only serves an uninitialized test module.
   */
  private registered: readonly CharacteristicEvaluator[] | undefined;

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Throws unless every key holds a value of the type its key list promises, naming the first that does not. */
  private assertCharacteristics(
    values: Readonly<Record<string, CharacteristicValue>>,
  ): asserts values is Characteristics {
    const mismatch = CHARACTERISTIC_KEYS.find(
      (key) => typeof values[key] !== this.valueTypeOf(key),
    );

    if (mismatch !== undefined) {
      throw new CharacteristicRegistryError(
        `Characteristic "${mismatch}" computed ${typeof values[mismatch]}, but its key promises ${this.valueTypeOf(mismatch)}`,
      );
    }
  }

  /**
   * The evaluator candidates a discovered provider holds: itself when evaluator-shaped,
   * or each evaluator-shaped member of a group such as a letter service.
   */
  private candidates(instance: unknown): readonly CandidateEvaluator[] {
    if (this.isCandidateEvaluator(instance)) return [instance];
    if (!this.isCandidateGroup(instance)) return [];

    return instance.evaluators.filter((member) =>
      this.isCandidateEvaluator(member),
    );
  }

  /** Every discovered evaluator, lone or grouped, checked against the key lists and ordered by them. */
  private discover(): readonly CharacteristicEvaluator[] {
    const providers: readonly { readonly instance: unknown }[] =
      this.discoveryService.getProviders();
    const byKey = new Map<string, CharacteristicEvaluator>();

    for (const candidate of providers.flatMap(({ instance }) =>
      this.candidates(instance),
    )) {
      const evaluator = this.verify(candidate);
      if (byKey.has(evaluator.metadata.key)) {
        throw new CharacteristicRegistryError(
          `Two evaluators claim characteristic "${evaluator.metadata.key}"`,
        );
      }
      byKey.set(evaluator.metadata.key, evaluator);
    }

    return CHARACTERISTIC_KEYS.map((key) => {
      const evaluator = byKey.get(key);
      if (evaluator === undefined) {
        throw new CharacteristicRegistryError(
          `No evaluator is registered for characteristic "${key}"`,
        );
      }
      return evaluator;
    });
  }

  /** One evaluator's value for a context, keyed by its characteristic. */
  private entry(
    evaluator: CharacteristicEvaluator,
    context: CharacteristicContext,
  ): [string, CharacteristicValue] {
    return [evaluator.metadata.key, evaluator.compute(context)];
  }

  /** Every evaluator in key-list order, discovering them the first time only. */
  private evaluators(): readonly CharacteristicEvaluator[] {
    this.registered ??= this.discover();

    return this.registered;
  }

  /** Whether a discovered provider has an evaluator's shape: a `compute` method and metadata naming a string key. */
  private isCandidateEvaluator(value: unknown): value is CandidateEvaluator {
    return (
      typeof value === "object" &&
      value !== null &&
      "compute" in value &&
      typeof value.compute === "function" &&
      "metadata" in value &&
      typeof value.metadata === "object" &&
      value.metadata !== null &&
      "key" in value.metadata &&
      typeof value.metadata.key === "string"
    );
  }

  /** Whether a discovered provider is shaped like a `CharacteristicEvaluatorGroup`: an `evaluators` array, its members not yet checked. */
  private isCandidateGroup(
    value: unknown,
  ): value is { readonly evaluators: readonly unknown[] } {
    return (
      typeof value === "object" &&
      value !== null &&
      "evaluators" in value &&
      Array.isArray(value.evaluators)
    );
  }

  /** Whether a candidate's key is in the key list and its declared value type is the one that list promises. */
  private isCharacteristicEvaluator(
    candidate: CandidateEvaluator,
  ): candidate is CharacteristicEvaluator {
    const { key, valueType } = candidate.metadata;

    return this.isCharacteristicKey(key) && valueType === this.valueTypeOf(key);
  }

  /** Whether a string names a registered characteristic. */
  private isCharacteristicKey(key: string): key is CharacteristicKey {
    return CHARACTERISTIC_KEY_SET.has(key);
  }

  /** The value type a key's list promises. */
  private valueTypeOf(
    key: string,
  ): CharacteristicValueType<CharacteristicValue> {
    return BOOLEAN_CHARACTERISTIC_KEY_SET.has(key) ? "boolean" : "number";
  }

  /** The candidate as an evaluator, or a thrown error saying whether its key is unknown or its value type wrong. */
  private verify(candidate: CandidateEvaluator): CharacteristicEvaluator {
    if (this.isCharacteristicEvaluator(candidate)) return candidate;

    const { key, valueType } = candidate.metadata;
    if (!this.isCharacteristicKey(key)) {
      throw new CharacteristicRegistryError(
        `An evaluator claims characteristic "${key}", which is not in the key list`,
      );
    }

    throw new CharacteristicRegistryError(
      `Characteristic "${key}" declares value type ${String(valueType)}, but its key promises ${this.valueTypeOf(key)}`,
    );
  }

  // 🌎 Public Methods

  /** Every characteristic of a Code's repeating unit, computed by every evaluator from one shared context. */
  public compute(code: Code | CodeObject): Characteristics {
    const context = this.contextService.create(code);
    const values = Object.fromEntries(
      this.evaluators().map((evaluator) => this.entry(evaluator, context)),
    );

    this.assertCharacteristics(values);

    return values;
  }

  /** Whether the Code as filed is wider than its repeating unit: a property of the filing, not a record field. */
  public isReducible(code: Code | CodeObject): boolean {
    const parsed =
      typeof code === "string" ? this.codeService.parse(code) : code;

    return parsed.columns > this.codeService.reduceToUnit(parsed).columns;
  }

  /** Every registered characteristic's metadata, in key-list order. */
  public metadata(): readonly CharacteristicMetadata[] {
    return this.evaluators().map((evaluator) => evaluator.metadata);
  }

  /**
   * Discovers and checks every evaluator at boot, so a missing, unknown, doubly claimed or mistyped key stops startup before any Code is measured.
   */
  public onApplicationBootstrap(): void {
    this.evaluators();
  }

  /**
   * A record as a meander row stores it: non-zero numbers, held booleans as `true`, and `isReducible` when the Code is wider than its unit.
   */
  public stored(
    characteristics: Characteristics,
    isReducible: boolean,
  ): StoredCharacteristics {
    const numbers: Partial<NumericCharacteristicRecord> = Object.fromEntries(
      NUMERIC_CHARACTERISTIC_KEYS.filter(
        (key) => characteristics[key] !== 0,
      ).map((key) => [key, characteristics[key]]),
    );
    const truths: Partial<Record<BooleanCharacteristicKey, true>> =
      Object.fromEntries(
        BOOLEAN_CHARACTERISTIC_KEYS.filter((key) => characteristics[key]).map(
          (key) => [key, true as const],
        ),
      );

    return {
      ...numbers,
      ...truths,
      ...(isReducible ? { isReducible: true } : {}),
    };
  }

  /**
   * Tile-crossing component delta of the Code as filed, not its repeating unit: the canonical-phase scorer compares cuts, so it needs their width.
   */
  public tileCrossingComponentDeltaCount(code: Code | CodeObject): number {
    return this.tileCrossingComponentDeltaCountService.compute(
      this.contextService.createUnreduced(code),
    );
  }
}

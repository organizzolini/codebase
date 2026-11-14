import { Inject, Injectable } from "@nestjs/common";

import { CodeService, MatrixService } from "@codebase/meanderaw-core";

import type { CharacteristicContext } from "./characteristics.types";
import type { Code, CodeObject } from "@codebase/meanderaw-core";

/**
 * Prepares the one {@link CharacteristicContext} every evaluator reads, so a Code is
 * parsed once per meander. The Code is reduced to its smallest repeating unit first,
 * so repeats measure the same as a single drawing.
 *
 * Its `code` is lowercase digits.
 */
@Injectable()
export class CharacteristicContextService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(CodeService)
    private readonly codeService: CodeService,
    @Inject(MatrixService)
    private readonly matrixService: MatrixService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Builds the context for exactly the Code given, with its digits re-spelled from its decoded matrix. */
  private build(code: CodeObject): CharacteristicContext {
    const matrix = this.matrixService.fromCode(code);
    const digits = this.codeService.spellDigits({
      columns: code.columns,
      points: matrix,
      rows: code.rows,
    });

    return {
      code: { ...code, digits },
      columns: code.columns,
      matrix,
      rows: code.rows,
    };
  }

  /** Parses a formatted Code string, or passes an already parsed Code through. */
  private parse(code: Code | CodeObject): CodeObject {
    return typeof code === "string" ? this.codeService.parse(code) : code;
  }

  // 🌎 Public Methods

  /**
   * Builds the context for the repeating unit of a formatted Code string or
   * an already parsed Code.
   */
  public create(code: Code | CodeObject): CharacteristicContext {
    return this.build(this.codeService.reduceToUnit(this.parse(code)));
  }

  /**
   * Builds the context for a Code as filed, not reduced to its repeating unit.
   * Used by the canonical-phase scorer.
   */
  public createUnreduced(code: Code | CodeObject): CharacteristicContext {
    return this.build(this.parse(code));
  }
}

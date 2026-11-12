import { Injectable } from "@nestjs/common";
import ts from "typescript";

import { DEPRECATED_TAG } from "./documentation.constants";

import type { ReadDocumentationArguments } from "./documentation.types";
import type { CallableDocumentation } from "@callidescope/core";

/**
 * Reads what a callable's documentation comment says about it.
 *
 * Read through the type checker, not comment trivia, since an overload's comment
 * sits on its signature and an arrow-typed member's on the property.
 */
@Injectable()
export class DocumentationService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Collapses a documentation comment onto one line, in full. Shortening is left to the consumer.
   */
  private readSummary(args: {
    checker: ts.TypeChecker;
    symbol: ts.Symbol;
  }): string {
    return ts
      .displayPartsToString(args.symbol.getDocumentationComment(args.checker))
      .replaceAll(/\s+/g, " ")
      .trim();
  }

  /** Resolves the symbol a declaration's documentation hangs off. */
  private readSymbol(args: ReadDocumentationArguments): ts.Symbol | undefined {
    const { checker, declaration } = args;

    if (declaration.name !== undefined) {
      return checker.getSymbolAtLocation(declaration.name);
    }

    // An arrow function has no name of its own; whatever binds it carries the
    // comment, and that is where the checker keeps the symbol too.
    const { parent } = declaration;

    return ts.isPropertyDeclaration(parent) ||
      ts.isPropertyAssignment(parent) ||
      ts.isVariableDeclaration(parent)
      ? checker.getSymbolAtLocation(parent.name)
      : undefined;
  }

  // 🌎 Public Methods

  /**
   * Reads the documentation comment, if any. Tags are read separately, since a
   * comment of only `@deprecated` has no summary.
   */
  public read(
    args: ReadDocumentationArguments,
  ): CallableDocumentation | undefined {
    const symbol = this.readSymbol(args);

    if (symbol === undefined) {
      return undefined;
    }

    const summary = this.readSummary({ checker: args.checker, symbol });
    const tags = symbol
      .getJsDocTags(args.checker)
      .map((tag) => tag.name)
      .filter((name) => name.length > 0);

    if (summary.length === 0 && tags.length === 0) {
      return undefined;
    }

    return {
      isDeprecated: tags.includes(DEPRECATED_TAG),
      summary,
      tags: [...new Set(tags)],
    };
  }
}

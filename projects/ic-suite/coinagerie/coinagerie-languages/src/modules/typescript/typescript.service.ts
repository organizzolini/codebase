import path from "node:path";

import { Injectable } from "@nestjs/common";
import ts from "typescript";

import {
  QUOTABLE_NAME_OWNER_KINDS,
  TYPESCRIPT_SCRIPT_KINDS,
} from "./typescript.constants";

import type { Language } from "../languages/languages.types";

/**
 * Reads the identifiers of a TypeScript or JavaScript file from its syntax
 * tree.
 *
 * A syntax tree rather than a scanner, so a comment, a string, a template
 * literal's text, or a regular expression can never leak a word: none of
 * them is an identifier node. The parser recovers from syntax errors, so a
 * half-finished edit still contributes every name it has.
 */
@Injectable()
export class TypescriptService implements Language {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** The extensions of the files this tokenizer reads. */
  readonly extensions: readonly string[] = [...TYPESCRIPT_SCRIPT_KINDS.keys()];

  // 🔏 Private Methods

  /** Whether a node is a string literal naming a key, such as `"quoted-key"`. */
  private isQuotedName(node: ts.Node): node is ts.StringLiteral {
    const { parent } = node;

    return (
      ts.isStringLiteral(node) &&
      QUOTABLE_NAME_OWNER_KINDS.has(parent.kind) &&
      "name" in parent &&
      parent.name === node
    );
  }

  /** The identifier a node spells, or `undefined` when it spells none. */
  private readIdentifier(node: ts.Node): string | undefined {
    if (
      ts.isIdentifier(node) ||
      ts.isPrivateIdentifier(node) ||
      this.isQuotedName(node)
    ) {
      return node.text;
    }

    return undefined;
  }

  // 🌎 Public Methods

  /**
   * Every identifier in a source file, in the order written, repeats kept.
   *
   * Matches the tokenizer contract `(content, path) => string[]`: the path
   * only chooses the dialect — TSX, JSX, or plain — and is never read.
   */
  tokenize(content: string, filePath: string): string[] {
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      TYPESCRIPT_SCRIPT_KINDS.get(path.extname(filePath).toLowerCase()),
    );
    const identifiers: string[] = [];

    const visit = (node: ts.Node): void => {
      const identifier = this.readIdentifier(node);

      if (identifier !== undefined && identifier.length > 0) {
        identifiers.push(identifier);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return identifiers;
  }
}

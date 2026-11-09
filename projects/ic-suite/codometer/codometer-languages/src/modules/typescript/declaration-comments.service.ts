import { Injectable } from "@nestjs/common";
import tsCompiler from "typescript";

import { CommentsService } from "../comments/comments.service";

import {
  DETACHED_COMMENT_REGEX,
  SYMBOL_KIND_BY_SYNTAX_KIND,
} from "./typescript.constants";

import type { LabeledCommentMeasurement } from "../comments/comments.types";
import type {
  PreparedDeclarationComment,
  TypescriptWalkContext,
} from "./typescript.types";

/**
 * Finds a declaration's leading JSDoc comment and hands it to be measured. TypeScript finds it; `CommentsService` counts it, so a word means one thing across the tool.
 */
@Injectable()
export class DeclarationCommentsService {
  // 🏗 Dependency Injection

  constructor(private readonly comments: CommentsService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Reads a declaration's own name, or `"(anonymous)"` when it has none. */
  private getDeclarationName(node: tsCompiler.Node): string {
    const nodeWithName = node as tsCompiler.Node & {
      declarationList?: { declarations: tsCompiler.Node[] };
      name?: { getText?: () => string };
    };
    const [firstDeclaration] = nodeWithName.declarationList?.declarations ?? [];
    const named = (firstDeclaration ?? node) as tsCompiler.Node & {
      name?: { getText?: () => string };
    };

    return named.name?.getText?.() ?? "(anonymous)";
  }

  /**
   * Finds the node's leading JSDoc range, the last if several.
   *
   * A blank line detaches it, leaving it to the file header.
   */
  private getJsDocRange(
    node: tsCompiler.Node,
    sourceFile: tsCompiler.SourceFile,
  ): tsCompiler.CommentRange | undefined {
    const isFile = node.kind === tsCompiler.SyntaxKind.SourceFile;

    return (
      tsCompiler.getLeadingCommentRanges(
        sourceFile.text,
        node.getFullStart(),
      ) ?? []
    ).findLast(
      (candidate) =>
        candidate.kind === tsCompiler.SyntaxKind.MultiLineCommentTrivia &&
        sourceFile.text.slice(candidate.pos, candidate.pos + 3) === "/**" &&
        DETACHED_COMMENT_REGEX.test(sourceFile.text.slice(candidate.end)) ===
          isFile,
    );
  }

  /**
   * Everything a measurement needs about one node, or `undefined` when there is nothing to measure. Split out to fit the statement budget.
   */
  private prepare(
    node: tsCompiler.Node,
    context: TypescriptWalkContext,
  ): PreparedDeclarationComment | undefined {
    const { commentCounters, sourceFile } = context;
    const kind = SYMBOL_KIND_BY_SYNTAX_KIND[node.kind];

    if (kind === undefined) {
      return undefined;
    }

    const counters = commentCounters.filter((counter) => counter.kind === kind);

    if (counters.length === 0) {
      return undefined;
    }

    const range = this.getJsDocRange(node, sourceFile);

    if (range === undefined) {
      return undefined;
    }

    const source = sourceFile.text
      .slice(range.pos, range.end)
      .replaceAll("\r\n", "\n");

    return {
      counters,
      declaration: this.getDeclarationName(node),
      kind,
      line:
        sourceFile.getLineAndCharacterOfPosition(
          kind === "file" ? range.pos : node.getStart(sourceFile),
        ).line + 1,
      prose: this.readProse(source),
      source,
    };
  }

  /**
   * The comment's prose, delimiters and each line's `*` stripped. A character count stays the raw slice, which matches an editor's column count.
   */
  private readProse(text: string): string {
    return text
      .replace(/^\/\*\*/u, "")
      .replace(/\*\/$/u, "")
      .split("\n")
      .map((line) => line.replace(/^\s*\*\s?/u, ""))
      .join(" ");
  }

  // 🌎 Public Methods

  /**
   * Measures one declaration's leading JSDoc against every counter naming its kind. Empty when nothing matches or no `/**` comment exists.
   */
  measure(
    node: tsCompiler.Node,
    context: TypescriptWalkContext,
  ): LabeledCommentMeasurement[] {
    const prepared = this.prepare(node, context);

    if (prepared === undefined) {
      return [];
    }

    const { counters, declaration, kind, line, prose, source } = prepared;
    const labeled: LabeledCommentMeasurement[] = [];

    // Walked rather than mapped: a `flatMap` callback here would be one more
    // frame on the deepest stack this package owns, and the JSDoc walk already
    // reaches this method through nine of them.
    for (const counter of counters) {
      const measurements = this.comments.measureText({
        comments: counter.budget,
        declaration,
        filePath: context.filePath,
        kind,
        line,
        prose,
        source,
      });

      for (const measurement of measurements) {
        labeled.push({ label: counter.label, measurement });
      }
    }

    return labeled;
  }
}

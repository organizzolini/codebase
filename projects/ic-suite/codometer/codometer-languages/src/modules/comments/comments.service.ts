import { Injectable } from "@nestjs/common";

import { COMMENT_EXCERPT_LENGTH, COMMENT_KIND } from "./comments.constants";

import type {
  CommentBlock,
  CommentBudget,
  CommentMeasurement,
  CommentToken,
  MeasureCommentsArguments,
  MeasureCommentTextArguments,
} from "./comments.types";
import type { CodometerDocumentationUnit } from "@codometer/configuration";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Measures comments against the maxima a configuration declares. Language-agnostic: it takes comments already found and says how long they are. One definition of a word, line, and character across every language.
 */
@Injectable()
/* v8 ignore stop */
export class CommentsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Every declared maximum, paired with what this comment measured.
   *
   * Written as three guarded pushes rather than a table walked by `flatMap`,
   * because the callback would be one more frame on the deepest stack this
   * package owns — the JSDoc walk reaches here through eleven of them, and
   * `callidescope.config.ts` gates that at what it measures. The words are
   * counted in place for the same reason: splitting a trimmed string on
   * whitespace runs never yields an empty token, so the empty case is the only
   * one worth guarding, and a helper would be a frame deeper.
   */
  private declaredLimits(
    args: { prose: string; source: string },
    comments: CommentBudget,
  ): { limit: number; measured: number; unit: CodometerDocumentationUnit }[] {
    const declared: {
      limit: number;
      measured: number;
      unit: CodometerDocumentationUnit;
    }[] = [];

    if (comments.maximumCharacters !== undefined) {
      declared.push({
        limit: comments.maximumCharacters,
        measured: args.source.length,
        unit: "characters",
      });
    }

    if (comments.maximumLines !== undefined) {
      declared.push({
        limit: comments.maximumLines,
        measured: args.source.split("\n").length,
        unit: "lines",
      });
    }

    if (comments.maximumWords !== undefined) {
      const trimmed = args.prose.trim();

      declared.push({
        limit: comments.maximumWords,
        measured: trimmed === "" ? 0 : trimmed.split(/\s+/u).length,
        unit: "words",
      });
    }

    return declared;
  }

  /** The prose of a run of comment lines, markers already stripped. */
  private readProse(tokens: readonly CommentToken[]): string {
    return tokens
      .map((token) => token.prose)
      .join(" ")
      .trim();
  }

  /** A run of comment lines exactly as the file carries them. */
  private readSource(tokens: readonly CommentToken[]): string {
    return tokens.map((token) => token.source).join("\n");
  }

  /** Shortens a block's prose to something a breach line can carry. */
  private toExcerpt(prose: string): string {
    return prose.length > COMMENT_EXCERPT_LENGTH
      ? `${prose.slice(0, COMMENT_EXCERPT_LENGTH)}…`
      : prose;
  }

  // 🌎 Public Methods

  /**
   * Groups a file's comment lines into the blocks a reader perceives. Trailing comments and blank-line-separated ones never join.
   */
  groupIntoBlocks(tokens: readonly CommentToken[]): CommentBlock[] {
    const blocks: CommentBlock[] = [];

    for (const token of tokens) {
      const previous = blocks.at(-1);
      const last = previous?.tokens.at(-1);

      if (
        previous !== undefined &&
        last !== undefined &&
        token.ownLine &&
        last.ownLine &&
        token.line === last.line + 1
      ) {
        previous.tokens.push(token);
        continue;
      }

      blocks.push({ tokens: [token] });
    }

    return blocks;
  }

  /**
   * Measures every block in a file, breached or not, so lengths show before they become problems. One result per maximum.
   */
  measure(args: MeasureCommentsArguments): CommentMeasurement[] {
    return this.groupIntoBlocks(args.tokens).flatMap((block) => {
      const prose = this.readProse(block.tokens);

      return this.measureText({
        comments: args.comments,
        declaration: this.toExcerpt(prose),
        filePath: args.filePath,
        kind: COMMENT_KIND,
        line: block.tokens[0]?.line ?? 1,
        prose,
        source: this.readSource(block.tokens),
      });
    });
  }

  /**
   * Measures one comment's text against every declared maximum. A JSDoc block enters here, already found by the TypeScript walk.
   */
  measureText(args: MeasureCommentTextArguments): CommentMeasurement[] {
    return this.declaredLimits(args, args.comments).map(
      ({ limit, measured, unit }) => ({
        breached: measured > limit,
        declaration: args.declaration,
        file: args.filePath,
        kind: args.kind,
        limit,
        line: args.line,
        measured,
        severity: args.comments.severity,
        unit,
      }),
    );
  }
}

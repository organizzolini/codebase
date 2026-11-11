import { Injectable } from "@nestjs/common";
import postcss from "postcss";

import type { CommentToken } from "./comments.types";
import type { Comment } from "postcss";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Reads CSS's `/* ... *\/` comments from postcss's own parse.
 *
 * CSS has one comment syntax, and postcss already parses the stylesheets and gives each comment its line and column.
 */
@Injectable()
/* v8 ignore stop */
export class CssCommentsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Restores the whitespace postcss split off a comment's text. Both `raws` fields are always set after a real parse.
   */
  private toBody(comment: Comment): string {
    /* v8 ignore next -- postcss always sets both after a real parse */
    const left = comment.raws.left ?? "";
    /* v8 ignore next -- postcss always sets both after a real parse */
    const right = comment.raws.right ?? "";

    return `${left}${comment.text}${right}`;
  }

  /**
   * Whether only whitespace precedes a comment's marker on its line. Every measured comment came from a parse, so its position is set.
   */
  private toOwnLine(content: string, comment: Comment): boolean {
    /* v8 ignore next -- unreachable: this reader only sees parsed comments */
    const { column, line } = comment.source?.start ?? { column: 1, line: 1 };
    /* v8 ignore next -- a comment's own line is always inside its file */
    const lineText = content.split("\n")[line - 1] ?? "";

    return lineText.slice(0, column - 1).trim() === "";
  }

  // 🌎 Public Methods

  /**
   * Reads every comment postcss finds, in document order. A stylesheet postcss cannot parse yields none.
   */
  read(content: string): CommentToken[] {
    const tokens: CommentToken[] = [];

    try {
      postcss.parse(content).walkComments((comment) => {
        const body = this.toBody(comment);

        tokens.push({
          /* v8 ignore next -- unreachable: this reader only sees parsed comments */
          line: comment.source?.start?.line ?? 1,
          ownLine: this.toOwnLine(content, comment),
          prose: body,
          source: `/*${body}*/`,
        });
      });
    } catch {
      return [];
    }

    return tokens;
  }
}

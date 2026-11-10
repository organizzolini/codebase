// cspell:ignore col — the `yaml` package's own name for a column on the
// `LineCounter.linePos` result; renamed to `column` at the destructuring.
import { Injectable } from "@nestjs/common";
import { LineCounter, Parser } from "yaml";

import { HASH_COMMENT_MARKER_PATTERN } from "./comments.constants";

import type {
  CommentToken,
  PositionedToken,
  YamlCommentScan,
} from "./comments.types";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Reads YAML comments from the tokenizer, not the text. The tokenizer knows a `#` inside a quoted scalar is not a comment, which a line scanner would get wrong. The CST also carries offsets, so a breach names its line.
 */
@Injectable()
/* v8 ignore stop */
export class YamlCommentsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Walks one parsed token, recording every comment beneath it. */
  private collectComments(candidate: unknown, scan: YamlCommentScan): void {
    if (candidate === null || typeof candidate !== "object") {
      return;
    }

    if (Array.isArray(candidate)) {
      // `Array.isArray` narrows an `unknown` to `any[]`, so the element type
      // is named here rather than inherited.
      for (const item of candidate as unknown[]) {
        this.collectComments(item, scan);
      }

      return;
    }

    const record: Record<string, unknown> = { ...candidate };

    if (this.isCommentToken(record)) {
      scan.tokens.push(this.toToken(scan, record.offset, record.source));
    }

    for (const value of Object.values(record)) {
      this.collectComments(value, scan);
    }
  }

  /** Whether a parsed token is a comment carrying an offset. */
  private isCommentToken(
    candidate: Record<string, unknown>,
  ): candidate is { offset: number; source: string; type: "comment" } {
    return (
      candidate["type"] === "comment" &&
      typeof candidate["offset"] === "number" &&
      typeof candidate["source"] === "string"
    );
  }

  /** Turns one tokenizer offset into a positioned, placed comment line. */
  private toToken(
    scan: YamlCommentScan,
    offset: number,
    source: string,
  ): PositionedToken {
    const { col: column, line } = scan.lineCounter.linePos(offset);

    return {
      offset,
      token: {
        line,
        ownLine:
          scan.content.slice(offset - (column - 1), offset).trim() === "",
        prose: source.replace(HASH_COMMENT_MARKER_PATTERN, ""),
        source,
      },
    };
  }

  // 🌎 Public Methods

  /** Reads every comment the tokenizer found, in the order they appear. */
  read(content: string): CommentToken[] {
    const scan: YamlCommentScan = {
      content,
      lineCounter: new LineCounter(),
      tokens: [],
    };

    for (const token of new Parser(scan.lineCounter.addNewLine).parse(
      content,
    )) {
      this.collectComments(token, scan);
    }

    return scan.tokens
      .toSorted((first, second) => first.offset - second.offset)
      .map((positioned) => positioned.token);
  }
}

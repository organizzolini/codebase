import { Injectable } from "@nestjs/common";

import { HASH_COMMENT_MARKER_PATTERN } from "./comments.constants";

import type { CommentToken } from "./comments.types";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Reads comments in languages whose comments start with `#`: shell, TOML, and Python. A line scanner, not a tokenizer, so a `#` in a string is read as a comment, as those analyzers already read it. YAML uses its own tokenizer.
 */
@Injectable()
/* v8 ignore stop */
export class HashCommentsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Whether this is the interpreter line. `#!` on the first line is a kernel instruction, not prose, so it is never a comment.
   */
  private isShebang(index: number, marker: number, line: string): boolean {
    return index === 0 && marker === 0 && line.startsWith("#!");
  }

  // 🌎 Public Methods

  /** Reads every `#` comment in a file, with its line and its placement. */
  read(content: string): CommentToken[] {
    const tokens: CommentToken[] = [];

    for (const [index, line] of content.split("\n").entries()) {
      const marker = line.indexOf("#");

      if (marker !== -1 && !this.isShebang(index, marker, line)) {
        const source = line.slice(marker);

        tokens.push({
          line: index + 1,
          ownLine: line.slice(0, marker).trim() === "",
          prose: source.replace(HASH_COMMENT_MARKER_PATTERN, ""),
          source,
        });
      }
    }

    return tokens;
  }
}

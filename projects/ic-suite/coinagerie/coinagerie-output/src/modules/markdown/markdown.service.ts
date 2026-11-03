import {
  COINAGERIE_END_ANCHOR,
  COINAGERIE_HEADING,
  COINAGERIE_START_ANCHOR,
  MalformedGlossaryError,
} from "@coinagerie/core";
import { Injectable } from "@nestjs/common";

import {
  BULLET_PATTERN,
  CONTINUATION_PATTERN,
  LINE_BREAK_PATTERN,
  LIST_ITEM_PATTERN,
} from "./markdown.constants";

import type {
  GlossaryFormatHandler,
  WriteGlossaryArguments,
} from "../delivery/delivery.types";
import type {
  AnchorRange,
  BlockParserState,
  RenderMarkdownArguments,
} from "./markdown.types";
import type { Glossary } from "@coinagerie/core";

/**
 * Renders, parses, and splices the markdown glossary block.
 *
 * The block is the `## 🪙 Coinagerie` heading, an optional description, and
 * one `- **word**: definition` bullet per word, between the
 * `coinagerie:start` and `coinagerie:end` anchors. A definition continues on
 * indented lines below its bullet, kept verbatim. Parsing is strict on
 * purpose: anything it cannot read is refused rather than dropped, because a
 * dropped word reads as stale and writing would delete its definition.
 */
@Injectable()
export class MarkdownService implements GlossaryFormatHandler {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Fails a parse, naming the file and the one-indexed line. */
  private fail(
    state: Pick<BlockParserState, "filePath">,
    line: number,
    reason: string,
  ): never {
    throw new MalformedGlossaryError({ line, path: state.filePath, reason });
  }

  /**
   * Where the block sits, or `undefined` when the file has no anchors.
   *
   * Exactly one start anchor followed by exactly one end anchor; any other
   * arrangement is refused.
   */
  private findAnchors(
    lines: string[],
    filePath: string,
  ): AnchorRange | undefined {
    const indexesOf = (anchor: string): number[] =>
      lines.flatMap((line, index) => (line.trim() === anchor ? [index] : []));
    const [start, secondStart] = indexesOf(COINAGERIE_START_ANCHOR);
    const [end, secondEnd] = indexesOf(COINAGERIE_END_ANCHOR);
    const state = { filePath };

    if (secondStart !== undefined) {
      this.fail(state, secondStart + 1, "a second start anchor");
    }

    if (secondEnd !== undefined) {
      this.fail(state, secondEnd + 1, "a second end anchor");
    }

    if (start !== undefined && end !== undefined) {
      if (end < start) {
        this.fail(state, end + 1, "an end anchor before the start anchor");
      }

      return { end, start };
    }

    const lone = start ?? end;

    if (lone !== undefined) {
      this.fail(state, lone + 1, "an anchor without its partner");
    }

    return undefined;
  }

  /** Stores the word being read, with its definition, and forgets it. */
  private flush(state: BlockParserState): void {
    if (state.current !== undefined) {
      state.glossary.set(state.current.word, state.current.lines.join("\n"));
    }

    state.current = undefined;
    state.pendingBlankLines = 0;
  }

  /** Reads one bullet, starting a new word. */
  private readBullet(
    state: BlockParserState,
    bullet: { rest: string; word: string },
    line: number,
  ): void {
    if (bullet.rest !== "" && !bullet.rest.startsWith(" ")) {
      this.fail(
        state,
        line,
        "a definition must follow its colon after a space",
      );
    }

    this.flush(state);

    if (state.glossary.has(bullet.word)) {
      this.fail(state, line, `the word "${bullet.word}" is listed twice`);
    }

    state.current = { lines: [bullet.rest.slice(1)], word: bullet.word };
  }

  /**
   * Adds an indented line, and any blank lines above it, to the definition
   * being read; anything else in the bullet list is refused.
   */
  private readContinuation(
    state: BlockParserState,
    text: string,
    line: number,
  ): void {
    if (state.current === undefined || !CONTINUATION_PATTERN.test(text)) {
      this.fail(state, line, "not a word bullet or an indented continuation");
    }

    state.current.lines.push(
      ...Array.from({ length: state.pendingBlankLines }, () => ""),
      text,
    );
    state.pendingBlankLines = 0;
  }

  /**
   * The prose between a block's heading and its first bullet, or `undefined`
   * when there is none. Only ever read from content `parse` already accepted.
   */
  private readDescription(content: string | undefined): string | undefined {
    const lines = content?.split(LINE_BREAK_PATTERN) ?? [];
    const range = this.findAnchors(lines, "");
    const block =
      range === undefined ? [] : lines.slice(range.start + 1, range.end);
    const firstBullet = block.findIndex((line) => LIST_ITEM_PATTERN.test(line));
    const description = (
      firstBullet === -1 ? block : block.slice(0, firstBullet)
    )
      .filter((line) => line.trim() !== COINAGERIE_HEADING)
      .join("\n")
      .trim();

    return description === "" ? undefined : description;
  }

  /** Reads one line of the block, or refuses it. */
  private readLine(state: BlockParserState, text: string, line: number): void {
    if (!state.readingBullets && !LIST_ITEM_PATTERN.test(text)) {
      return;
    }

    state.readingBullets = true;
    const bullet = BULLET_PATTERN.exec(text)?.groups;

    if (bullet?.["word"] !== undefined && bullet["rest"] !== undefined) {
      this.readBullet(
        state,
        { rest: bullet["rest"], word: bullet["word"] },
        line,
      );
    } else if (text.trim() === "") {
      state.pendingBlankLines += 1;
    } else {
      this.readContinuation(state, text, line);
    }
  }

  /** One word's bullet, with its definition after the colon. */
  private renderBullet(word: string, definition: string): string {
    if (definition === "" || definition.startsWith("\n")) {
      return `- **${word}**:${definition}`;
    }

    return `- **${word}**: ${definition}`;
  }

  // 🌎 Public Methods

  /**
   * The glossary in a file's block, or `undefined` when it has no anchors.
   *
   * Throws `MalformedGlossaryError` on an unrecognized line, a duplicated
   * word, or misplaced anchors. Free text between the heading and the first
   * bullet is the description: never a word, and kept by `write`.
   */
  parse(content: string, filePath: string): Glossary | undefined {
    const lines = content.split(LINE_BREAK_PATTERN);
    const range = this.findAnchors(lines, filePath);

    if (range === undefined) {
      return undefined;
    }

    const state: BlockParserState = {
      current: undefined,
      filePath,
      glossary: new Map(),
      pendingBlankLines: 0,
      readingBullets: false,
    };

    lines.slice(range.start + 1, range.end).forEach((text, index) => {
      this.readLine(state, text, range.start + index + 2);
    });
    this.flush(state);

    return state.glossary;
  }

  /** Reads a destination's glossary; a missing file holds none. */
  read(content: string | undefined, filePath: string): Glossary | undefined {
    return content === undefined ? undefined : this.parse(content, filePath);
  }

  /**
   * The whole block, anchors included, with no trailing newline. Words are
   * rendered sorted, whatever order the glossary holds them in.
   */
  render(args: RenderMarkdownArguments): string {
    const preamble = [COINAGERIE_START_ANCHOR, "", COINAGERIE_HEADING, ""];
    const description =
      args.description === undefined || args.description === ""
        ? []
        : [args.description, ""];
    const bullets = [...args.glossary]
      .toSorted(([left], [right]) => (left < right ? -1 : 1))
      .map(([word, definition]) => this.renderBullet(word, definition));

    return [
      ...preamble,
      ...description,
      ...bullets,
      ...(bullets.length > 0 ? [""] : []),
      COINAGERIE_END_ANCHOR,
    ].join("\n");
  }

  /**
   * A file's content with the block in place: replacing the anchored block
   * when there is one, appending it after a blank line when there is not,
   * and standing alone in a file that is empty or does not exist.
   */
  splice(content: string | undefined, block: string): string {
    if (content === undefined || content === "") {
      return `${block}\n`;
    }

    // A file keeps its own line endings: one written with CRLF stays CRLF.
    const lineBreak = content.includes("\r\n") ? "\r\n" : "\n";
    const blockLines = block.split("\n");
    const lines = content.split(LINE_BREAK_PATTERN);
    const range = this.findAnchors(lines, "");

    if (range === undefined) {
      const body = content.endsWith("\n") ? content : `${content}${lineBreak}`;

      return `${body}${lineBreak}${blockLines.join(lineBreak)}${lineBreak}`;
    }

    return [
      ...lines.slice(0, range.start),
      ...blockLines,
      ...lines.slice(range.end + 1),
    ].join(lineBreak);
  }

  /**
   * Writes a glossary into a destination's content as a rendered block.
   *
   * The configured description wins; without one, whatever prose already
   * sits between the heading and the first bullet is kept, so a write never
   * deletes text a person wrote there.
   */
  write(args: WriteGlossaryArguments): string {
    return this.splice(
      args.content,
      this.render({
        description:
          args.destination.description ?? this.readDescription(args.content),
        glossary: args.glossary,
      }),
    );
  }
}

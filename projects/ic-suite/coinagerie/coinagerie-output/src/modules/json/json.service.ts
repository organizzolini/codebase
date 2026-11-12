import { MalformedGlossaryError } from "@coinagerie/core";
import { Injectable } from "@nestjs/common";

import { STRUCTURAL_CHARACTERS } from "./json.constants";

import type {
  GlossaryFormatHandler,
  WriteGlossaryArguments,
} from "../delivery/delivery.types";
import type { JsonParseContext } from "./json.types";
import type { Glossary } from "@coinagerie/core";

/**
 * Renders and parses the JSON glossary: a flat object sorted by word, each
 * value a definition or empty.
 *
 * The whole file is the glossary, so writing replaces it. Parsing is strict:
 * anything unreadable is refused, not dropped, since a dropped word would lose
 * its definition.
 */
@Injectable()
export class JsonService implements GlossaryFormatHandler {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Where the string opening at `start` ends, past its closing quote. */
  private endOfString(content: string, start: number): number {
    let end = start + 1;

    while (end < content.length && content.charAt(end) !== '"') {
      end += content.charAt(end) === "\\" ? 2 : 1;
    }

    return end + 1;
  }

  /** Where the token starting at `start` ends. */
  private endOfToken(content: string, start: number): number {
    const character = content.charAt(start);

    if (character === '"') {
      return this.endOfString(content, start);
    }

    if (STRUCTURAL_CHARACTERS.includes(character)) {
      return start + 1;
    }

    let end = start + 1;

    while (end < content.length && !this.isBoundary(content.charAt(end))) {
      end += 1;
    }

    return end;
  }

  /** Fails a parse, naming the file and, when known, the one-indexed line. */
  private fail(
    context: Pick<JsonParseContext, "filePath">,
    reason: string,
    line?: number,
  ): never {
    throw new MalformedGlossaryError({ line, path: context.filePath, reason });
  }

  /** Whether a character ends a run of literal characters. */
  private isBoundary(character: string): boolean {
    return (
      character === '"' ||
      STRUCTURAL_CHARACTERS.includes(character) ||
      /\s/u.test(character)
    );
  }

  /** Whether a parsed value is an object, as opposed to an array or `null`. */
  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  /** The parsed value, refusing content that is not valid JSON. */
  private parseJson(context: JsonParseContext): unknown {
    try {
      return JSON.parse(context.content);
    } catch (error: unknown) {
      return this.fail(
        context,
        `the file is not valid JSON (${String(error)})`,
      );
    }
  }

  /**
   * Refuses a word listed twice, since `JSON.parse` silently keeps the last definition. Keys are the strings after `{` or a top-level comma.
   */
  private refuseDuplicates(context: JsonParseContext): void {
    const seen = new Set<string>();
    let depth = 0;
    let previous = "";

    for (const token of this.tokenize(context.content)) {
      const { text } = token;
      const isKey =
        depth === 1 &&
        text.startsWith('"') &&
        (previous === "{" || previous === ",");

      if (isKey) {
        const word = String(JSON.parse(text));

        if (seen.has(word)) {
          this.fail(
            context,
            `the word "${word}" is listed twice`,
            context.content.slice(0, token.index).split("\n").length,
          );
        }

        seen.add(word);
      }

      depth += "{[".includes(text) ? 1 : 0;
      depth -= "}]".includes(text) ? 1 : 0;
      previous = text;
    }
  }

  /**
   * Splits valid JSON into tokens: strings with quotes, brackets, commas, colons, and literals. Hand-scanned, since a string regex can backtrack.
   */
  private tokenize(content: string): { index: number; text: string }[] {
    const tokens: { index: number; text: string }[] = [];
    let index = 0;

    while (index < content.length) {
      if (/\s/u.test(content.charAt(index))) {
        index += 1;
      } else {
        const end = this.endOfToken(content, index);

        tokens.push({ index, text: content.slice(index, end) });
        index = end;
      }
    }

    return tokens;
  }

  // 🌎 Public Methods

  /**
   * The glossary a file holds. Throws `MalformedGlossaryError` on invalid JSON, a non-object, a non-string value, or a duplicate word.
   */
  parse(content: string, filePath: string): Glossary {
    const context = { content, filePath };
    const parsed = this.parseJson(context);

    if (!this.isObject(parsed)) {
      return this.fail(context, "the file must be an object of words");
    }

    this.refuseDuplicates(context);

    const glossary = new Map<string, string>();

    for (const [word, definition] of Object.entries(parsed)) {
      if (typeof definition !== "string") {
        this.fail(context, `the value of "${word}" is not a string`);
      }

      glossary.set(word, definition);
    }

    return glossary;
  }

  /**
   * Reads a destination's glossary; a missing or blank file holds none.
   */
  read(content: string | undefined, filePath: string): Glossary | undefined {
    return content === undefined || content.trim() === ""
      ? undefined
      : this.parse(content, filePath);
  }

  /**
   * The whole file: one word per line, sorted by code unit. Entries are written individually, since an object would reorder index-like keys.
   */
  render(glossary: Glossary): string {
    const entries = [...glossary]
      .toSorted(([left], [right]) => (left < right ? -1 : 1))
      .map(
        ([word, definition]) =>
          `  ${JSON.stringify(word)}: ${JSON.stringify(definition)}`,
      );

    return entries.length === 0 ? "{}\n" : `{\n${entries.join(",\n")}\n}\n`;
  }

  /** The destination's whole new content: nothing else is kept. */
  write(args: WriteGlossaryArguments): string {
    return this.render(args.glossary);
  }
}

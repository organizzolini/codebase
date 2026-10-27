import { MalformedGlossaryError } from "@coinagerie/core";
import { Injectable } from "@nestjs/common";

import { TOKEN_PATTERN } from "./json.constants";

import type {
  GlossaryFormatHandler,
  WriteGlossaryArguments,
} from "../delivery/delivery.types";
import type { JsonParseContext } from "./json.types";
import type { Glossary } from "@coinagerie/core";

/**
 * Renders and parses the JSON glossary: a flat object sorted by word, each
 * value the definition or `""` when there is none yet.
 *
 * The whole file is the glossary, so writing replaces it. Parsing is strict
 * on purpose, like the markdown format: anything it cannot read is refused
 * rather than dropped, because a dropped word reads as stale and writing
 * would delete its definition.
 */
@Injectable()
export class JsonService implements GlossaryFormatHandler {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Fails a parse, naming the file and, when known, the one-indexed line. */
  private fail(
    context: Pick<JsonParseContext, "filePath">,
    reason: string,
    line?: number,
  ): never {
    throw new MalformedGlossaryError({ line, path: context.filePath, reason });
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
   * Refuses a word listed twice, which `JSON.parse` would resolve silently
   * by keeping the last definition and dropping the first.
   *
   * Walks the tokens of content already known to be an object, reading the
   * first string after the opening brace or after a top-level comma as a key.
   */
  private refuseDuplicates(context: JsonParseContext): void {
    const seen = new Set<string>();
    let depth = 0;
    let previous = "";

    for (const token of context.content.matchAll(TOKEN_PATTERN)) {
      const text = token[0];
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

  // 🌎 Public Methods

  /**
   * The glossary a file holds.
   *
   * Throws `MalformedGlossaryError` on invalid JSON, anything but an object,
   * a value that is not a string, or a word listed twice.
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
   * The whole file: one word per line, sorted by code unit whatever order
   * the glossary holds them in, ending in a newline.
   *
   * Written out entry by entry rather than through an object, because an
   * object would reorder a key that looks like an array index.
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

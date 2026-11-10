// ♟️ Constants

import type { RenderOptions } from "mustache";

/**
 * Options for every render. Escaping is off: HTML-escaping would turn `&` into
 * `&amp;` in generated source. Per-call options leave mustache's global `escape` alone.
 */
export const MUSTACHE_RENDER_OPTIONS: RenderOptions = {
  escape: String,
};

// 🚨 Errors

/**
 * Raised when a template interpolates a placeholder nobody supplied a value for.
 *
 * Refusing is the only outcome that cannot pass for success: generation and validation would otherwise lose the same value and agree.
 */
export class MissingSubstitutionError extends Error {
  constructor(args: { placeholders: readonly string[]; subject: string }) {
    const asked = args.placeholders
      .map((placeholder) => `{{${placeholder}}}`)
      .join(", ");

    super(
      `No value was supplied for ${asked} while rendering ${args.subject}. Declare each one as an input of the generator, and in the matching instance group's substitutions.`,
    );
    this.name = "MissingSubstitutionError";
  }
}

/**
 * Matches a placeholder stand-in, to tell it from literal text. Its letter
 * prefix keeps it a legal identifier wherever it lands.
 */
export const PLACEHOLDER_VALUE_PATTERN = /conformetry[0-9a-f]{32}/g;

/** The letters every placeholder value starts with. */
export const PLACEHOLDER_VALUE_PREFIX = "conformetry";

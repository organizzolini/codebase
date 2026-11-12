// ♟️ Constants

/** Opening marker of a named anchor, unlike conformetry's markers. */
export const buildStartMarker = (anchorName: string): string =>
  `<!-- codependix:start name="${anchorName}" -->`;

/** Builds the closing marker of a named anchor block. */
export const buildEndMarker = (anchorName: string): string =>
  `<!-- codependix:end name="${anchorName}" -->`;

/** Heading for auto-created sections, matched literally to reuse hand-written ones. */
export const CODEPENDIX_SECTION_HEADING = "## 🕸️ Codependix";

// 🚨 Errors

/**
 * Raised when a named anchor block is missing from a Markdown file. Primitives throw for any
 * missing anchor; `DeliveryService` decides when to auto-create one.
 */
export class AnchorNotFoundError extends Error {
  constructor(anchorName: string, filePath: string) {
    super(`Anchor "${anchorName}" not found in ${filePath}`);
    this.name = "AnchorNotFoundError";
  }
}

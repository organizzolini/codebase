// ♟️ Constants

/**
 * Builds the opening marker of a named anchor block. Independent of
 * conformetry's marker syntax, so named anchors can share one Markdown file.
 */
export const buildStartMarker = (anchorName: string): string =>
  `<!-- codependix:start name="${anchorName}" -->`;

/** Builds the closing marker of a named anchor block. */
export const buildEndMarker = (anchorName: string): string =>
  `<!-- codependix:end name="${anchorName}" -->`;

/**
 * The heading every auto-created Codependix section is placed under. Matched
 * literally, so a hand-written copy is reused rather than duplicated.
 */
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

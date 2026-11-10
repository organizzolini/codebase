// ♟️ Constants

import { constants } from "node:zlib";

import type { BrotliOptions } from "node:zlib";

/**
 * Brotli quality size analysis compresses at.
 *
 * The maximum, stated rather than left to the library default.
 */
export const BROTLI_QUALITY = 11;

/**
 * Options every brotli compression is called with.
 *
 * `params` is zlib's own property name, not one chosen here.
 */
export const BROTLI_OPTIONS: BrotliOptions = {
  params: { [constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY },
};

/**
 * Deflate level size analysis compresses at.
 *
 * Set explicitly: Node's default produces different bytes, so an unstated level shifts every limit.
 */
export const GZIP_LEVEL = 9;

// 🚨 Errors

/**
 * Raised when a file a target matched cannot be read.
 *
 * Louder than the unreadable *directory* discovery tolerates, and deliberately
 * so: a directory nobody can read narrows what was measured, while a matched
 * file nobody can read makes the reported total wrong by definition. Size
 * analysis exists to gate, and a number quietly short by one file lets a real
 * breach pass.
 */
export class UnreadableTargetFileError extends Error {
  constructor(filePath: string, reason: string) {
    super(`Cannot measure ${filePath}: ${reason}`);
    this.name = "UnreadableTargetFileError";
  }
}

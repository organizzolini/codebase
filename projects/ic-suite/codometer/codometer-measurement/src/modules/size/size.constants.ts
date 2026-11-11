// ♟️ Constants

import { constants } from "node:zlib";

import type { BrotliOptions } from "node:zlib";

/** Brotli quality for size analysis: the maximum, stated explicitly. */
export const BROTLI_QUALITY = 11;

/** Options for every brotli call; `params` is zlib's own name. */
export const BROTLI_OPTIONS: BrotliOptions = {
  params: { [constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY },
};

/** Deflate level, set explicitly since Node's default shifts every limit. */
export const GZIP_LEVEL = 9;

// 🚨 Errors

/**
 * Raised when a file a target matched cannot be read.
 *
 * Louder than discovery's directory tolerance, on purpose: an unreadable
 * directory narrows the measurement, while an unreadable matched file makes the
 * total wrong.
 *
 * Quietly short by one file, a number would let a breach pass.
 */
export class UnreadableTargetFileError extends Error {
  constructor(filePath: string, reason: string) {
    super(`Cannot measure ${filePath}: ${reason}`);
    this.name = "UnreadableTargetFileError";
  }
}

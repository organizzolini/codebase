import { readFileSync } from "node:fs";
import path from "node:path";
import { brotliCompressSync, gzipSync } from "node:zlib";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import {
  BROTLI_OPTIONS,
  GZIP_LEVEL,
  UnreadableTargetFileError,
} from "./size.constants";

import type { AnalyzeSizeArguments, SizeResult } from "./size.types";
import type { CodometerCompression } from "@codometer/configuration";

/** Measures how many bytes a target's files occupy once compressed. */
@Injectable()
export class SizeService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(SizeService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Compresses one file's contents and returns the byte count. A lookup, not a switch, so a missing compressor fails to compile.
   */
  private compress(
    contents: Buffer,
    compression: CodometerCompression,
  ): number {
    const compressors: Record<CodometerCompression, () => number> = {
      brotli: () => brotliCompressSync(contents, BROTLI_OPTIONS).length,
      gzip: () => gzipSync(contents, { level: GZIP_LEVEL }).length,
      none: () => contents.length,
    };

    return compressors[compression]();
  }

  /**
   * Measures one file, or fails the run. Skipping a vanished file would understate the total, so failing is the lesser harm.
   */
  private measureFile(
    absolutePath: string,
    compression: CodometerCompression,
  ): number {
    try {
      return this.compress(readFileSync(absolutePath), compression);
    } catch (error: unknown) {
      this.logger.error("🗜️ Failed to measure a target file", undefined, {
        path: absolutePath,
        reason: error instanceof Error ? error.message : String(error),
      });
      throw new UnreadableTargetFileError(absolutePath, String(error));
    }
  }

  // 🌎 Public Methods

  /**
   * Measures every file of a target and sums the results. Each file is compressed alone, since shared compression would shrink later files.
   */
  analyze(args: AnalyzeSizeArguments): SizeResult {
    let bytes = 0;

    for (const filePath of args.files) {
      bytes += this.measureFile(
        path.resolve(args.workingDirectory, filePath),
        args.compression,
      );
    }

    return { bytes, compression: args.compression, files: args.files.length };
  }
}

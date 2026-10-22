import fs from "node:fs";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { failureSchema } from "./best-effort-ledger.constants";

import type { Environment } from "../../integration.types";
import type { BestEffortFailure } from "./best-effort-ledger.types";

/**
 * Remembers which best-effort steps were skipped, from the step that skips one
 * to the step that writes the pull request.
 *
 * A step is its own process, so the record lives in a file, one JSON object a
 * line, appended to and never rewritten.
 */
@Injectable()
export class BestEffortLedgerService {
  // 🏗 Dependency Injection

  constructor(private readonly configService: ConfigService<Environment>) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Where the record is kept, honouring `BEST_EFFORT_REPORT`. */
  private file(): string {
    return this.configService.getOrThrow("BEST_EFFORT_REPORT", {
      infer: true,
    });
  }

  // 🌎 Public Methods

  /** Records one skipped step. */
  public append(failure: BestEffortFailure): void {
    fs.appendFileSync(this.file(), `${JSON.stringify(failure)}\n`);
  }

  /** Lists every step skipped so far, oldest first; none when no file exists. */
  public read(): BestEffortFailure[] {
    const file = this.file();

    if (!fs.existsSync(file)) {
      return [];
    }

    return fs
      .readFileSync(file, "utf8")
      .split("\n")
      .filter((line) => line !== "")
      .map((line) => failureSchema.parse(JSON.parse(line) as unknown));
  }
}

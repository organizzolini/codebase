import fs from "node:fs";

import { Injectable } from "@nestjs/common";

import { MANIFEST_FILE, manifestSchema } from "./package-manifest.constants";

import type { ManifestField } from "./package-manifest.types";
import type { z } from "zod";

/**
 * Edits one value of the workspace root `package.json`.
 *
 * The value is replaced where it stands, so every other byte of the file, its
 * indentation and key order included, is left as it was.
 */
@Injectable()
export class PackageManifestService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The value a field holds now, and the key it is written under. */
  private current(
    manifest: z.infer<typeof manifestSchema>,
    field: ManifestField,
  ): { key: string; value: string } {
    return field === "engines.node"
      ? { key: "node", value: manifest.engines.node }
      : { key: "packageManager", value: manifest.packageManager };
  }

  // 🌎 Public Methods

  /**
   * Sets a field to a new value.
   *
   * @param field - The field to rewrite.
   * @param next - The value to write.
   * @returns The value the field held before.
   * @throws When the manifest lacks the field, or writes its current value
   *   more than once, which would leave it unclear which to replace.
   */
  public replace(field: ManifestField, next: string): string {
    const text = fs.readFileSync(MANIFEST_FILE, "utf8");
    const { key, value } = this.current(
      manifestSchema.parse(JSON.parse(text)),
      field,
    );
    const written = `"${key}": ${JSON.stringify(value)}`;
    const occurrences = text.split(written).length - 1;

    if (occurrences !== 1) {
      throw new Error(
        `${MANIFEST_FILE} writes ${written} ${String(occurrences)} times, so it is unclear which to replace`,
      );
    }

    fs.writeFileSync(
      MANIFEST_FILE,
      text.replace(written, `"${key}": ${JSON.stringify(next)}`),
    );

    return value;
  }
}

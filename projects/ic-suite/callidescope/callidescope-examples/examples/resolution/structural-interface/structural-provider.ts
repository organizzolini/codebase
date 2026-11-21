import { Injectable } from "@nestjs/common";

/**
 * A provider with arrow-typed properties, satisfied structurally and never `implements`-ed.
 */
export interface StructuralProvider {
  ingest: (document: string) => number;
}

/**
 * Satisfies `StructuralProvider` without saying so.
 *
 * There is no `implements` keyword and no method — only a readonly property
 * holding an arrow, which is the shape this repository actually writes.
 */
@Injectable()
export class FilesystemProviderService {
  // 🔑 Public Fields

  /** Counts the words one document contributes. */
  public readonly ingest = (document: string): number =>
    document.split(" ").length;
}

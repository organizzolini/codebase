// 🏷️ Types

import type { Document } from "yaml";

/** A Helm values file that names an image of this repository. */
export interface ReleaseImage {
  /** The parsed file, which keeps its comments when written back. */
  document: Document;
  /** The values file, relative to the workspace root. */
  file: string;
  /** The image's name, which is its Nx project's name. */
  project: string;
}

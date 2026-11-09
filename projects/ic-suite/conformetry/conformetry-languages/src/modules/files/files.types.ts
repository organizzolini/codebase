// 🏷️ Types

import type { MatchedInstance } from "@conformetry/configuration";
import type {
  ConformetryDifference,
  ValidationFileResult,
} from "@conformetry/core";

/** Arguments for checking matched instances against the templates they matched. */
export interface CheckInstanceFilesArguments {
  readonly instances: MatchedInstance[];
}

/**
 * What the existence pass found, and how much it asked for.
 *
 * The total counts every declared file, present ones included.
 */
export interface FilesCheckResult {
  readonly fileResults: ValidationFileResult[];
  /** One requirement per file the matched templates declare. */
  readonly totalWeight: number;
}

/**
 * A conformance error this pass always weighs.
 *
 * Narrowing the optional `weight` removes a fallback that is never reached.
 */
export interface WeighedConformetryDifference extends ConformetryDifference {
  readonly weight: number;
}

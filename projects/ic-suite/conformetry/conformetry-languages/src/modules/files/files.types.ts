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

/** Existence-pass findings; the total counts every declared file. */
export interface FilesCheckResult {
  readonly fileResults: ValidationFileResult[];
  /** One requirement per file the matched templates declare. */
  readonly totalWeight: number;
}

/** A conformance error this pass always weighs. */
export interface WeighedConformetryDifference extends ConformetryDifference {
  readonly weight: number;
}

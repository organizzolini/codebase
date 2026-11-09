// ♟️ Constants

import ts from "typescript";

/** How types render in signatures. Aliases are kept by name, since `MeasureArguments` says more in one word than its expansion. */
export const SIGNATURE_FORMAT_FLAGS =
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

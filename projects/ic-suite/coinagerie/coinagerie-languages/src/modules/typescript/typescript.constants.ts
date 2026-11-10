// ♟️ Constants

import ts from "typescript";

/**
 * How each TypeScript and JavaScript extension is parsed. JavaScript goes
 * through the same compiler, reading JSX in every file the way bundlers do.
 */
export const TYPESCRIPT_SCRIPT_KINDS: ReadonlyMap<string, ts.ScriptKind> =
  new Map([
    [".cjs", ts.ScriptKind.JS],
    [".cts", ts.ScriptKind.TS],
    [".js", ts.ScriptKind.JS],
    [".jsx", ts.ScriptKind.JSX],
    [".mjs", ts.ScriptKind.JS],
    [".mts", ts.ScriptKind.TS],
    [".ts", ts.ScriptKind.TS],
    [".tsx", ts.ScriptKind.TSX],
  ]);

/**
 * Declarations whose name may be quoted. A quoted name here is a key and counts
 * as an identifier; other string literals are text.
 */
export const QUOTABLE_NAME_OWNER_KINDS: ReadonlySet<ts.SyntaxKind> = new Set([
  ts.SyntaxKind.EnumMember,
  ts.SyntaxKind.GetAccessor,
  ts.SyntaxKind.MethodDeclaration,
  ts.SyntaxKind.MethodSignature,
  ts.SyntaxKind.PropertyAssignment,
  ts.SyntaxKind.PropertyDeclaration,
  ts.SyntaxKind.PropertySignature,
  ts.SyntaxKind.SetAccessor,
]);

/**
 * Every reserved or contextual keyword the compiler knows, lowercased. Read
 * from its keyword range, so the list cannot fall behind.
 */
export const TYPESCRIPT_KEYWORDS: string[] = Array.from(
  { length: ts.SyntaxKind.LastKeyword - ts.SyntaxKind.FirstKeyword + 1 },
  (_unused, offset) => ts.tokenToString(ts.SyntaxKind.FirstKeyword + offset),
)
  .filter((keyword): keyword is string => keyword !== undefined)
  .reduce<string[]>((sorted, keyword) => {
    // Inserted in order rather than sorted afterwards: `toSorted` needs a
    // library newer than every project that typechecks this file reads.
    const index = sorted.findIndex((existing) => existing > keyword);
    sorted.splice(index === -1 ? sorted.length : index, 0, keyword);
    return sorted;
  }, []);

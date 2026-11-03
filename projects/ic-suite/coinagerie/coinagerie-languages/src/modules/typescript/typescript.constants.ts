// ♟️ Constants

import ts from "typescript";

/**
 * How each TypeScript and JavaScript extension is parsed.
 *
 * JavaScript is parsed by the same compiler, which reads JSX in every
 * JavaScript file the way bundlers do.
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
 * Declarations whose name may be written as a quoted string.
 *
 * A quoted name here is a key — `{ "quoted-key": 1 }`, `enum E { "Member" }`
 * — and counts as an identifier. Every other string literal is text, and
 * contributes nothing.
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
